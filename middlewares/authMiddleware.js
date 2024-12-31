const jwt = require('jsonwebtoken');
const config = require('../config/config');
const postModel = require('../models/postModel'); // 게시글 모델
const feedModel = require('../models/feedModel'); // 피드 모델

// JWT 토큰 인증
exports.authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer 토큰에서 추출

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, config.auth.jwtSecret);

    // 기본적으로 유저로 설정
    req.user = {
      user_id: verified.user_id,
      username: verified.username,
      isAdmin: verified.isAdmin || false,
      role: 'user' // 기본 역할을 'user'로 설정
    };

    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};


// 관리자 권한 인증
exports.authenticateAdmin = (req, res, next) => {
  // authenticateToken 미들웨어에서 이미 req.user 설정됨
  const { isAdmin } = req.user;

  if (!isAdmin) {
    // 관리자가 아니면 기본 역할 유지 (user)
    return next(); // 관리자 권한이 아니어도 접근을 허용
  }

  // 관리자라면 역할을 'admin'으로 변경
  req.user.role = 'admin';

  next();
};


// 공통 권한 확인 함수
const authorizeOwnerOrAdmin = async ({ getResource, resourceId, userId, isAdmin }) => {
  const resource = await getResource(resourceId);

  if (!resource) {
    return { error: 'Resource not found', status: 404 };
  }

  if (resource.user_number !== userId && !isAdmin) {
    return { error: 'Access denied', status: 403 };
  }

  return { error: null, status: 200 };
};

// 게시글 소유자 또는 관리자 권한 확인
exports.authorizePostOwnerOrAdmin = async (req, res, next) => {
  const { user_id, isAdmin } = req.user;
  const { post_number } = req.params;

  const result = await authorizeOwnerOrAdmin({
    getResource: postModel.getPostById,
    resourceId: post_number,
    userId: user_id,
    isAdmin
  });

  if (result.error) {
    return res.status(result.status).json({ message: result.error });
  }

  next();
};

// 게시글 댓글 소유자 또는 관리자 권한 확인
exports.authorizePostCommentOwnerOrAdmin = async (req, res, next) => {
  const { user_id, isAdmin } = req.user;
  const { post_comment_number } = req.params;

  const result = await authorizeOwnerOrAdmin({
    getResource: postModel.getCommentById,
    resourceId: post_comment_number,
    userId: user_id,
    isAdmin
  });

  if (result.error) {
    return res.status(result.status).json({ message: result.error });
  }

  next();
};

// 피드 소유자 또는 관리자 권한 확인
exports.authorizeFeedOwnerOrAdmin = async (req, res, next) => {
  const { user_id, isAdmin } = req.user;
  const { feed_number } = req.params;

  const result = await authorizeOwnerOrAdmin({
    getResource: feedModel.getFeedById,
    resourceId: feed_number,
    userId: user_id,
    isAdmin
  });

  if (result.error) {
    return res.status(result.status).json({ message: result.error });
  }

  next();
};

// 피드 댓글 소유자 또는 관리자 권한 확인
exports.authorizeFeedCommentOwnerOrAdmin = async (req, res, next) => {
  const { user_id, isAdmin } = req.user;
  const { feed_comment_number } = req.params;

  const result = await authorizeOwnerOrAdmin({
    getResource: feedModel.getCommentById,
    resourceId: feed_comment_number,
    userId: user_id,
    isAdmin
  });

  if (result.error) {
    return res.status(result.status).json({ message: result.error });
  }

  next();
};
