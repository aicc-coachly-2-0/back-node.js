const reportService = require('../services/reportService');

// 도메인별 신고 접수
exports.createReport = async (req, res, next) => {
  try {
    const { domain } = req.params;
    const report = await reportService.createReport(domain, req.body);
    res.status(201).json({ message: 'Report created successfully', report });
  } catch (error) {
    next(error);
  }
};

// 도메인별 신고 조회 (목록)
exports.getReportsByDomain = async (req, res, next) => {
  try {
    const { domain } = req.params;
    const { state, report_category } = req.query; // 쿼리 파라미터에서 state와 report_category 가져옴
    const reports = await reportService.getReportsByDomain(domain, { state, report_category });
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

// 특정 사용자가 받은 신고 내역과 신고 수 조회
exports.getReportsForUser = async (req, res, next) => {
  try {
    const { user_number } = req.params;
    const { domain } = req.query; // 쿼리 파라미터로 도메인 필터링
    let reportData;

    if (domain) {
      reportData = await reportService.getReportsForUser(user_number, domain);
    } else {
      reportData = await reportService.getAllReportsForUser(user_number);
    }

    if (!reportData || reportData.length === 0) {
      return res.status(404).json({ message: 'No reports found for this user.' });
    }

    res.status(200).json(reportData);
  } catch (error) {
    next(error);
  }
};

// 특정 유저가 한 신고 조회
exports.getReportsMadeByUser = async (req, res, next) => {
  const { user_number } = req.params; 

  try {
    const reports = await reportService.getReportsMadeByUser(user_number);
    res.status(200).json({ message: 'Reports made by user retrieved successfully', data: reports });
  } catch (error) {
    next(error);
  }
};

// 특정 신고 조회
exports.getReport = async (req, res, next) => {
  try {
    const { domain, report_number } = req.params;
    const report = await reportService.getReport(domain, report_number);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

// 신고 처리 (관리자)
exports.processReport = async (req, res, next) => {
  try {
    const { domain, report_number } = req.params;
    const { state, admin_number, report_content, ban_until } = req.body;

    // ban_until이 없으면 처리일로부터 7일 뒤로 설정
    const resolutionDate = new Date();  // 현재 시간
    const banUntilDate = ban_until ? new Date(ban_until) : new Date(resolutionDate.setDate(resolutionDate.getDate() + 7));  // 7일 뒤 기본 설정

    // 신고 처리 상태 업데이트
    const updatedReport = await reportService.updateReportState(domain, report_number, state, admin_number, report_content, banUntilDate);

    res.status(200).json({
      message: 'Report processed successfully',
      updatedReport,
    });
  } catch (error) {
    next(error);
  }
};

// 신고 처리 내역 조회
exports.getReportProcess = async (req, res, next) => {
  try {
    const { report_number } = req.params;

    // 신고 처리 내역 조회
    const reportManagement = await reportService.getReportManagementByReportNumber(report_number);

    res.status(200).json({
      message: 'Report management retrieved successfully',
      reportManagement
    });
  } catch (error) {
    next(error);
  }
};