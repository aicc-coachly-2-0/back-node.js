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
    return ended_at.toISOString().split("T")[0];
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

  // 미션방 생성 쿼리
  const createRoomQuery = `
    INSERT INTO mission_rooms 
    (user_number, mission_number, title, content, started_at, ended_at, weekly_cert_count, cert_freq, img_link, level, state)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'recruiting')
    RETURNING *;
  `;

  const creatorParticipantQuery = `
    INSERT INTO mission_participants (user_number, room_number, state)
    VALUES ($1, $2, 'active');
  `;

  // DB에 전달할 값
  const roomValues = [
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
    const { rows } = await postgreSQL.query(createRoomQuery, roomValues);
    const createdRoom = rows[0];

    // 방장을 자동으로 참여자로 등록
    const creatorParticipantValues = [
      user.user_number,
      createdRoom.room_number,
    ];
    await postgreSQL.query(creatorParticipantQuery, creatorParticipantValues);

    return createdRoom; // 생성된 미션 방 데이터 반환
  } catch (error) {
    console.error(
      "Error creating mission room or adding participant:",
      error.message
    );
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

    console.log(`Updated ${ongoingCount} missions to 'ongoing' state.`);

    // 2. 진행중(ongoing) → 완료(completed): 미션 종료일 도달 시
    const endQuery = `
      UPDATE mission_rooms
      SET state = 'completed'
      WHERE state = 'ongoing' AND ended_at < CURRENT_DATE;
    `;
    const { rowCount: completedCount } = await postgreSQL.query(endQuery); // 종료(completed)로 업데이트된 행 수 반환
    console.log(`Updated ${completedCount} missions to 'completed' state.`);

    console.log("Mission states updated successfully.");
  } catch (error) {
    console.error("Error updating mission states:", error.message);
    throw error; // 에러가 발생하면 호출한 곳으로 에러를 던짐
  }
};

// 미션방 참여 -> 사용자를 특정 미션방에 참여자로 등록
exports.joinMissionRoom = async (user_number, room_number) => {
  // 중복 참여자 확인
  const checkQuery = `
    SELECT EXISTS (
        SELECT 1
        FROM mission_participants
        WHERE user_number = $1 AND room_number = $2 AND state = 'active'
    ) AS exists;
`;

  // 참여자 추가
  const insertQuery = `
    INSERT INTO mission_participants (user_number, room_number, state)
    VALUES ($1, $2, 'active')
    RETURNING *;
  `;

  try {
    // 트랜잭션 시작
    // 트랜잭션이란, 데이터베이스에서 여러 작업을 하나의 묶음으로 처리하는 것
    // 트랜잭션 안에 있는 작업은 모두 성공해야만 데이터베이스에 실제로 반영됨. 하나라도 실패 시 모두 취소(롤백).
    await postgreSQL.query("BEGIN");

    // 1. 중복 확인
    const { rows } = await postgreSQL.query(checkQuery, [
      user_number,
      room_number,
    ]);
    if (rows[0].exists) {
      throw new Error("이미 해당 미션방에 참여 중입니다.");
    }

    // 2. 중복이 아닌 경우 참여자 추가
    const result = await postgreSQL.query(insertQuery, [
      user_number,
      room_number,
    ]);

    await postgreSQL.query("COMMIT"); // 트랜잭션 커밋

    // 참여자 정보 반환
    return result.rows[0];
  } catch (error) {
    await postgreSQL.query("ROLLBACK"); // 에러 발생 시 롤백
    console.error("Error adding participant to mission room:", error.message);
    throw error;
  }
};

// 지금 주목받는 미션 5개 조회 (모집중 상태의 미션 중 참여자가 많은 순으로 최대 5개 조회)
exports.getPopularMissions = async () => {
  // 쿼리문: 모집중인 미션만 조회하고 참여자가 많은 순서로 정렬
  const query = `
    SELECT 
        mission_rooms.room_number,
        mission_rooms.title,
        mission_rooms.started_at,
        mission_rooms.img_link,
        COUNT(mission_participants.user_number) AS participant_count,
        CASE 
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 0 THEN '하루'
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 2 THEN '3일'
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 6 THEN '일주일'
          WHEN mission_rooms.ended_at - mission_rooms.started_at >= 29 THEN '한 달'
          ELSE '기간 알 수 없음'
        END AS duration
    FROM 
        mission_rooms
    LEFT JOIN 
        mission_participants
    ON 
        mission_rooms.room_number = mission_participants.room_number
    WHERE 
        mission_rooms.state = 'recruiting'
    GROUP BY 
        mission_rooms.room_number, 
        mission_rooms.title, 
        mission_rooms.started_at, 
        mission_rooms.img_link,
        mission_rooms.ended_at
    HAVING 
        COUNT(mission_participants.user_number) <= 2000
    ORDER BY 
        participant_count DESC
    LIMIT 5;
  `;

  try {
    // 데이터베이스 쿼리 실행
    const { rows } = await postgreSQL.query(query);

    // 필요한 데이터만 반환
    return rows.map((row) => ({
      room_number: row.room_number,
      title: row.title,
      started_at: row.started_at,
      img_link: row.img_link,
      participant_count: row.participant_count,
      duration: row.duration,
    }));
  } catch (error) {
    console.error("[MODEL ERROR] 인기 미션 조회 실패:", error.message);
    throw new Error("인기 미션 조회 중 데이터베이스 오류가 발생했습니다.");
  }
};
