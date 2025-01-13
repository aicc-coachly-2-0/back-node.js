const missionDetailsService = require("../services/missionDetailsService");

// 모집 중인 미션 상세 페이지 조회
exports.getRecruitingMissionDetails = async (req, res, next) => {
  try {
    const { room_number } = req.params;

    const missionDetails =
      await missionDetailsService.getRecruitingMissionDetails(room_number);

    return res.status(200).json({
      message: "Recruiting mission details retrieved successfully",
      data: missionDetails,
    });
  } catch (error) {
    console.error(
      "[CONTROLLER ERROR] Failed to retrieve recruiting mission details:",
      error.message
    );
    next(error);
  }
};

// 진행 중 또는 완료된 미션 상세 페이지 조회
exports.getMissionDetails = async (req, res, next) => {
  try {
    const { room_number } = req.params;

    // 미션 상세 조회
    const missionDetails = await missionDetailsService.getMissionDetails(
      room_number
    );

    // 모집 중 상태에서 접근을 막음
    if (missionDetails.state === "recruiting") {
      return res.status(403).json({
        message:
          "Cannot access mission details. The mission is still in recruiting state.",
      });
    }

    return res.status(200).json({
      message: "Ongoing or completed mission details retrieved successfully",
      data: missionDetails,
    });
  } catch (error) {
    console.error(
      "[CONTROLLER ERROR] Failed to retrieve mission details:",
      error.message
    );
    next(error);
  }
};
