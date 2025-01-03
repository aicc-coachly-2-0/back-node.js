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

// 상태에 따른 전체 유저 조회
exports.getUsers = async ({ status }) => {
  const users = status
    ? await userModel.findUsersByStatus(status)
    : await userModel.findAllUsers();

  const enrichedUsers = await Promise.all(
    users.map(async (user) => {
      const additionalData = await User.findOne({
        user_number: user.user_number,
      });
      return { ...user, ...additionalData?._doc };
    })
  );

  return enrichedUsers;
};

// 유저 검색
exports.searchUsers = async (searchTerm) => {
  const users = await userModel.searchUsers(searchTerm);

  const enrichedUsers = await Promise.all(
    users.map(async (user) => {
      const additionalData = await User.findOne({
        user_number: user.user_number,
      });
      return { ...user, ...additionalData?._doc };
    })
  );

  return enrichedUsers;
};

// 단일 유저 조회
exports.getUserByNumber = async (user_number) => {
  const user = await userModel.findUserByNumber(user_number);

  if (!user) {
    throw new Error('User not found');
  }

  const additionalData = await User.findOne({ user_number });
  return { ...user, ...additionalData?._doc };
};

// 사용자 정보 업데이트
exports.updateUser = async (user_number, fieldsToUpdate, role) => {
  let allowedFields = {};

  if (role === 'admin') {
    allowedFields = { ...fieldsToUpdate };
  } else {
    allowedFields = {
      user_email: fieldsToUpdate.user_email,
      user_phone: fieldsToUpdate.user_phone,
    };
  }

  try {
    const existingUser = await userModel.findUserByNumber(user_number);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const finalFieldsToUpdate = { ...existingUser, ...allowedFields };

    const updatedUser = await userModel.updateUser(
      user_number,
      finalFieldsToUpdate
    );

    if (fieldsToUpdate.profilePicture) {
      await User.updateOne(
        { user_number },
        { $set: { profile_picture: fieldsToUpdate.profilePicture } },
        { upsert: true }
      );
    }

    return updatedUser;
  } catch (error) {
    throw error;
  }
};
