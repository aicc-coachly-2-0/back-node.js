const missionService = require("../services/missionService");

exports.createMission = async (req, res, next) => {
  try {
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
    next(error);
  }
};
