const axios = require('axios');
const bcrypt = require('bcrypt');
const { postgreSQL, connectFTP } = require('../config/database');
const authModel = require('../models/authModel');
const userService = require('./userService');
const config = require('../config/config');

exports.createUser = async (userData, remoteImageUrl) => {
  const client = await postgreSQL.connect();
  try {
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash(userData.user_pw, 10);
    const sanitizedPhone = userData.user_phone.replace(/\D/g, '');

    const profilePictureUrl = await uploadImageToFTP(
      userData.user_id,
      remoteImageUrl
    );

    const createdUser = await authModel.createUser({
      user_id: userData.user_id,
      user_name: userData.user_name,
      user_email: userData.user_email,
      user_pw: hashedPassword,
      user_phone: sanitizedPhone,
      user_date_of_birth: userData.user_date_of_birth,
      user_gender: userData.user_gender,
      profile_picture: profilePictureUrl,
    });

    await client.query('COMMIT');
    return createdUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

async function uploadImageToFTP(userId, remoteImageUrl) {
  const ftpClient = await connectFTP();
  try {
    const response = await axios({
      url: remoteImageUrl,
      method: 'GET',
      responseType: 'stream',
    });

    const remoteImagePath = `/kochiri/profile/${userId}-${Date.now()}.jpg`; // 경로에 /kochiri/profile 추가
    await ftpClient.uploadFrom(response.data, remoteImagePath);

    // 회원가입 시 반환 URL에 /kochiri/profile 포함
    return `${config.ftp.baseUrl}${remoteImagePath}`;
  } catch (error) {
    console.error('FTP 업로드 실패:', error.message);
    throw new Error('FTP 업로드 실패');
  } finally {
    ftpClient.close();
  }
}

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
