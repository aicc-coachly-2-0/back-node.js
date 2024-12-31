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

// 특정 사용자의 신고 내역과 신고 수 조회
exports.getReportsForUser = async (req, res, next) => {
  try {
    const { user_number } = req.params; // URL 파라미터에서 user_number 가져오기
    const reportData = await reportService.getReportsForUser(user_number);
    if (!reportData) {
      return res.status(404).json({ message: 'No reports found for this user.' });
    }
    res.status(200).json(reportData);
  } catch (error) {
    next(error);
  }
};

// 특정 신고 조회
exports.getReport = async (req, res, next) => {
  try {
    const { domain, report_id } = req.params;
    const report = await reportService.getReport(domain, report_id);
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
    const { domain, report_id } = req.params;
    const updatedReport = await reportService.processReport(domain, report_id, req.body);
    res.status(200).json({ message: 'Report processed successfully', updatedReport });
  } catch (error) {
    next(error);
  }
};

// 신고 처리 내역 조회
exports.getReportManagements = async (req, res, next) => {
  try {
    const managements = await reportService.getReportManagements(req.query);
    res.status(200).json(managements);
  } catch (error) {
    next(error);
  }
};
