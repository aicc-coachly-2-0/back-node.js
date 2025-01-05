const missionDetailsService = require("../services/missionDetailsService");

// 미션 상태에 따라 상세 페이지를 불러오는 함수
exports.getMissionDetails = async (req, res, next) => {
  try {
    const { room_number } = req.params; // room_number로 수정

    // 미션 상태 조회
    const missionDetails = await missionDetailsService.getMissionDetails(
      room_number
    );

    // 모집 중인 미션 상태일 경우
    if (missionDetails.state === "recruiting") {
      // 모집 중인 미션 상세 페이지 조회
      const recruitingMissionDetails =
        await missionDetailsService.getRecruitingMissionDetails(room_number);
      return res.status(200).json({
        message: "Recruiting mission details retrieved successfully",
        data: recruitingMissionDetails,
      });
    }

    // 진행 중인 미션 (ongoing) 또는 완료된 미션 (completed) 상태일 경우
    if (
      missionDetails.state === "ongoing" ||
      missionDetails.state === "completed"
    ) {
      // 진행 중이거나 완료된 미션 상세 페이지 조회
      return res.status(200).json({
        message: "Ongoing or completed mission details retrieved successfully",
        data: missionDetails,
      });
    }

    // 상태가 잘못된 경우
    return res.status(400).json({
      message: "Invalid mission state",
    });
  } catch (error) {
    console.error(
      "[CONTROLLER ERROR] Failed to retrieve mission details:",
      error.message
    );
    next(error);
  }
};
