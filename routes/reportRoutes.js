const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// 도메인별 신고 접수
router.post("/:domain", reportController.createReport);

// 도메인별 신고 조회 (목록)
router.get("/:domain", reportController.getReportsByDomain);

// 특정 사용자의 신고 내역과 신고 수 조회
router.get("/user/:user_number", reportController.getReportsForUser);

// 특정 유저가 한 신고 조회 라우터
router.get("/my_reports", reportController.getReportsMadeByUser);

// 특정 신고 조회
router.get("/:domain/:report_id", reportController.getReport);

// 신고 처리 (관리자)
router.put("/:domain/:report_id", reportController.processReport);

// 신고 처리 내역 조회
// router.get("/managements", reportController.getReportManagements);

module.exports = router;
