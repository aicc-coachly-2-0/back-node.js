const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const authMiddleware = require('../middlewares/authMiddleware');

// 피드 작성
router.post('/feed', feedController.createFeed);

// 피드 댓글 작성
router.post('/feed-comment', feedController.createFeedComment);

// 전체 피드 조회
router.get('/feeds', feedController.getAllFeeds);

// 특정 유저 피드 조회
router.get('/users/:user_number/feeds', feedController.getFeedsByUser);

// 피드 댓글 조회
router.get('/feeds/:feed_number/comments', feedController.getCommentsByFeed);

// 피드 수정 (작성자 또는 관리자만 가능)
router.patch(
  '/feeds/:feed_number',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeFeedOwnerOrAdmin,
  feedController.updateFeed
);

// 피드 삭제
router.delete(
  '/feeds/:feed_number',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeFeedOwnerOrAdmin,
  feedController.deleteFeed
);

// 피드 댓글 삭제
router.delete(
  '/feed-comments/:feed_comment_number',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeFeedCommentOwnerOrAdmin,
  feedController.deleteFeedComment
);

module.exports = router;
