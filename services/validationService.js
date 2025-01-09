const validationModel = require("../models/validationModel");

// 공통 함수: group_number 조회
exports.getGroupNumber = async (user_number, room_number) => {
  try {
    const group_number = await validationModel.findGroupNumber(
      user_number,
      room_number
    );
    return group_number;
  } catch (error) {
    console.error("Group Number 조회 실패:", error.message);
    throw error;
  }
};
// =============================================================================================

// 미션 인증샷 업로드
// 미션방 상태 확인
exports.getMissionRoomState = async (room_number) => {
  try {
    const roomState = await validationModel.checkMissionRoomState(room_number);
    return roomState;
  } catch (error) {
    console.error("미션방 상태 조회 실패:", error.message);
    throw error;
  }
};

// 미션 인증 데이터 저장
exports.uploadMissionValidation = async (validationData) => {
  try {
    const savedValidation = await validationModel.postMissionValidation(
      validationData
    );
    return savedValidation;
  } catch (error) {
    console.error("미션 인증샷 저장 실패:", error.message);
    throw error;
  }
};

// 미션 인증샷 상세 조회
exports.getMissionValidationDetail = async (mission_validation_number) => {
  try {
    const validationDetail = await validationModel.findMissionValidationDetail(
      mission_validation_number
    );
    return validationDetail;
  } catch (error) {
    console.error("getMissionValidationDetail 실패:", error.message);
    throw error;
  }
};

// 인증샷 확인해주기
// 1. group_number 조회 및 데이터 전달
exports.getGroupNumberForValidation = async (
  user_number,
  mission_validation_number
) => {
  try {
    // 모델로 데이터 전달하여 group_number 조회
    const group_number = await validationModel.findGroupNumber2(
      user_number,
      mission_validation_number
    );

    return group_number; // 모델에서 반환된 group_number 전달
  } catch (error) {
    console.error("getGroupNumberForValidation 실패:", error.message);
    throw error;
  }
};

// 2. 인증 확인 데이터 삽입
exports.approveMissionValidation = async (approvalData) => {
  try {
    // 모델로 데이터 전달하여 인증 확인 데이터 삽입
    const approvalResult = await validationModel.insertValidationApproval(
      approvalData
    );

    return approvalResult;
  } catch (error) {
    console.error("approveMissionValidation 실패:", error.message);
    throw error;
  }
};

// 로그인한 사용자의 미션 인증샷 전체 리스트 조회
exports.getUserMissionValidations = async (group_number) => {
  try {
    const validations = await validationModel.findUserMissionValidations(
      group_number
    );
    return validations;
  } catch (error) {
    console.error("getUserMissionValidations 실패:", error.message);
    throw error;
  }
};

// 참가자 인증샷 전체 리스트 조회 (로그인 유저 제외한 미션방 참여 유저)
exports.getParticipantValidations = async (group_number, room_number) => {
  try {
    const participantValidations =
      await validationModel.findParticipantValidations(
        group_number,
        room_number
      );
    return participantValidations;
  } catch (error) {
    console.error("참가자 인증샷 리스트 조회 실패:", error.message);
    throw error;
  }
};
