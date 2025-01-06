const cron = require("node-cron");
const { updateMissionStates } = require("../services/missionService");

const missionStateScheduler = () => {
  // 매일 자정(00:00)에 실행
  cron.schedule("0 0 * * *", async () => {
    console.log("스케줄러 실행 중: mission_rooms 상태 업데이트");
    await updateMissionStates();
  });
};

module.exports = missionStateScheduler;
