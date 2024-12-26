const feedModel = require('../models/feedModel');

exports.createFeed = async (feedData) => await feedModel.createFeed(feedData);
exports.createFeedComment = async (commentData) =>
  await feedModel.createFeedComment(commentData);
exports.getAllFeeds = async () => await feedModel.getAllFeeds();
exports.getFeedsByUser = async (user_number) =>
  await feedModel.getFeedsByUser(user_number);
exports.getCommentsByFeed = async (feed_number) =>
  await feedModel.getCommentsByFeed(feed_number);
exports.updateFeed = async (feed_number, feedData) =>
  await feedModel.updateFeed(feed_number, feedData);
exports.deleteFeed = async (feed_number) =>
  await feedModel.deleteFeed(feed_number);
exports.deleteFeedComment = async (feed_comment_number) =>
  await feedModel.deleteFeedComment(feed_comment_number);
