const reportService = require('../services/reportService');

// 도메인별 신고 접수
exports.createReport = async (req, res, next) => {
  try {
    const { domain } = req.params; // URL 파라미터에서 도메인 정보 가져오기
    const report = await reportService.createReport(domain, req.body); // 신고 생성 서비스 호출
    res.status(201).json({
      success: true, // 성공적인 응답
      message: 'Report created successfully', // 성공 메시지
      data: report, // 생성된 신고 데이터 반환
    });
  } catch (error) {
    console.error(error); // 에러 로그 기록
    next(error); // 에러 핸들러로 에러 전달
  }
};

// 도메인별 신고 조회 (목록)
exports.getReportsByDomain = async (req, res, next) => {
  try {
    const { domain } = req.params; // URL 파라미터에서 도메인 정보 가져오기
    const { state, report_category } = req.query; // 쿼리 파라미터에서 상태(state)와 카테고리(report_category) 가져오기
    const reports = await reportService.getReportsByDomain(domain, {
      state,
      report_category,
    }); // 신고 목록 조회 서비스 호출
    res.status(200).json({
      success: true, // 성공적인 응답
      data: reports, // 조회된 신고 데이터 반환
    });
  } catch (error) {
    console.error(error); // 에러 로그 기록
    next(error); // 에러 핸들러로 에러 전달
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
      return res
        .status(404)
        .json({ message: 'No reports found for this user.' });
    }

    res.status(200).json(reportData);
  } catch (error) {
    console.error(error); // 에러 로그 기록
    next(error); // 에러 핸들러로 에러 전달
  }
};

// 특정 유저가 한 신고 조회
exports.getReportsMadeByUser = async (req, res, next) => {
  const { user_number } = req.params;

  try {
    const reports = await reportService.getReportsMadeByUser(user_number);
    res
      .status(200)
      .json({
        message: 'Reports made by user retrieved successfully',
        data: reports,
      });
  } catch (error) {
    console.error(error); // 에러 로그 기록
    next(error); // 에러 핸들러로 에러 전달
  }
};

// 특정 신고 조회
exports.getReport = async (req, res, next) => {
  try {
    const { domain, report_number } = req.params;
    const report = await reportService.getReport(domain, report_number);
    if (!report) {
      return res.status(404).json({
        success: false, // 신고가 없으면 실패 응답
        message: 'Report not found', // 메시지 반환
      });
    }
    res.status(200).json({
      success: true, // 성공적인 응답
      data: report, // 조회된 신고 데이터 반환
    });
  } catch (error) {
    console.error(error); // 에러 로그 기록
    next(error); // 에러 핸들러로 에러 전달
  }
};

// 신고 처리 (관리자)
exports.processReport = async (req, res, next) => {
  try {
    const { domain, report_number } = req.params;
    const { state, admin_number, report_content, ban_until } = req.body;

    // ban_until이 없으면 처리일로부터 7일 뒤로 설정
    const resolutionDate = new Date(); // 현재 시간
    const banUntilDate = ban_until
      ? new Date(ban_until)
      : new Date(resolutionDate.setDate(resolutionDate.getDate() + 7)); // 7일 뒤 기본 설정

    // 신고 처리 상태 업데이트
    const updatedReport = await reportService.updateReportState(
      domain,
      report_number,
      state,
      admin_number,
      report_content,
      banUntilDate
    );

    // 신고 처리 내역 조회
    const reportManagement =
      await reportService.getReportManagementByReportNumber(report_number);

    res.status(200).json({
      message: 'Report processed successfully',
      updatedReport,
      reportManagement,
    });
  } catch (error) {
    next(error);
  }
};
