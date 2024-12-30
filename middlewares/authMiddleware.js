const jwt = require('jsonwebtoken');
const config = require('../config/config');
const postModel = require('../models/postModel'); // 게시글 모델
const feedModel = require('../models/feedModel'); // 피드 모델

exports.authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer 토큰에서 추출

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, config.auth.jwtSecret);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

exports.authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, config.auth.jwtSecret);
    if (!verified.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// 게시글 소유자 또는 관리자 권한 확인
exports.authorizePostOwnerOrAdmin = async (req, res, next) => {
  const { user_id, isAdmin } = req.user;
  const { post_number } = req.params;

  try {
    const post = await postModel.getPostById(post_number);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_number !== user_id && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 게시글 댓글 소유자 또는 관리자 권한 확인
exports.authorizePostCommentOwnerOrAdmin = async (req, res, next) => {
  const { user_id, isAdmin } = req.user;
  const { post_comment_number } = req.params;

  try {
    const comment = await postModel.getCommentById(post_comment_number);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user_number !== user_id && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 피드 소유자 또는 관리자 권한 확인
exports.authorizeFeedOwnerOrAdmin = async (req, res, next) => {
  const { feed_number } = req.params;
  const user_id = req.user.user_id;

  try {
    const feed = await feedModel.getFeedById(feed_number);

    if (!feed) {
      return res.status(404).json({ message: 'Feed not found' });
    }

    if (feed.user_number !== user_id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 피드 댓글 소유자 또는 관리자 권한 확인
exports.authorizeFeedCommentOwnerOrAdmin = async (req, res, next) => {
  const { feed_comment_number } = req.params;
  const user_id = req.user.user_id;

  try {
    const comment = await feedModel.getCommentById(feed_comment_number);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user_number !== user_id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
