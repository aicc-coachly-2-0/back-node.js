const feedModel = require('../models/feedModel');

exports.createFeed = async (feedData) => {
  return await feedModel.createFeed(feedData);
};

exports.createFeedComment = async (commentData) => {
  return await feedModel.createFeedComment(commentData);
};

exports.getAllFeeds = async () => {
  return await feedModel.getAllFeeds();
};

exports.getFeedsByUser = async (user_number) => {
  return await feedModel.getFeedsByUser(user_number);
};

exports.getCommentsByFeed = async (feed_number) => {
  return await feedModel.getCommentsByFeed(feed_number);
};

exports.updateFeed = async (feed_number, feedData) => {
  return await feedModel.updateFeed(feed_number, feedData);
};

exports.deleteFeed = async (feed_number) => {
  return await feedModel.deleteFeed(feed_number);
};

exports.deleteFeedComment = async (feed_comment_number) => {
  return await feedModel.deleteFeedComment(feed_comment_number);
};
