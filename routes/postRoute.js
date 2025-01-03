// routes/postRoute.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

// 게시글 작성
router.post('/', postController.createPost);

// 게시글 댓글 작성
router.post('/comment', postController.createPostComment);

// 커뮤니티 종류 생성
router.post(
  '/communities',
  authMiddleware.authenticateAdmin,
  postController.createCommunity
);

// 커뮤니티 종류 조회
router.get('/communities', postController.getCommunities);

// 커뮤니티 별 전체게시글 조회
router.get(
  '/communities/:community_number',
  postController.getPostsByCommunity
);

// 유저별 게시글 조회
router.get('/users/:user_number', postController.getPostsByUser);

// 게시글 댓글 조회
router.get('/:post_number/comments', postController.getCommentsByPost);

// 게시글 수정
router.patch(
  '/:post_number',
  authMiddleware.authenticateToken,
  authMiddleware.authorizePostOwnerOrAdmin,
  postController.updatePost
);

// 게시글 삭제 (소프트 삭제)
router.delete(
  '/:post_number',
  authMiddleware.authenticateToken,
  authMiddleware.authorizePostOwnerOrAdmin,
  postController.deletePost
);

// 댓글 수정
router.patch(
  '/post-comments/:post_comment_number',
  authMiddleware.authenticateToken,
  authMiddleware.authorizePostCommentOwnerOrAdmin,
  postController.updateComment
);

// 댓글 삭제 (소프트 삭제)
router.delete(
  '/post-comments/:post_comment_number',
  authMiddleware.authenticateToken,
  authMiddleware.authorizePostCommentOwnerOrAdmin,
  postController.deleteComment
);

module.exports = router;
