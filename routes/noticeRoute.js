const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');

// 공지글 작성 (사진 포함)
router.post('/notices', noticeController.createNoticeWithImages);

// 공지글 수정
router.put('/notices/:notice_number', noticeController.updateNotice);

// 특정 공지글 조회 (사진 포함)
router.get('/notices/:notice_number', noticeController.getNoticeWithImages);

// 공지글 전체 조회
router.get('/notices', noticeController.getAllNotices);

// 활성 상태의 공지글 조회
router.get('/notices/active', noticeController.getActiveNotices);

module.exports = router;
