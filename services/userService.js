const User = require('../models/mongoDBModels');
const userModel = require('../models/userModel');

const updateUserField = async (userNumber, field, value, action) => {
  const update =
    action === 'add'
      ? { $addToSet: { [field]: value } }
      : { $pull: { [field]: value } };
  return await User.updateOne({ user_number: userNumber }, update);
};

const updateLike = async (currentUser, type, id, action) => {
  const field = `liked_${type}s`;
  const update =
    action === 'add'
      ? { $addToSet: { [field]: id } }
      : { $pull: { [field]: id } };
  return await User.updateOne({ user_number: currentUser }, update);
};

exports.followUser = async (currentUser, targetNumber) => {
  await updateUserField(currentUser, 'following_users', targetNumber, 'add');
  await updateUserField(targetNumber, 'followers', currentUser, 'add');
};

exports.unfollowUser = async (currentUser, targetNumber) => {
  await updateUserField(currentUser, 'following_users', targetNumber, 'remove');
  await updateUserField(targetNumber, 'followers', currentUser, 'remove');
};

exports.blockUser = async (currentUser, targetNumber) => {
  await updateUserField(currentUser, 'blocked_users', targetNumber, 'add');
};

exports.unblockUser = async (currentUser, targetNumber) => {
  await updateUserField(currentUser, 'blocked_users', targetNumber, 'remove');
};

exports.likePost = async (currentUser, postNumber) => {
  await updateLike(currentUser, 'post', postNumber, 'add');
};

exports.unlikePost = async (currentUser, postNumber) => {
  await updateLike(currentUser, 'post', postNumber, 'remove');
};

exports.likeFeed = async (currentUser, feedId) => {
  await updateLike(currentUser, 'feed', feedId, 'add');
};

exports.unlikeFeed = async (currentUser, feedId) => {
  await updateLike(currentUser, 'feed', feedId, 'remove');
};

exports.likeComment = async (currentUser, commentId) => {
  await updateLike(currentUser, 'feed_comment', commentId, 'add');
};

exports.unlikeComment = async (currentUser, commentId) => {
  await updateLike(currentUser, 'feed_comment', commentId, 'remove');
};

exports.countLikesForType = async (type, id) => {
  const field = `liked_${type}s`;
  return await User.countDocuments({ [field]: id });
};

exports.countLikesForType = async (type, id) => {
  const field = `liked_${type}s`;
  return await User.countDocuments({ [field]: id });
};

/// 유저 검색
exports.searchUsers = async (searchTerm) => {
  // 전화번호 형식인지 확인 (숫자만 포함된 경우)
  const isPhoneNumber = /^\d+$/.test(searchTerm);

  if (isPhoneNumber) {
    // 전화번호로 검색
    return await userModel.findUsersByPhoneNumber(searchTerm);
  } else {
    // 아이디나 이름으로 검색
    return await userModel.findUsersByIdOrName(searchTerm);
  }
};

// 상태별 유저 조회 (선택적 필터링)
exports.getUsers = async ({ status }) => {
  if (status) {
    // 상태가 주어지면 상태로 유저 조회
    return await userModel.findUsersByStatus(status);
  } else {
    // 상태가 없으면 모든 유저 조회
    return await userModel.findAllUsers();
  }
};


// 사용자 정보 업데이트 
exports.updateUser = async (user_number, fieldsToUpdate, role) => {
  // role에 따라 수정 가능한 필드 제한
  console.log("Role:", role);
  console.log("Fields to update before filtering:", fieldsToUpdate);
  let allowedFields = {};

  if (role === 'admin') {
    // 관리자는 모든 필드 수정 가능
    allowedFields = { ...fieldsToUpdate };
  } else if (role !== 'admin') {
    // 사용자는 user_email, user_phone만 수정 가능
    allowedFields = {
      user_email: fieldsToUpdate.user_email,
      user_phone: fieldsToUpdate.user_phone,
    };
  }
  console.log("Allowed fields to update:", allowedFields);

  // 모델에 전달할 데이터를 준비하여 업데이트
  try {
    const updatedUser = await userModel.updateUser(user_number, allowedFields);
    return updatedUser;
  } catch (error) {
    throw error;
  }
};
