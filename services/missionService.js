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

// 미션 방 참여 -> 방 번호와 유저 번호를 기반으로 참여 등록
exports.joinMissionRoom = async (user_number, room_number) => {
  try {
    // 로그: 전달된 데이터 확인
    console.log("[Service] User Number:", user_number);
    console.log("[Service] Room Number:", room_number);

    const result = await missionModel.joinMissionRoom(user_number, room_number);

    return result;
  } catch (error) {
    console.error(`[Service] Error in joinMissionRoom: ${error.message}`);
    throw new Error("미션 방 참여 중 오류가 발생했습니다.");
  }
};

// "지금 주목받는 미션" 리스트 조회
exports.getPopularMissions = async () => {
  try {
    const popularMissions = await missionModel.getPopularMissions();

    // 로그: 가져온 데이터 확인
    console.log("[Service] Popular Missions:", popularMissions);

    return popularMissions;
  } catch (error) {
    console.error(`[Service] Error in getPopularMissions: ${error.message}`);
    throw new Error("지금 주목받는 미션을 불러오는 중 오류가 발생했습니다.");
  }
};

// 마감 임박 미션 조회
exports.getUpcomingMissions = async () => {
  try {
    const upcomingMissions = await missionModel.getUpcomingMissions();

    // 로그 추가: 데이터 확인
    console.log("[Service] Upcoming Missions:", upcomingMissions);

    return upcomingMissions;
  } catch (error) {
    console.error(`[Service] Error in getUpcomingMissions: ${error.message}`);
    throw new Error("마감 임박 미션 조회 중 오류가 발생했습니다.");
  }
};

// 참여 중인 미션 5개 조회
exports.getParticipatingMissions = async (userNumber) => {
  try {
    // 모델에서 참여 중인 미션 리스트 조회
    const participatingMissions = await missionModel.getParticipatingMissions(
      userNumber
    );

    // 조회된 데이터 확인
    console.log(
      "[Service] Participating Missions Data:",
      participatingMissions
    );

    // 빈 배열이면 로그로 출력하고 빈 배열 반환
    if (participatingMissions.length === 0) {
      console.log(
        "[Service] No participating missions found for user:",
        userNumber
      );
      return [];
    }

    // 조회된 데이터 반환
    return participatingMissions;
  } catch (error) {
    console.error(
      "[Service] Error in fetching participating missions:",
      error.message
    );
    throw new Error("참여 중인 미션 조회 중 오류가 발생했습니다.");
  }
};
