const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// 도메인별 신고 접수
router.post('/reports/:domain', reportController.createReport);

// 도메인별 신고 조회 (목록)
router.get('/reports/:domain', reportController.getReportsByDomain);

// 특정 사용자의 신고 내역과 신고 수 조회
router.get('/reports/user/:user_number', reportController.getReportsForUser);

// 특정 유저가 한 신고 조회 라우터
router.get('/reports/made', userController.getReportsMadeByUser);

// 특정 신고 조회
router.get('/reports/:domain/:report_id', reportController.getReport);

// 신고 처리 (관리자)
router.put('/reports/:domain/:report_id', reportController.processReport);

// 신고 처리 내역 조회
router.get('/reports/managements', reportController.getReportManagements);

// 블랙리스트 조회
router.get('/blacklists', blacklistController.getBlacklist);

module.exports = router;

