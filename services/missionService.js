const missionModel = require("../models/missionModel");

// 미션 생성 -> 데이터 삽입 실패 시 에러 반환
exports.createMission = async (missionData, user) => {
  try {
    // 로그 추가: 전달된 데이터 확인
    // console.log("[Service] Mission Data:", missionData);
    // console.log("[Service] User Data:", user);

    const mission = await missionModel.createMission(missionData, user);
    return mission;
  } catch (error) {
    console.error(`[Service] Error in createMission: ${error.message}`);
    throw new Error("미션 생성 중 오류가 발생했습니다.");
  }
};

// state 업데이트 (스케쥴러 수동 실행을 위한 함수 호출)
exports.updateMissionStates = async () => {
  try {
    console.log("[Service] Updating mission states...");
    const result = await missionModel.updateMissionStates();
    console.log("[Service] Mission states updated successfully.");
    return result;
  } catch (error) {
    console.error(`[Service] Error in updateMissionStates: ${error.message}`);
    throw new Error("미션 상태 업데이트 중 오류가 발생했습니다.");
  }
};
