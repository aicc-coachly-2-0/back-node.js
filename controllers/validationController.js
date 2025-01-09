const validationService = require("../services/validationService");

// 공통 함수: group_number 조회
const getGroupNumber = async (user_number, room_number) => {
  try {
    const group_number = await validationService.getGroupNumber(
      user_number,
      room_number
    );
    return group_number;
  } catch (error) {
    console.error("공통 함수 - Group Number 조회 실패:", error.message);
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

    // 미션방 상태 확인
    const roomState = await validationService.getMissionRoomState(room_number);
    if (roomState !== "ongoing") {
      return res
        .status(403)
        .json({ error: "미션방이 진행 중이 아닙니다. 인증이 불가능합니다." });
    }

    // group_number 조회
    const group_number = await getGroupNumber(user_number, room_number);

    // group_number가 없으면 에러 반환
    if (!group_number) {
      return res
        .status(404)
        .json({ error: "해당 미션방에 참여 기록이 없습니다." });
    }

    const validationData = {
      group_number,
      image_url: imageUrl,
    };

    const savedValidation = await validationService.uploadMissionValidation(
      validationData
    );

    res.status(201).json({
      message: "미션 인증샷 업로드 성공",
      data: savedValidation,
    });
  } catch (error) {
    console.error("미션 인증샷 업로드 실패:", error.message);
    next(error);
  }
};

// 미션 인증샷 상세 조회
exports.getMissionValidationDetail = async (req, res, next) => {
  try {
    const user_number = req.user.user_number; // JWT로부터 로그인한 유저의 user_number 추출
    const { mission_validation_number } = req.params; // URL에서 mission_validation_number 추출

    // 로그인 여부 검증
    if (!user_number) {
      return res.status(403).json({ error: "로그인이 필요합니다." });
    }

    const validationDetail = await validationService.getMissionValidationDetail(
      mission_validation_number
    );

    res.status(200).json({
      message: "미션 인증 상세 조회 성공",
      data: validationDetail,
    });
  } catch (error) {
    console.error("미션 인증 상세 조회 실패:", error.message);
    next(error);
  }
};

// 인증샷 확인해주기
exports.approveMissionValidation = async (req, res, next) => {
  try {
    // 요청 데이터 가져오기
    const { mission_validation_number } = req.params; // URL 파라미터에서 가져오기
    const user_number = req.user.user_number; // JWT 토큰에서 가져오기

    // 필수 데이터 검증
    if (!mission_validation_number) {
      return res
        .status(400)
        .json({ error: "mission_validation_number는 필수입니다." });
    }

    if (!user_number) {
      return res.status(403).json({ error: "인증되지 않은 사용자입니다." });
    }

    // group_number 조회
    const group_number = await validationService.getGroupNumberForValidation(
      user_number,
      mission_validation_number
    );

    if (!group_number) {
      return res.status(404).json({
        error: "해당 미션 인증 번호 또는 유저 정보와 관련된 데이터가 없습니다.",
      });
    }

    // validation_approvals 테이블에 데이터 삽입
    const approvalResult = await validationService.approveMissionValidation({
      mission_validation_number,
      group_number,
    });

    res.status(201).json({
      message: "인증 확인 성공",
      data: approvalResult,
    });
  } catch (error) {
    console.error("인증 확인 실패:", error.message);
    next(error);
  }
};

// 로그인한 사용자의 미션 인증샷 전체 리스트 조회
exports.getUserMissionValidations = async (req, res, next) => {
  try {
    const { room_number } = req.params; // URL에서 room_number 추출
    const user_number = req.user.user_number; // JWT 토큰에서 user_number 추출

    if (!room_number || !user_number) {
      return res
        .status(400)
        .json({ error: "room_number와 user_number는 필수입니다." });
    }

    // 공통 함수로 group_number 조회
    const group_number = await getGroupNumber(user_number, room_number);

    // group_number가 없으면 에러 반환
    if (!group_number) {
      return res
        .status(404)
        .json({ error: "해당 미션방에 참여 기록이 없습니다." });
    }

    const validations = await validationService.getUserMissionValidations(
      group_number
    );

    res.status(200).json({
      message: "사용자의 미션 인증샷 리스트 조회 성공",
      data: validations,
    });
  } catch (error) {
    console.error("사용자의 미션 인증샷 리스트 조회 실패:", error.message);
    next(error);
  }
};

// 참가자 인증샷 전체 리스트 조회 (로그인 유저 제외한 미션방 참여 유저)
exports.getParticipantValidations = async (req, res, next) => {
  try {
    const { room_number } = req.params; // URL에서 room_number 추출
    const user_number = req.user.user_number; // JWT 토큰에서 user_number 추출

    if (!room_number || !user_number) {
      return res
        .status(400)
        .json({ error: "room_number와 user_number는 필수입니다." });
    }

    // 공통 함수로 group_number 조회
    const group_number = await getGroupNumber(user_number, room_number);

    // group_number가 없으면 에러 반환
    if (!group_number) {
      return res
        .status(404)
        .json({ error: "해당 미션방에 참여 기록이 없습니다." });
    }

    // 서비스 계층에 group_number 전달하여 다른 참가자의 인증샷 조회
    const participantValidations =
      await validationService.getParticipantValidations(
        group_number,
        room_number
      );

    res.status(200).json({
      message: "참가자 인증샷 리스트 조회 성공",
      data: participantValidations,
    });
  } catch (error) {
    console.error("참가자 인증샷 리스트 조회 실패:", error.message);
    next(error);
  }
};
