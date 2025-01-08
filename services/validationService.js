const validationModel = require('../models/validationModel'); // 파일 이름 변경

exports.getGroupNumber = async (user_number, room_number) => {
  try {
    // 1. group_number 조회
    const group_number = await validationModel.findGroupNumber(
      user_number,
      room_number
    );

    if (!group_number) {
      throw new Error(
        'group_number를 찾을 수 없습니다. 해당 미션방에 참여 기록이 없습니다.'
      );
    }

    return group_number;
  } catch (error) {
    console.error('Group Number 조회 실패:', error.message);
    throw error; // 컨트롤러로 에러 전달
  }
};

exports.uploadMissionValidation = async (validationData) => {
  try {
    // 2. validationData 전달
    const savedValidation = await validationModel.postMissionValidation(
      validationData
    );

    return savedValidation;
  } catch (error) {
    console.error('미션 인증샷 저장 실패:', error.message);
    throw error; // 컨트롤러로 에러 전달
  }
};
