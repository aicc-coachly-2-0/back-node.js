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
  authenticateToken, // 로그인된 유저만 접근 가능
  missionController.getParticipatingMissions
);

// 전체 조회 엔드포인트 추가
router.get("/popular/all", missionController.getAllPopularMissions);
router.get("/upcoming/all", missionController.getAllUpcomingMissions);
router.get(
  "/participating/all",
  authenticateToken,
  missionController.getAllParticipatingMissions
);

module.exports = router;
