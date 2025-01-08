const validationService = require('../services/validationService');

// 미션 인증샷 업로드
exports.uploadMissionValidation = async (req, res, next) => {
  try {
    // 1. 요청 데이터 가져오기
    const { room_number } = req.params; // URL 파라미터에서 room_number 가져오기
    const user_number = req.user.user_number; // JWT 토큰에서 user_number 가져오기
    const imageUrl = req.fileUrls?.[0]?.fileUrl; // 업로드된 이미지 URL 가져오기

    // 2. 미션방 상태 확인
    const roomState = await validationService.getMissionRoomState(room_number);
    if (roomState !== 'ongoing') {
      return res
        .status(403)
        .json({ error: '미션방이 진행 중이 아닙니다. 인증이 불가능합니다.' });
    }

    // 3. group_number 조회
    const group_number = await validationService.getGroupNumber(
      user_number,
      room_number
    );

    // 4. group_number가 없으면 에러 반환
    if (!group_number) {
      return res
        .status(404)
        .json({ error: '해당 미션방에 참여 기록이 없습니다.' });
    }

    // 5. 서비스 계층으로 데이터 전달
    const validationData = {
      group_number,
      image_url: imageUrl,
    };

    const savedValidation = await validationService.uploadMissionValidation(
      validationData
    );

    // 6. 성공 응답
    res.status(201).json({
      message: '미션 인증샷 업로드 성공',
      data: savedValidation,
    });
  } catch (error) {
    // 7. 에러 처리
    console.error('미션 인증샷 업로드 실패:', error.message);
    next(error);
  }
};

// 인증샷 확인해주기
exports.approveMissionValidation = async (req, res, next) => {
  try {
    // 1. 요청 데이터 가져오기
    const { mission_validation_number } = req.params; // URL 파라미터에서 가져오기
    const user_number = req.user.user_number; // JWT 토큰에서 가져오기

    // 2. 필수 데이터 검증
    if (!mission_validation_number) {
      return res
        .status(400)
        .json({ error: 'mission_validation_number는 필수입니다.' });
    }

    if (!user_number) {
      return res.status(403).json({ error: '인증되지 않은 사용자입니다.' });
    }

    // 3. group_number 조회
    const group_number = await validationService.getGroupNumberForValidation(
      user_number,
      mission_validation_number
    );

    if (!group_number) {
      return res.status(404).json({
        error: '해당 미션 인증 번호 또는 유저 정보와 관련된 데이터가 없습니다.',
      });
    }

    // 4. validation_approvals 테이블에 데이터 삽입
    const approvalResult = await validationService.approveMissionValidation({
      mission_validation_number,
      group_number,
    });

    // 5. 성공 응답 반환
    res.status(201).json({
      message: '인증 확인 성공',
      data: approvalResult,
    });
  } catch (error) {
    // 6. 에러 처리
    console.error('인증 확인 실패:', error.message);
    next(error); // 에러 핸들러로 전달
  }
};
