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
      "하루에 1번 운동하기": "easy",
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

  // 3. 디폴트 이미지 URL 설정 로직
  const baseUrl = "http://222.112.27.120/coachly/mission";

  const defaultImages = {
    1: `${baseUrl}/운동_default.jpg`,
    2: `${baseUrl}/식단_default.jpg`,
    3: `${baseUrl}/걸음수_default.jpg`,
    4: `${baseUrl}/러닝_default.jpg`,
  };

  // 유저가 이미지 업로드를 하지 않았을 경우 디폴트 이미지 설정
  const img_link =
    missionData.img_link || `${defaultImages[missionData.mission_number]}`;

  // 4. 주간 인증 횟수 검증
  // 미션 수행 기간(duration)이 '일주일' 또는 '한 달' 선택 시 주간 인증 횟수가 비어있다면 에러
  if (
    (missionData.duration === "일주일" || missionData.duration === "한 달") &&
    !missionData.weekly_cert_count
  ) {
    throw new Error("주간 인증 횟수는 필수 입력 사항입니다.");
  }

  // 4-1. 주간 인증 횟수 범위 검증
  if (missionData.duration === "일주일" || missionData.duration === "한 달") {
    const validRanges = {
      매일: [1, 7], // 1~7회
      "평일 매일": [1, 5], // 1~5회
      "주말 매일": [1, 2], // 1~2회
    };

    // 인증 빈도에 따른 유효한 범위 가져오기
    const [min, max] = validRanges[missionData.cert_freq] || [];
    if (!min || !max) {
      throw new Error("유효하지 않은 인증 빈도입니다.");
    }

    // 주간 인증 횟수가 범위를 벗어날 경우 에러 반환
    if (
      missionData.weekly_cert_count < min ||
      missionData.weekly_cert_count > max
    ) {
      throw new Error(
        `인증 빈도가 '${missionData.cert_freq}'인 경우 주간 인증 횟수는 ${min}~${max}회여야 합니다.`
      );
    }
  }

  // 5. 인증 빈도 검증
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
    img_link, // 이미지 링크 (유저 업로드 또는 디폴트 이미지)
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
      WHERE state = 'ongoing' AND ended_at <= CURRENT_DATE;
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
  // 미션방 상태 확인
  const checkStateQuery = `
    SELECT state
    FROM mission_rooms
    WHERE room_number = $1;
  `;

  // 중복 참여자 확인
  const checkParticipantQuery = `
    SELECT EXISTS (
        SELECT 1
        FROM mission_participants
        WHERE user_number = $1 AND room_number = $2 AND state = 'active'
    ) AS exists;
  `;

  // 참여자 추가
  const insertParticipantQuery = `
    INSERT INTO mission_participants (user_number, room_number, state)
    VALUES ($1, $2, 'active')
    RETURNING *;
  `;

  try {
    // 트랜잭션 시작
    await postgreSQL.query("BEGIN");

    // 1. 미션방 상태 확인
    const { rows: stateRows } = await postgreSQL.query(checkStateQuery, [
      room_number,
    ]);

    if (stateRows.length === 0) {
      throw { status: 404, message: "존재하지 않는 미션방입니다." };
    }

    const roomState = stateRows[0].state;
    if (roomState !== "recruiting") {
      throw {
        status: 403,
        message: "해당 미션방은 참여할 수 없는 상태입니다.",
      }; // 상태가 recruiting이 아닌 경우 에러 반환
    }

    // 2. 중복 확인
    const { rows: participantRows } = await postgreSQL.query(
      checkParticipantQuery,
      [user_number, room_number]
    );
    if (participantRows[0].exists) {
      throw { status: 409, message: "이미 해당 미션방에 참여 중입니다." };
    }

    // 3. 중복이 아닌 경우 참여자 추가
    const result = await postgreSQL.query(insertParticipantQuery, [
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

exports.getPopularMissions = async () => {
  const query = `
    SELECT 
        mission_rooms.room_number,
        mission_rooms.mission_number,
        mission_rooms.user_number,
        mission_rooms.title,
        mission_rooms.content,
        mission_rooms.started_at,
        mission_rooms.img_link AS mission_img_link,  -- mission_rooms 테이블의 img_link
        mission_rooms.ended_at,
        mission_rooms.level AS mission_level,  -- mission_rooms 테이블의 level 컬럼
        mission_rooms.cert_freq,
        users.img_link AS user_img_link  -- users 테이블에서 img_link 가져오기
    FROM 
        mission_rooms
    LEFT JOIN 
        users ON mission_rooms.user_number = users.user_number  -- users 테이블과 LEFT JOIN
    WHERE 
        mission_rooms.state = 'recruiting'  -- 모집중인 미션만
    ORDER BY 
        mission_rooms.created_at ASC;  -- 생성일 기준으로 정렬
  `;

  try {
    const { rows } = await postgreSQL.query(query);

    return rows.map((row) => ({
      room_number: row.room_number,
      mission_number: row.mission_number,
      user_number: row.user_number,
      title: row.title,
      content: row.content,
      started_at: row.started_at,
      mission_img_link: row.mission_img_link, // mission_rooms 테이블의 img_link
      ended_at: row.ended_at,
      mission_level: row.mission_level, // mission_rooms 테이블의 level 컬럼
      cert_freq: row.cert_freq,
      user_img_link: row.user_img_link, // users 테이블의 img_link
    }));
  } catch (error) {
    console.error("[MODEL ERROR] 인기 미션 조회 실패:", error.message);
    throw new Error("인기 미션 조회 중 데이터베이스 오류가 발생했습니다.");
  }
};

// 마감 임박 미션 조회 5개 조회
exports.getUpcomingMissions = async () => {
  // 모집중 상태의 미션 중 시작일이 가까운 순서대로 조회
  const query = `
    SELECT 
        mission_rooms.room_number,
        mission_rooms.title,
        TO_CHAR(mission_rooms.started_at, 'YYYY-MM-DD') AS started_at,
        mission_rooms.img_link,
        COUNT(mission_participants.user_number) AS participant_count,
        CASE 
          WHEN mission_rooms.ended_at::date - mission_rooms.started_at::date = 1 THEN '하루'
          WHEN mission_rooms.ended_at::date - mission_rooms.started_at::date = 3 THEN '3일'
          WHEN mission_rooms.ended_at::date - mission_rooms.started_at::date = 7 THEN '일주일'
          WHEN mission_rooms.ended_at::date - mission_rooms.started_at::date = 30 THEN '한 달'
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
        mission_rooms.started_at ASC, mission_rooms.created_at ASC
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
    console.error("[MODEL ERROR] 마감 임박 미션 조회 실패:", error.message);
    throw new Error("마감 임박 미션 조회 중 데이터베이스 오류가 발생했습니다.");
  }
};

// 참여 중인 미션 조회
exports.getParticipatingMissions = async (userNumber) => {
  // 로그인한 유저가 참여 중인 미션방 리스트를 모두 조회
  const query = `
    SELECT
      mission_rooms.room_number
    FROM 
        mission_participants
    INNER JOIN 
        mission_rooms ON mission_participants.room_number = mission_rooms.room_number
    WHERE 
        mission_participants.user_number = $1
    AND 
        mission_rooms.state = 'recruiting'
    GROUP BY 
        mission_rooms.room_number
    ORDER BY 
        mission_rooms.started_at ASC, mission_rooms.created_at ASC;
  `;

  // 쿼리에 사용할 유저 번호 바인딩
  const values = [userNumber];

  try {
    const { rows } = await postgreSQL.query(query, values);

    // room_number 리스트를 추출
    const roomNumbers = rows.map((row) => row.room_number);

    // 두 번째 쿼리: 참여 중인 미션들의 상세 정보 조회
    const detailQuery = `
      SELECT 
        mission_rooms.room_number,
        mission_rooms.mission_number,
        mission_rooms.user_number,
        mission_rooms.title,
        mission_rooms.content,
        TO_CHAR(mission_rooms.started_at, 'YYYY-MM-DD') AS started_at,
        mission_rooms.img_link AS mission_img_link,  -- mission_rooms 테이블의 img_link
        mission_rooms.ended_at,
        mission_rooms.level AS mission_level,  -- mission_rooms 테이블의 level 컬럼
        mission_rooms.cert_freq,
        users.img_link AS user_img_link  -- users 테이블에서 img_link 가져오기
      FROM 
        mission_rooms
      LEFT JOIN 
        users ON mission_rooms.user_number = users.user_number  -- users 테이블과 LEFT JOIN
      WHERE 
        mission_rooms.state = 'recruiting'  -- 모집중인 미션만
        AND mission_rooms.room_number = ANY($1)  -- 첫 번째 쿼리에서 가져온 room_number들을 조건으로 추가
      ORDER BY 
        mission_rooms.created_at ASC;  -- 생성일 기준으로 정렬
    `;

    // 두 번째 쿼리에 roomNumbers 배열을 전달
    const detailsValues = [roomNumbers];

    const missionDetails = await postgreSQL.query(detailQuery, detailsValues);

    // 필요한 데이터만 반환
    return missionDetails.rows.map((row) => ({
      room_number: row.room_number, // 미션 방 번호
      mission_number: row.mission_number, // 미션 번호
      user_number: row.user_number, // 미션 생성자 번호
      title: row.title, // 미션 제목
      content: row.content, // 미션 내용
      started_at: row.started_at, // 미션 시작일
      mission_img_link: row.mission_img_link, // 미션 썸네일 이미지
      ended_at: row.ended_at, // 미션 종료일
      mission_level: row.mission_level, // 미션 레벨
      cert_freq: row.cert_freq, // 인증 빈도
      user_img_link: row.user_img_link, // 미션 생성자 이미지
    }));
  } catch (error) {
    console.error(
      "[Model] Error fetching participating missions:",
      error.message
    );
    throw new Error(
      "참여 중인 미션을 불러오는 중 데이터베이스 오류가 발생했습니다."
    );
  }
};
