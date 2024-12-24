const feedService = require('../services/feedService');

exports.createFeed = async (req, res, next) => {
  try {
    const feed = await feedService.createFeed(req.body);
    res.status(201).json({ message: 'Feed created successfully', feed });
  } catch (error) {
    next(error);
  }
};

exports.createFeedComment = async (req, res, next) => {
  try {
    const comment = await feedService.createFeedComment(req.body);
    res.status(201).json({ message: 'Comment created successfully', comment });
  } catch (error) {
    next(error);
  }
};

exports.getAllFeeds = async (req, res, next) => {
  try {
    const feeds = await feedService.getAllFeeds();
    res.status(200).json({ feeds });
  } catch (error) {
    next(error);
  }
};

exports.getFeedsByUser = async (req, res, next) => {
  try {
    const feeds = await feedService.getFeedsByUser(req.params.user_number);
    res.status(200).json({ feeds });
  } catch (error) {
    next(error);
  }
};

exports.getCommentsByFeed = async (req, res, next) => {
  try {
    const comments = await feedService.getCommentsByFeed(
      req.params.feed_number
    );
    res.status(200).json({ comments });
  } catch (error) {
    next(error);
  }
};

exports.updateFeed = async (req, res, next) => {
  try {
    const updatedFeed = await feedService.updateFeed(
      req.params.feed_number,
      req.body
    );
    res.status(200).json({ message: 'Feed updated successfully', updatedFeed });
  } catch (error) {
    next(error);
  }
};

exports.deleteFeed = async (req, res, next) => {
  try {
    await feedService.deleteFeed(req.params.feed_number);
    res.status(200).json({ message: 'Feed deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteFeedComment = async (req, res, next) => {
  try {
    await feedService.deleteFeedComment(req.params.feed_comment_number);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
