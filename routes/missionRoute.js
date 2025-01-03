const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// 미션방 생성
router.post("/", authenticateToken, missionController.createMission);

// 수동 스케줄러 실행 API 추가
router.post("/update-mission-states", async (req, res) => {
  try {
    await missionController.updateMissionStates;
    res.status(200).json({ message: "Mission states updated successfully." });
  } catch (error) {
    console.error("Error updating mission states:", error.message);
    res.status(500).json({ message: "Failed to update mission states." });
  }
});

// 미션 참여 엔드포인트
router.post(
  "/rooms/:room_number/join",
  authenticateToken,
  missionController.joinMissionRoom
);

// "지금 주목받는 미션" 5개 조회
router.get("/popular", missionController.getPopularMissions);

// 마감 임박 미션 5개 조회
router.get("/upcoming", missionController.getUpcomingMissions);

// 참여 중인 미션 5개 조회
router.get(
  "/participating",
  authenticateToken,
  missionController.getParticipatingMissions
);

// // 전체 조회
// router.get("/popular/all", missionController.getAllPopularMissions);
// router.get("/upcoming/all", missionController.getAllUpcomingMissions);
// router.get(
//   "/participating/all",
//   authenticateToken,
//   missionController.getAllParticipatingMissions
// );

// // 참여했던 미션 리스트 조회
// router.get(
//   "/completed",
//   authenticateToken,
//   missionController.getCompletedMissions
// );

// 로그인 없이 조회 가능한 API - 지금 주목받는, 마감 임박
router.get("/public", missionController.getPublicMissions);

// 로그인 필요한 API - 참여 중인, 참여했던
router.get(
  "/private",
  authenticateToken,
  missionController.getAuthRequiredMissions
);

module.exports = router;
