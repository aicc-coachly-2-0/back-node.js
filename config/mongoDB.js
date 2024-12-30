const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_number: { type: String, required: true },
  liked_posts: { type: Array, default: [] },
  liked_feeds: { type: Array, default: [] },
  liked_post_comments: { type: Array, default: [] },
  liked_feed_comments: { type: Array, default: [] },
  following_users: { type: Array, default: [] },
  followers: { type: Array, default: [] },
  blocked_users: { type: Array, default: [] },
  mission_points: { type: Array, default: [] },
  total_points: { type: Number, default: 0 },
  profile_picture: { type: String, default: '' },
  nickname: { type: String, default: '' },
  bio: { type: String, default: '' },
  profile_picture_updated_at: { type: Date, default: null },
  nickname_updated_at: { type: Date, default: null },
  bio_updated_at: { type: Date, default: null },
});

module.exports = mongoose.model('User', userSchema);
