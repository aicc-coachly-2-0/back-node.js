const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const missionDetailsController = require("../controllers/missionDetailsController");
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

// 로그인 없이 조회 가능한 미션 전체 조회
router.get("/popular-all", missionController.getPublicMissions); // 주목받는 미션
router.get("/upcoming-all", missionController.getPublicMissions); // 마감 임박 미션

// 로그인 필요한 미션 전체 조회
router.get(
  "/participating-all",
  authenticateToken,
  missionController.getAuthRequiredMissions
); // 참여 중인 미션
router.get(
  "/completed-all",
  authenticateToken,
  missionController.getAuthRequiredMissions
); // 참여했던 미션

// 모집 중인 미션 상세 페이지 조회
router.get(
  "/recruiting/:room_number",
  missionDetailsController.getRecruitingMissionDetails
);

// 진행 중 또는 완료된 미션 상세 페이지 조회
router.get("/detail/:room_number", missionDetailsController.getMissionDetails);

module.exports = router;
