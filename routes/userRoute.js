// routes/userRoute.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// 팔로우, 언팔로우
router.post(
  '/:userId/follow',
  authMiddleware.authenticateToken,
  userController.followUser
);
router.post(
  '/:userId/unfollow',
  authMiddleware.authenticateToken,
  userController.unfollowUser
);

// 차단, 차단 해제
router.post(
  '/:userId/block',
  authMiddleware.authenticateToken,
  userController.blockUser
);
router.post(
  '/:userId/unblock',
  authMiddleware.authenticateToken,
  userController.unblockUser
);

// 좋아요
router.post(
  '/posts/:postId/like',
  authMiddleware.authenticateToken,
  userController.likePost
);
router.post(
  '/posts/:postId/unlike',
  authMiddleware.authenticateToken,
  userController.unlikePost
);
router.post(
  '/feeds/:feedId/like',
  authMiddleware.authenticateToken,
  userController.likeFeed
);
router.post(
  '/feeds/:feedId/unlike',
  authMiddleware.authenticateToken,
  userController.unlikeFeed
);
router.post(
  '/comments/:commentId/like',
  authMiddleware.authenticateToken,
  userController.likeComment
);
router.post(
  '/comments/:commentId/unlike',
  authMiddleware.authenticateToken,
  userController.unlikeComment
);

module.exports = router;
