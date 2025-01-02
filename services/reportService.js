const reportModel = require('../models/reportModel');

// 도메인별 신고 접수
exports.createReport = async (domain, reportData) => {
  return await reportModel.insertReport(domain, reportData);
};

// 도메인별 신고 조회 (목록)
exports.getReportsByDomain = async (domain, filters) => {
  return await reportModel.findReportsByDomain(domain, filters);
};

// 특정 사용자의 신고 내역과 신고 수 조회
exports.getReportsForUser = async (userNumber) => {
  return await reportModel.findReportsForUser(userNumber);
};


// 특정 신고 조회
exports.getReport = async (domain, reportId) => {
  return await reportModel.findReportById(domain, reportId);
};

// 신고 처리 (관리자)
exports.processReport = async (domain, reportId, processData) => {
  return await reportModel.updateReportState(domain, reportId, processData);
};

// 신고 처리 내역 조회
exports.getReportManagements = async (filters) => {
  return await reportModel.findReportManagements(filters);
};
