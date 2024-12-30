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

// 신고당한 횟수를 보기위해선 쿼리문의 약간의 추가가 필요 
// 신고 카테고리를 위해서는 유저가 신고시 카테고리 저장할 수 있는 칼럼이 필요