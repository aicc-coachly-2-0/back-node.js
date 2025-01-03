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

router.get('/likes/:type/:id', userController.getLikesCount);

// 상태별 유저 조회 (선택적 상태 필터링, status를 쿼리 파라미터로)
router.get('/users', userController.getUsers);

// ID 또는 이름, 번호로 유저 검색
router.get('/search', userController.searchUsers);

// 사용자 정보 수정 라우트
router.put(
  '/update',
  authMiddleware.authenticateToken,
  userController.updateUser
);

module.exports = router;
