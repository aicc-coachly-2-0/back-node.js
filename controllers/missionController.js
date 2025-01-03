const missionService = require("../services/missionService");

// 미션 방 생성
exports.createMission = async (req, res, next) => {
  try {
    // console.log("[CONTROLLER] User from token (req.user):", req.user); // 유저 정보 확인
    // console.log("[CONTROLLER] Mission data (req.body):", req.body); // 요청 데이터 확인

    // 유저 정보 검증
    if (!req.user || !req.user.user_number) {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    // 제목, 미션 카테고리(의 고유 넘버), 미션 수행 기간, 미션 시작일, 참가 인원 데이터 전달
    const { title, mission_number, started_at, duration, max_participants } =
      req.body;

    // 필수 입력값 검증 -> 제목, 미션 카테고리, 미션 수행 기간, 미션 시작일 값이 비어있다면 에러 반환
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required." });
    }
    if (!mission_number) {
      return res
        .status(400)
        .json({ message: "Mission category (mission_number) is required." });
    }
    if (!duration) {
      return res.status(400).json({ message: "Mission duration is required." });
    }
    if (!started_at) {
      return res
        .status(400)
        .json({ message: "Mission start date is required." });
    }

    // 참가 인원 유효성 검증 -> 입력값이 숫자인지 확인, 최소 4명 ~ 최대 2,000명 설정
    if (
      (max_participants && typeof max_participants !== "number") || // 숫자가 아닌 값일 경우
      max_participants < 4 || // 최소 인원보다 적음
      max_participants > 2000 // 최대 인원보다 많음
    ) {
      return res
        .status(400)
        .json({ message: "Participants must be a number between 4 and 2000." });
    }

    // 참가 인원 기본값 설정 (유저가 값을 입력하지 않은 경우)
    const participants = max_participants || 2000;

    // 미션 생성 로직 호출
    // req.body: 클라이언트 전송 데이터
    // max_participants: participants: Controller에서 처리한 참가 인원의 값, participants라는 변수를 max_participants라는 이름으로 바꿔서 전달
    // req.user: 로그인한 유저 정보
    const mission = await missionService.createMission(
      { ...req.body, max_participants: participants },
      req.user
    );

    res.status(201).json({ message: "Mission created successfully", mission });
  } catch (error) {
    console.error("[CONTROLLER ERROR] Exception occurred:", error.message);
    next(error);
  }
};

// state 업데이트 (스케쥴러 수동 실행을 위한 함수 호출)
exports.updateMissionStates = async (req, res, next) => {
  try {
    await missionService.updateMissionStates;
    res.status(200).json({ message: "Mission states updated successfully." });
  } catch (error) {
    console.error("Error updating mission states:", error.message);
    res.status(500).json({ message: "Failed to update mission states." });
  }
};

// 미션 방 참여
exports.joinMissionRoom = async (req, res, next) => {
  try {
    const { room_number } = req.params; // URL에서 미션 방 번호 가져오기
    const user = req.user; // 인증된 사용자 정보

    // 유저 정보 및 방 번호 확인
    if (!user || !user.user_number) {
      return res.status(403).json({ message: "Unauthorized user" });
    }
    if (!room_number) {
      return res.status(400).json({ message: "Room number is required" });
    }

    // 미션 방 참여 서비스 호출 (중복 확인 및 참여 처리 포함)
    const result = await missionService.joinMissionRoom(
      user.user_number,
      room_number
    );

    res
      .status(201)
      .json({ message: "Successfully joined the mission room", data: result });
  } catch (error) {
    console.error(
      "[CONTROLLER ERROR] Failed to join mission room:",
      error.message
    );

    // 중복 참여 에러 처리
    if (error.message === "이미 해당 미션방에 참여 중입니다.") {
      return res.status(409).json({ message: error.message });
    }

    // 기타 에러는 처리 미들웨어로 전달
    next(error);
  }
};

// 지금 주목받는 미션 5개 조회
exports.getPopularMissions = async (req, res, next) => {
  try {
    const popularMissions = await missionService.getPopularMissions();

    // 가져온 데이터를 클라이언트에 반환
    res.status(200).json({
      message: "Popular missions retrieved successfully",
      data: popularMissions,
    });
  } catch (error) {
    console.error(
      "[CONTROLLER ERROR] Failed to retrieve popular missions:",
      error.message
    );
    next(error);
  }
};

// 마감 임박 미션 5개 조회
exports.getUpcomingMissions = async (req, res, next) => {
  try {
    const upcomingMissions = await missionService.getUpcomingMissions();

    // 성공적으로 데이터를 가져온 경우 클라이언트에 반환
    res.status(200).json({
      message: "Upcoming missions retrieved successfully",
      data: upcomingMissions,
    });
  } catch (error) {
    console.error(
      "[CONTROLLER ERROR] Failed to retrieve upcoming missions:",
      error.message
    );
    next(error);
  }
};

// 참여 중인 미션 5개 조회
exports.getParticipatingMissions = async (req, res, next) => {
  try {
    // 로그인된 유저 정보 확인
    if (!req.user || !req.user.user_number) {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    const userNumber = req.user.user_number; // 유저 번호 추출

    // 서비스 호출하여 참여 중인 미션 조회
    const participatingMissions = await missionService.getParticipatingMissions(
      userNumber
    );

    // 참여 중인 미션이 없는 경우 처리
    if (!participatingMissions || participatingMissions.length === 0) {
      return res.status(200).json({
        message: "No participating missions found",
        data: [],
      });
    }

    // 가져온 데이터 클라이언트에 반환
    res.status(200).json({
      message: "Participating missions retrieved successfully",
      data: participatingMissions,
    });
  } catch (error) {
    console.error(
      "[CONTROLLER ERROR] Failed to retrieve participating missions:",
      error.message
    );
    next(error);
  }
};

// 지금 주목받는 미션 전체 조회
exports.getAllPopularMissions = async (req, res, next) => {
  try {
    const allPopularMissions = await missionService.getAllPopularMissions();

    // 가져온 데이터를 클라이언트에 반환
    res.status(200).json({
      message: "All popular missions retrieved successfully",
      data: allPopularMissions,
    });
  } catch (error) {
    console.error(
      "[CONTROLLER ERROR] Failed to retrieve all popular missions:",
      error.message
    );
    next(error);
  }
};

// 마감 임박 미션 전체 조회
exports.getAllUpcomingMissions = async (req, res, next) => {
  try {
    const allUpcomingMissions = await missionService.getAllUpcomingMissions();

    // 성공적으로 데이터를 가져온 경우 클라이언트에 반환
    res.status(200).json({
      message: "All upcoming missions retrieved successfully",
      data: allUpcomingMissions,
    });
  } catch (error) {
    console.error(
      "[CONTROLLER ERROR] Failed to retrieve all upcoming missions:",
      error.message
    );
    next(error);
  }
};

// 참여 중인 미션 전체 조회
exports.getAllParticipatingMissions = async (req, res, next) => {
  try {
    // 로그인된 유저 정보 확인
    if (!req.user || !req.user.user_number) {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    const userNumber = req.user.user_number; // 유저 번호 추출

    // 서비스 호출하여 참여 중인 미션 전체 조회
    const allParticipatingMissions =
      await missionService.getAllParticipatingMissions(userNumber);

    // 참여 중인 미션이 없는 경우 처리
    if (!allParticipatingMissions || allParticipatingMissions.length === 0) {
      return res.status(200).json({
        message: "No participating missions found",
        data: [],
      });
    }

    // 가져온 데이터 클라이언트에 반환
    res.status(200).json({
      message: "All participating missions retrieved successfully",
      data: allParticipatingMissions,
    });
  } catch (error) {
    console.error(
      "[CONTROLLER ERROR] Failed to retrieve all participating missions:",
      error.message
    );
    next(error);
  }
};
