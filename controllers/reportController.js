const reportService = require('../services/reportService');

// 도메인별 신고 접수
exports.createReport = async (req, res, next) => {
  try {
    const { domain } = req.params;  // URL 파라미터에서 도메인 정보 가져오기
    const report = await reportService.createReport(domain, req.body);  // 신고 생성 서비스 호출
    res.status(201).json({
      success: true,  // 성공적인 응답
      message: 'Report created successfully',  // 성공 메시지
      data: report  // 생성된 신고 데이터 반환
    });
  } catch (error) {
    console.error(error);  // 에러 로그 기록
    next(error);  // 에러 핸들러로 에러 전달
  }
};

// 도메인별 신고 조회 (목록)
exports.getReportsByDomain = async (req, res, next) => {
  try {
    const { domain } = req.params;  // URL 파라미터에서 도메인 정보 가져오기
    const { state, report_category } = req.query;  // 쿼리 파라미터에서 상태(state)와 카테고리(report_category) 가져오기
    const reports = await reportService.getReportsByDomain(domain, { state, report_category });  // 신고 목록 조회 서비스 호출
    res.status(200).json({
      success: true,  // 성공적인 응답
      data: reports  // 조회된 신고 데이터 반환
    });
  } catch (error) {
    console.error(error);  // 에러 로그 기록
    next(error);  // 에러 핸들러로 에러 전달
  }
};

// 특정 사용자가 받은 신고 내역과 신고 수 조회
exports.getReportsForUser = async (req, res, next) => {
  try {
    const { user_number } = req.params;  // URL 파라미터에서 사용자 번호 가져오기
    const reportData = await reportService.getReportsForUser(user_number);  // 사용자별 신고 내역 조회 서비스 호출
    if (!reportData) {
      return res.status(404).json({
        success: false,  // 신고 내역이 없을 경우 실패 응답
        message: 'No reports found for this user.'  // 메시지 반환
      });
    }
    res.status(200).json({
      success: true,  // 성공적인 응답
      data: reportData  // 조회된 사용자 신고 내역 반환
    });
  } catch (error) {
    console.error(error);  // 에러 로그 기록
    next(error);  // 에러 핸들러로 에러 전달
  }
};

// 특정 유저가 한 신고 조회
exports.getReportsMadeByUser = async (req, res, next) => {
  const { user_id } = req.user;  // 로그인된 사용자의 user_id 정보 가져오기

  try {
    // 권한 체크: 로그인된 사용자만 자신이 한 신고를 볼 수 있도록 처리
    const reports = await userService.findReportsMadeByUser(user_id);  // 사용자가 한 신고 목록 조회 서비스 호출
    res.status(200).json({
      success: true,  // 성공적인 응답
      message: 'Reports made by user retrieved successfully',  // 메시지 반환
      data: reports  // 사용자가 한 신고 내역 반환
    });
  } catch (error) {
    console.error(error);  // 에러 로그 기록
    next(error);  // 에러 핸들러로 에러 전달
  }
};

// 특정 신고 조회
exports.getReport = async (req, res, next) => {
  try {
    const { domain, report_id } = req.params;  // URL 파라미터에서 도메인과 신고 ID 가져오기
    const report = await reportService.getReport(domain, report_id);  // 신고 상세 조회 서비스 호출
    if (!report) {
      return res.status(404).json({
        success: false,  // 신고가 없으면 실패 응답
        message: 'Report not found'  // 메시지 반환
      });
    }
    res.status(200).json({
      success: true,  // 성공적인 응답
      data: report  // 조회된 신고 데이터 반환
    });
  } catch (error) {
    console.error(error);  // 에러 로그 기록
    next(error);  // 에러 핸들러로 에러 전달
  }
};

// 신고 처리 (관리자)
exports.processReport = async (req, res, next) => {
  try {
    const { domain, report_id } = req.params;  // URL 파라미터에서 도메인과 신고 ID 가져오기
    const { state, admin_number, report_content } = req.body;  // 요청 본문에서 신고 처리 관련 정보 가져오기

    // 관리자 권한 체크: 관리자가 아니면 접근할 수 없음
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,  // 권한이 없으면 실패 응답
        message: 'Access denied. Admin rights required.'  // 관리자 권한 메시지
      });
    }

    const updatedReport = await reportService.processReport(domain, report_id, { state, admin_number, report_content });  // 신고 처리 서비스 호출
    res.status(200).json({
      success: true,  // 성공적인 응답
      message: 'Report processed successfully',  // 메시지 반환
      data: updatedReport  // 처리된 신고 데이터 반환
    });
  } catch (error) {
    console.error(error);  // 에러 로그 기록
    next(error);  // 에러 핸들러로 에러 전달
  }
};

// 신고 처리 내역 조회
exports.getReportManagements = async (req, res, next) => {
  try {
    const managements = await reportService.getReportManagements(req.query);  // 신고 처리 내역 조회 서비스 호출
    res.status(200).json({
      success: true,  // 성공적인 응답
      data: managements  // 조회된 신고 처리 내역 반환
    });
  } catch (error) {
    console.error(error);  // 에러 로그 기록
    next(error);  // 에러 핸들러로 에러 전달
  }
};

// 블랙리스트 조회
exports.getBlacklist = async (req, res, next) => {
  try {
    // 쿼리 파라미터로 필터링 조건을 받을 수 있습니다. (예: state, 이유 등)
    const filters = req.query;
    const blacklist = await blacklistService.getBlacklist(filters);
    res.status(200).json({ message: 'Blacklist retrieved successfully', data: blacklist });
  } catch (error) {
    next(error);
  }
};