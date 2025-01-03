const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload, uploadFileToFTP } = require('../middlewares/fileUpload');

// 피드 작성
router.post('/', upload, uploadFileToFTP, feedController.createFeed);

// 피드 댓글 작성
router.post('/comment', feedController.createFeedComment);

// 전체 피드 조회
router.get('/', feedController.getAllFeeds);

// 특정 유저 피드 조회
router.get('/users/:user_number', feedController.getFeedsByUser);

// 피드 댓글 조회
router.get('/:feed_number/comments', feedController.getCommentsByFeed);

// 피드 수정 (작성자 또는 관리자만 가능)
router.patch(
  '/:feed_number',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeFeedOwnerOrAdmin,
  upload,
  uploadFileToFTP,
  feedController.updateFeed
);

// 피드 삭제
router.delete(
  '/:feed_number',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeFeedOwnerOrAdmin,
  feedController.deleteFeed
);

// 피드 댓글 삭제
router.delete(
  '/comments/:feed_comment_number',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeFeedCommentOwnerOrAdmin,
  feedController.deleteFeedComment
);

module.exports = router;
