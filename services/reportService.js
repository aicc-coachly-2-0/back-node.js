// reportService
const reportModel = require('../models/reportModel');

// 도메인별 신고 접수 및 처리 내역 자동 생성
exports.createReport = async (domain, reportData) => {
  return await reportModel.insertReport(domain, reportData); // 신고 접수 후 처리 내역 자동 생성
};

// 도메인별 신고 조회 (목록)
exports.getReportsByDomain = async (domain, filters) => {
  return await reportModel.findReportsByDomain(domain, filters);
};

// 특정 사용자가 받은 신고 내역과 신고 수 조회
exports.getReportsForUser = async (user_number) => {
  return await reportModel.findReportsForUser(user_number);
};

// 특정 유저가 한 신고 조회
exports.getReportsMadeByUser = async (user_number) => {
  return await reportModel.findReportsMadeByUser(user_number);
};

// 특정 신고 조회
exports.getReport = async (domain, reportId) => {
  return await reportModel.findReportById(domain, reportId);
};

// 신고 처리 및 블랙리스트 기록 
exports.processReport = async (domain, reportId, { state, admin_number, report_content }) => {
  try {
    // 신고 내역 조회
    const report = await reportModel.findReportById(domain, reportId);

    let ban_until = null;

    // 영구 정지 처리
    if (state === 'permanent-ban') {
      ban_until = null;
      // 블랙리스트에 영구 정지 기록
      await reportModel.insertToBlacklist(report.reported_user_number, report_content); // 블랙리스트에 기록
    }
    // 일주일 정지 처리
    else if (state === 'suspended') {
      ban_until = new Date();
      ban_until.setDate(ban_until.getDate() + 7); // 현재 날짜로부터 7일 후
    }

    // 신고 처리 내역 업데이트
    const updatedReport = await reportModel.updateReportState(domain, reportId, {
      state,
      admin_number,
      report_content,
    });

    // 신고 처리 내역 기록
    await reportModel.insertReportManagement({
      report_type: domain,
      report_id: reportId,
      admin_number,
      report_content,
      state,
      ban_until,
    });

    // 한 달 이내 'suspended' 상태 신고가 3개 이상인 경우 블랙리스트에 추가
    await checkForBlacklisting(report.reported_user_number);

    return updatedReport;  // 처리된 신고 반환
  } catch (error) {
    console.error('Error in processReport service:', error.message);
    throw error; // 에러 발생 시 호출하는 쪽으로 에러 전달
  }
};



// 신고 처리 내역 조회
exports.getReportManagements = async (state) => {
  return await reportModel.findReportManagements({ state });
};

// 한 달 이내 'suspended' 상태 신고가 3개 이상인 경우 블랙리스트에 추가
const checkForBlacklisting = async (user_number) => {
  try {
    // 한 달 전 날짜를 구함
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // 'suspended' 상태인 신고 중 한 달 이내 신고가 3개 이상인 경우 확인
    const suspendedReports = await reportModel.findReportsForUser(user_number, { state: 'suspended' });

    // 한 달 이내 'suspended' 상태 신고가 3개 이상인지 확인
    const recentSuspendedReports = suspendedReports.filter(report => new Date(report.created_at) > oneMonthAgo);

    if (recentSuspendedReports.length >= 3) {
      // 한 달 이내 'suspended' 상태 신고가 3개 이상이면 블랙리스트에 추가
      await reportModel.insertToBlacklist(user_number, 'Suspended more than 3 times in a month');
    }
  } catch (error) {
    console.error('Error checking for blacklisting:', error.message);
    throw error; // 에러 발생 시 호출하는 쪽으로 에러 전달
  }
};

// 블랙리스트 조회
exports.getBlacklist = async (filters) => {
  try {
    return await reportModel.findBlacklist(filters); // 모델에서 블랙리스트를 조회
  } catch (error) {
    console.error('Error in getBlacklist service:', error.message);
    throw error; // 에러 발생 시 호출하는 쪽으로 에러 전달
  }
};