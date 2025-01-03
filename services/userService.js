const User = require('../models/mongoDBModels');
const userModel = require('../models/userModel');

exports.createMongoUser = async (userData) => {
  const newUser = new User({
    user_number: userData.user_number, // PostgreSQL에서 받은 usernumber
    liked_posts: [],
    liked_feeds: [],
    liked_post_comments: [],
    liked_feed_comments: [],
    following_users: [],
    followers: [],
    blocked_users: [],
    mission_points: [],
    total_points: 0,
    profile_picture: userData.profile_picture || '',
    nickname: userData.nickname,
    bio: '',
    profile_picture_updated_at: userData.profile_picture ? new Date() : null,
    nickname_updated_at: new Date(),
    bio_updated_at: null,
  });

  return await newUser.save();
};

exports.followUser = async (currentUser, targetUserId) => {
  await User.updateOne(
    { user_number: currentUser },
    { $addToSet: { following_users: targetUserId } }
  );
  await User.updateOne(
    { user_number: targetUserId },
    { $addToSet: { followers: currentUser } }
  );
};

exports.unfollowUser = async (currentUser, targetUserId) => {
  await User.updateOne(
    { user_number: currentUser },
    { $pull: { following_users: targetUserId } }
  );
  await User.updateOne(
    { user_number: targetUserId },
    { $pull: { followers: currentUser } }
  );
};

exports.blockUser = async (currentUser, targetUserId) => {
  await User.updateOne(
    { user_number: currentUser },
    { $addToSet: { blocked_users: targetUserId } }
  );
};

exports.unblockUser = async (currentUser, targetUserId) => {
  await User.updateOne(
    { user_number: currentUser },
    { $pull: { blocked_users: targetUserId } }
  );
};

exports.likePost = async (currentUser, postId) => {
  await User.updateOne(
    { user_number: currentUser },
    { $addToSet: { liked_posts: postId } }
  );
};

exports.unlikePost = async (currentUser, postId) => {
  await User.updateOne(
    { user_number: currentUser },
    { $pull: { liked_posts: postId } }
  );
};

exports.likeFeed = async (currentUser, feedId) => {
  await User.updateOne(
    { user_number: currentUser },
    { $addToSet: { liked_feeds: feedId } }
  );
};

exports.unlikeFeed = async (currentUser, feedId) => {
  await User.updateOne(
    { user_number: currentUser },
    { $pull: { liked_feeds: feedId } }
  );
};

exports.likeComment = async (currentUser, commentId) => {
  await User.updateOne(
    { user_number: currentUser },
    { $addToSet: { liked_feed_comments: commentId } }
  );
};

exports.unlikeComment = async (currentUser, commentId) => {
  await User.updateOne(
    { user_number: currentUser },
    { $pull: { liked_feed_comments: commentId } }
  );
};

exports.countLikesForPost = async (postId) => {
  return await User.countDocuments({ liked_posts: postId }); // MongoDB에서 좋아요 수 계산
};

exports.countLikesForFeed = async (feedId) => {
  return await User.countDocuments({ liked_feeds: feedId }); // MongoDB에서 좋아요 수 계산
};

exports.countLikesForComment = async (commentId) => {
  return await User.countDocuments({ liked_post_comments: commentId }); // MongoDB에서 좋아요 수 계산
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

// 상태별 유저 조회
exports.getUsersByStatus = async (status) => {
  // status가 유효한 값인지를 확인
  const validStatuses = ['active', 'inactive', 'deleted', 'suspended'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  return await userModel.findUsersByStatus(status);
};

// 상태별 유저 조회 (선택적 필터링)
exports.getUsers = async ({ status }) => {
  if (status) {
    return this.getUsersByStatus(status);
  } else {
    return await userModel.findAllUsers(); // 상태 필터링 없이 모든 유저 조회
  }
};

// 사용자 정보 업데이트 
exports.updateUser = async (user_id, role, fieldsToUpdate) => {
  // role에 따라 수정 가능한 필드 제한
  let allowedFields = {};

  if (role === 'admin') {
    // 관리자는 모든 필드 수정 가능
    allowedFields = { ...fieldsToUpdate };
  } else if (role === 'user') {
    // 사용자는 user_email, user_phone만 수정 가능
    allowedFields = { user_email: fieldsToUpdate.user_email, user_phone: fieldsToUpdate.user_phone };
  }

  // 모델에 전달할 데이터를 준비하여 업데이트
  try {
    const updatedUser = await userModel.updateUser(user_id, allowedFields);
    return updatedUser;
  } catch (error) {
    throw error;
  }
};