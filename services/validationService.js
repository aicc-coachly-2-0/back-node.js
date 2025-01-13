const validationModel = require('../models/validationModel');

// 공통 함수: group_number 조회
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
// =============================================================================================

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

// 미션 인증샷 상세 조회
// exports.getMissionValidationDetail = async (mission_validation_number) => {
//   try {
//     const validationDetail = await validationModel.findMissionValidationDetail(
//       mission_validation_number
//     );
//     return validationDetail;
//   } catch (error) {
//     console.error('getMissionValidationDetail 실패:', error.message);
//     throw error;
//   }
// };

// 인증샷 확인해주기
exports.approveValidation = async (mission_validation_number, user_number) => {
  try {
    const approvalResult = await validationModel.insertApproval(
      mission_validation_number,
      user_number
    );

    return approvalResult;
  } catch (error) {
    console.error('approveValidation 실패:', error.message);
    throw error;
  }
};

// 인증 몇 명 했는지 확인해주기, 인증 성공 여부 반환하기
exports.getValidationData = async (mission_validation_number) => {
  try {
    // 모델 계층 호출
    return await validationModel.getValidationData(mission_validation_number);
  } catch (error) {
    console.error('Error in getValidationData service:', error.message);
    throw error;
  }
};

// 사용자의 미션 인증샷 전체 리스트 조회
exports.getUserMissionValidations = async (user_number, room_number) => {
  try {
    const validations = await validationModel.findUserMissionValidations(
      user_number,
      room_number
    );
    return validations;
  } catch (error) {
    console.error('getUserMissionValidations 실패:', error.message);
    throw error;
  }
};

// 참가자 인증샷 전체 리스트 조회
exports.getParticipantValidations = async (room_number) => {
  try {
    const participantValidations =
      await validationModel.findParticipantValidations(room_number);
    return participantValidations;
  } catch (error) {
    console.error('참가자 인증샷 리스트 조회 실패:', error.message);
    throw error;
  }
};
