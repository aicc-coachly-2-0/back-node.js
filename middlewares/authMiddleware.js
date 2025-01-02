const jwt = require('jsonwebtoken');
const config = require('../config/config');
const authModel = require('../models/authModel');
const postModel = require('../models/postModel'); // 게시글 모델
const feedModel = require('../models/feedModel'); // 피드 모델

// JWT 토큰 인증
exports.authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer 토큰에서 추출

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, config.auth.jwtSecret);

    // 기본적으로 유저로 설정
    req.user = {
      user_number: verified.user_number,
      user_id: verified.user_id,
      username: verified.username,
      role: verified.isAdmin ? 'admin' : 'user', // admin 여부에 따라 역할 설정
      isAdmin: verified.isAdmin || false,
      admin_id: verified.isAdmin ? verified.user_id : null, // 관리자일 경우 admin_id 설정
    };

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// 관리자 권한 인증
exports.authenticateAdmin = async (req, res, next) => {
  const { isAdmin, admin_id } = req.user;

  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  // 관리자 정보를 가져와 확인
  try {
    const admin = await authModel.findAdminById(admin_id); // 관리자 테이블 조회
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    req.user = {
      position: admin.position,  // 관리자 직위
      role: 'admin'              // 역할 설정
    };

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 공통 권한 확인 함수
const authorizeOwnerOrAdmin = async ({
  getResource,
  resourceId,
  userId,
  isAdmin,
}) => {
  const resource = await getResource(resourceId);

  if (!resource) {
    return { error: "Resource not found", status: 404 };
  }

  if (resource.user_number !== userId && !isAdmin) {
    return { error: "Access denied", status: 403 };
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
    isAdmin,
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
    isAdmin,
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
    isAdmin,
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
    isAdmin,
  });

  if (result.error) {
    return res.status(result.status).json({ message: result.error });
  }

  next();
};
