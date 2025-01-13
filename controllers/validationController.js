const validationService = require('../services/validationService');

// 공통 함수: group_number 조회
const getGroupNumber = async (user_number, room_number) => {
  try {
    const group_number = await validationService.getGroupNumber(
      user_number,
      room_number
    );
    return group_number;
  } catch (error) {
    console.error('공통 함수 - Group Number 조회 실패:', error.message);
    throw error;
  }
};
// =============================================================================================

// 미션 인증샷 업로드
exports.uploadMissionValidation = async (req, res, next) => {
  try {
    // 요청 데이터 가져오기
    const { room_number } = req.params; // URL 파라미터에서 room_number 가져오기
    const user_number = req.user.user_number; // JWT 토큰에서 user_number 가져오기
    const imageUrl = req.fileUrls?.[0]?.fileUrl; // 업로드된 이미지 URL 가져오기

    // 미션방 상태 확인 (추가 검증 로직)
    const roomState = await validationService.getMissionRoomState(room_number);
    if (roomState !== 'ongoing') {
      return res.status(403).json({
        error: '미션방이 진행 중이 아닙니다. 인증샷 업로드가 불가능합니다.',
      });
    }

    // 데이터 구성
    const validationData = {
      room_number,
      user_number,
      image_url: imageUrl,
    };

    // 서비스 호출
    const savedValidation = await validationService.uploadMissionValidation(
      validationData
    );

    res.status(201).json({
      message: '미션 인증샷 업로드 성공',
      data: savedValidation,
    });
  } catch (error) {
    console.error('미션 인증샷 업로드 실패:', error.message);
    next(error);
  }
};

// 미션 인증샷 상세 조회
// exports.getMissionValidationDetail = async (req, res, next) => {
//   try {
//     const user_number = req.user.user_number; // JWT로부터 로그인한 유저의 user_number 추출
//     const { mission_validation_number } = req.params; // URL에서 mission_validation_number 추출

//     // 로그인 여부 검증
//     if (!user_number) {
//       return res.status(403).json({ error: '로그인이 필요합니다.' });
//     }

//     const validationDetail = await validationService.getMissionValidationDetail(
//       mission_validation_number
//     );

//     res.status(200).json({
//       message: '미션 인증 상세 조회 성공',
//       data: validationDetail,
//     });
//   } catch (error) {
//     console.error('미션 인증 상세 조회 실패:', error.message);
//     next(error);
//   }
// };

// 인증샷 확인해주기
exports.approveMissionValidation = async (req, res, next) => {
  try {
    const { mission_validation_number, user_number } = req.params;

    if (!mission_validation_number || !user_number) {
      return res.status(400).json({
        error: 'mission_validation_number와 user_number는 필수입니다.',
      });
    }

    const result = await validationService.approveValidation(
      mission_validation_number,
      user_number
    );

    res.status(201).json({
      message: '인증샷 확인 성공',
      data: result,
    });
  } catch (error) {
    // 에러 메시지에 따라 HTTP 상태 코드 설정
    if (error.message === '본인의 인증샷에 확인을 누를 수 없습니다.') {
      return res.status(403).json({ error: error.message });
    } else if (error.message === '이미 확인을 누른 인증샷입니다.') {
      return res.status(409).json({ error: error.message });
    }

    console.error('인증샷 확인 실패:', error.message);
    next(error); // 기타 에러는 기본 에러 핸들러로 전달
  }
};

// 인증 몇 명 했는지 확인해주기, 인증 성공 여부 반환하기
exports.getValidationStatus = async (req, res) => {
  const { mission_validation_number } = req.params;

  try {
    // 서비스 계층 호출
    const validationData = await validationService.getValidationData(
      mission_validation_number
    );

    res.status(200).json({
      approval_count: validationData.approval_count,
      success_status: validationData.success_status,
    });
  } catch (error) {
    console.error('Error fetching validation status:', error.message);
    res.status(500).json({ error: 'Failed to fetch validation status' });
  }
};

// 사용자의 미션 인증샷 전체 리스트 조회
exports.getUserMissionValidations = async (req, res, next) => {
  try {
    const { room_number } = req.params; // URL에서 room_number 추출
    const { user_number } = req.params;

    // room_number와 user_number가 없으면 에러 반환
    if (!room_number || !user_number) {
      return res
        .status(400)
        .json({ error: 'room_number와 user_number는 필수입니다.' });
    }

    // 서비스 계층 호출
    const validations = await validationService.getUserMissionValidations(
      user_number,
      room_number
    );

    res.status(200).json({
      message: '사용자의 미션 인증샷 리스트 조회 성공',
      data: validations,
    });
  } catch (error) {
    console.error('사용자의 미션 인증샷 리스트 조회 실패:', error.message);
    next(error);
  }
};

// 참가자 인증샷 전체 리스트 조회
exports.getParticipantValidations = async (req, res, next) => {
  try {
    const { room_number } = req.params; // URL에서 room_number 추출

    if (!room_number) {
      return res.status(400).json({ error: 'room_number는 필수입니다.' });
    }

    // 서비스 계층에서 room_number를 전달하여 데이터 조회
    const participantValidations =
      await validationService.getParticipantValidations(room_number);

    res.status(200).json({
      message: '참가자 인증샷 리스트 조회 성공',
      data: participantValidations,
    });
  } catch (error) {
    console.error('참가자 인증샷 리스트 조회 실패:', error.message);
    next(error);
  }
};
