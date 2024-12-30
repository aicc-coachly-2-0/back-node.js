const cron = require("node-cron");
const missionModel = require("../models/missionModel");

// 미션 상태 업데이트 실행 함수
const runScheduler = async () => {
  try {
    console.log("Running mission state scheduler...");
    await missionModel.updateMissionStates(); // 상태 업데이트 함수 호출
  } catch (error) {
    console.error("Scheduler error:", error.message);
  }
};

// 서버 시작 시 스케줄러 초기 실행
(async () => {
  try {
    console.log("Initializing mission state update...");
    await runScheduler();
  } catch (error) {
    console.error("Initial scheduler error:", error.message);
  }
})();

// 매일 자정에 실행 (00:00)
cron.schedule("0 0 * * *", runScheduler);

module.exports = runScheduler;
