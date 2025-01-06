// routes/userRoute.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload, uploadFileToFTP } = require('../middlewares/fileUpload');

// 팔로우, 언팔로우
router.post(
  '/:user_number/follow',
  authMiddleware.authenticateToken,
  userController.followUser
);
router.post(
  '/:user_number/unfollow',
  authMiddleware.authenticateToken,
  userController.unfollowUser
);

// 차단, 차단 해제
router.post(
  '/:user_number/block',
  authMiddleware.authenticateToken,
  userController.blockUser
);
router.post(
  '/:user_number/unblock',
  authMiddleware.authenticateToken,
  userController.unblockUser
);

// 좋아요, 좋아요 취소
router.post(
  '/:type/:id/like',
  authMiddleware.authenticateToken,
  userController.likeContent
);
router.post(
  '/:type/:id/unlike',
  authMiddleware.authenticateToken,
  userController.unlikeContent
);

// 좋아요 수 조회
router.get('/likes/:type/:id', userController.getLikesCount);

// 상태별 유저 조회 (선택적 상태 필터링, status를 쿼리 파라미터로)
router.get('/', userController.getUsers);

// ID 또는 이름, 번호로 유저 검색
router.get('/search', userController.searchUsers);

// 특정 유저 조회
router.get('/:user_number', userController.getUserByNumber);

// 사용자 정보 수정 라우트
router.put(
  '/:user_number',
  authMiddleware.authenticateToken,
  upload, // Multer로 파일 처리
  uploadFileToFTP,
  userController.updateUser
);

module.exports = router;
