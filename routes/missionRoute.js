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

// "지금 주목받는 미션" 경로 추가
router.get("/popular", missionController.getPopularMissions);

module.exports = router;
