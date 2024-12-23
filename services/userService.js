const User = require('../models/mongoDBModels');

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
