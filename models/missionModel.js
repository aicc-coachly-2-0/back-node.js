const { postgreSQL } = require("../config/database");

// 미션 생성
exports.createMission = async (missionData, user) => {
  // 1. 미션 종료일 계산 함수
  const calculateEndedAt = (started_at, duration) => {
    const durationMapping = {
      하루: 1,
      "3일": 3,
      일주일: 7,
      "한 달": 30,
    };

    // 시작일(started_at)을 기준으로 종료일 계산
    const ended_at = new Date(started_at); // started_at 값을 기반으로 새 Date 객체 생성, new Date()로 감싸면 JavaScript의 날짜 객체로 변환
    ended_at.setDate(ended_at.getDate() + durationMapping[duration]); // 시작일 + 기간
    return ended_at;
  };

  // 미션 종료일 계산
  const ended_at = calculateEndedAt(
    missionData.started_at,
    missionData.duration
  );

  // 2. 미션 난이도 매칭 로직
  const missionLevels = {
    1: {
      "하루 1회 운동하기": "easy",
    },
    2: {
      "1끼 인증하기": "easy",
      "2끼 인증하기": "medium",
      "3끼 인증하기": "hard",
    },
    3: {
      "3천보 걷기": "easy",
      "5천보 걷기": "medium",
      "1만보 걷기": "hard",
    },
    4: {
      "3km 뛰기": "easy",
      "5km 뛰기": "medium",
      "10km 뛰기": "hard",
    },
  };

  // 카테고리 번호와 미션 이름으로 난이도 매칭
  const level =
    missionLevels[missionData.mission_number]?.[missionData.selected_mission];
  if (!level) {
    // 카테고리나 미션 이름이 잘못되었을 경우 에러
    throw new Error("유효하지 않은 미션 이름이나 카테고리입니다.");
  }

  // 3. 주간 인증 횟수 검증
  // 미션 수행 기간(duration)이 '일주일' 또는 '한 달' 선택 시 주간 인증 횟수가 비어있다면 에러
  if (
    (missionData.duration === "일주일" || missionData.duration === "한 달") &&
    !missionData.weekly_cert_count
  ) {
    throw new Error("주간 인증 횟수는 필수 입력 사항입니다.");
  }

  // 4. 인증 빈도 검증
  // 미션 수행 기간(duration)과 인증 빈도(cert_freq)의 조합이 올바른지 확인
  // 유효하지 않은 조합('하루' + '평일 매일' 등)의 경우 에러 반환.
  const validCertFreqByDuration = {
    하루: ["매일"],
    "3일": ["매일"],
    일주일: ["매일", "평일 매일", "주말 매일"],
    "한 달": ["매일", "평일 매일", "주말 매일"],
  };
  if (
    !validCertFreqByDuration[missionData.duration]?.includes(
      missionData.cert_freq
    )
  ) {
    throw new Error("유효하지 않은 인증 빈도입니다.");
  }

  // 쿼리
  const query = `
    INSERT INTO mission_rooms 
    (user_number, mission_number, title, content, started_at, ended_at, weekly_cert_count, cert_freq, img_link, level, state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'recruiting')
    RETURNING *;
  `;

  // DB에 전달할 값
  const values = [
    user.user_number, // 로그인된 유저 정보
    missionData.mission_number, // 미션 카테고리 번호
    missionData.title, // 미션 제목
    missionData.content, // 미션 설명
    missionData.started_at,
    ended_at, // 계산된 종료일
    missionData.weekly_cert_count || null, // 주간 인증 횟수 (선택적)
    missionData.cert_freq || null, // 인증 빈도 (선택적)
    missionData.img_link ||
      `default_image_path/${missionData.mission_number}.png`, // 이미지 링크 (없을 경우 기본값 사용)
    level, // 난이도 (매칭된 값)
  ];

  // 데이터 삽입 및 결과 반환
  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // 생성된 미션 방 데이터 반환
  } catch (error) {
    console.error("Error creating mission room:", error.message);
    throw error;
  }
};

// 미션 상태 업데이트 함수
exports.updateMissionStates = async () => {
  try {
    // 1. 모집중(recruiting) → 진행중(ongoing): 미션 시작일 도달 시
    const startQuery = `
      UPDATE mission_rooms
      SET state = 'ongoing'
      WHERE state = 'recruiting' AND started_at = CURRENT_DATE;
    `;
    const { rowCount: ongoingCount } = await postgreSQL.query(startQuery); // 진행중(ongoing)으로 업데이트된 행 수 반환
    // console.log(`Updated ${ongoingCount} missions to 'ongoing' state.`);

    // 2. 진행중(ongoing) → 완료(completed): 미션 종료일 도달 시
    const endQuery = `
      UPDATE mission_rooms
      SET state = 'completed'
      WHERE state = 'ongoing' AND ended_at < CURRENT_DATE;
    `;
    const { rowCount: completedCount } = await postgreSQL.query(endQuery); // 종료(completed)로 업데이트된 행 수 반환
    // console.log(`Updated ${completedCount} missions to 'completed' state.`);

    // console.log("Mission states updated successfully.");
  } catch (error) {
    console.error("Error updating mission states:", error.message);
    throw error; // 에러가 발생하면 호출한 곳으로 에러를 던짐
  }
};
