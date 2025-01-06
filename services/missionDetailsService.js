const missionDetailsModel = require("../models/missionDetailsModel");

// 모집 중인 미션 상세 페이지 조회
exports.getRecruitingMissionDetails = async (room_number) => {
  try {
    return await missionDetailsModel.getRecruitingMissionDetails(room_number);
  } catch (error) {
    console.error(
      "[SERVICE ERROR] Failed to retrieve recruiting mission details:",
      error.message
    );
    throw new Error("Failed to retrieve recruiting mission details.");
  }
};

// 진행 중 또는 완료된 미션 상세 페이지 조회
exports.getMissionDetails = async (room_number) => {
  try {
    return await missionDetailsModel.getMissionDetails(room_number);
  } catch (error) {
    console.error(
      "[SERVICE ERROR] Failed to retrieve mission details:",
      error.message
    );
    throw new Error("Failed to retrieve mission details.");
  }
};
