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
    const reports = await reportService.getReportsByDomain(domain, req.query);
    res.status(200).json(reports);
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
