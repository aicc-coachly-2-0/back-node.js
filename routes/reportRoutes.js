const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// 도메인별 신고 접수
router.post('/reports/:domain', reportController.createReport);

// 도메인별 신고 조회 (목록)
router.get('/reports/:domain', reportController.getReportsByDomain);

// 특정 신고 조회
router.get('/reports/:domain/:report_id', reportController.getReport);

// 신고 처리 (관리자)
router.put('/reports/:domain/:report_id', reportController.processReport);

// 신고 처리 내역 조회
router.get('/reports/managements', reportController.getReportManagements);

module.exports = router;
