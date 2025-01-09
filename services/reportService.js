const reportModel = require('../models/reportModel');

// 도메인별 신고 접수
exports.createReport = async (domain, reportData) => {
  return await reportModel.insertReport(domain, reportData);
};

// 도메인별 신고 조회 (목록)
exports.getReportsByDomain = async (domain, filters) => {
  return await reportModel.findReportsByDomain(domain, filters);
};

// 특정 사용자가 받은 신고 내역과 신고 수 조회(특정도메인)
exports.getReportsForUser = async (user_number, domain) => {
  if (!domain) {
    // domain이 없으면 모든 도메인에서 조회
    return await reportModel.findAllReportsForUser(user_number);
  }
  // 특정 도메인에서만 조회
  return await reportModel.findReportsForUser(user_number, domain);
};

// 특정 사용자가 받은 신고 내역과 신고 수 조회(전체도메인)
exports.getAllReportsForUser = async (user_number) => {
  return await reportModel.findAllReportsForUser(user_number);
};

// 특정 유저가 한 신고 조회
exports.getReportsMadeByUser = async (user_number) => {
  return await reportModel.findReportsMadeByUser(user_number);
};

// 특정 신고 조회
exports.getReport = async (domain, report_number) => {
  return await reportModel.findReportById(domain, report_number);
};

// 신고 처리 상태 업데이트
exports.updateReportState = async (domain, report_number, state, admin_number, report_content, ban_until) => {
  return await reportModel.insertOrUpdateReportManagement(domain, report_number, state, admin_number, report_content, ban_until);
}

// 신고 처리 내역 조회 (특정 신고에 대한 처리 내역)
exports.getReportManagementByReportNumber = async (domain, report_number) => {
  return await reportModel.findReportManagementByReportNumber(domain, report_number);
};