const missionModel = require("../models/missionModel");

// 미션 생성 -> 데이터 삽입 실패 시 에러 반환
exports.createMission = async (missionData, user) => {
  try {
    const mission = await missionModel.createMission(missionData, user);
    return mission;
  } catch (error) {
    console.error(`[Service] Error in createMission: ${error.message}`);
    throw new Error("미션 생성 중 오류가 발생했습니다.");
  }
};
