const validationModel = require('../models/validationModel');

// 미션 인증샷 업로드
// 미션방 상태 확인
exports.getMissionRoomState = async (room_number) => {
  try {
    const roomState = await validationModel.checkMissionRoomState(room_number);
    return roomState;
  } catch (error) {
    console.error('미션방 상태 조회 실패:', error.message);
    throw error;
  }
};

// group_number 조회
exports.getGroupNumber = async (user_number, room_number) => {
  try {
    const group_number = await validationModel.findGroupNumber(
      user_number,
      room_number
    );
    return group_number;
  } catch (error) {
    console.error('Group Number 조회 실패:', error.message);
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
    console.error('미션 인증샷 저장 실패:', error.message);
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
    console.error('getGroupNumberForValidation 실패:', error.message);
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
    console.error('approveMissionValidation 실패:', error.message);
    throw error;
  }
};
