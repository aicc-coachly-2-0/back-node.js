const { postgreSQL } = require("../config/database");

// 지금 주목받는 미션 전체 조회
exports.getAllPopularMissions = async ({ category, start_date }) => {
  let query = `
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
    INNER JOIN 
        missions
    ON 
        mission_rooms.mission_number = missions.mission_number
    WHERE 
        mission_rooms.state = 'recruiting'
  `;

  // 필터링 조건을 위한 values 배열 선언
  const values = [];

  // 카테고리 필터링 (하나만 선택 가능)
  if (category) {
    // 카테고리가 하나 이상 선택되었는지 확인 (두 개 이상의 값이 들어오면 에러 처리)
    const selectedCategories = category.split(","); // ,로 나누어 배열로 분리
    if (selectedCategories.length > 1) {
      throw new Error("카테고리는 하나만 선택할 수 있습니다.");
    }

    const validCategories = ["운동", "식단", "걸음수", "러닝"];
    if (!validCategories.includes(selectedCategories[0])) {
      throw new Error(
        "유효하지 않은 카테고리입니다. 선택할 수 있는 카테고리는 '운동', '식단', '걸음수', '러닝'입니다."
      );
    }

    // 카테고리 값이 유효하면 values 배열에 추가
    values.push(selectedCategories[0]); // 첫 번째 카테고리만 values 배열에 추가
    query += ` AND missions.title = $${values.length}`; // 'missions.title'을 기준으로 카테고리 필터링
  }

  // 시작 날짜 필터링 (하나만 선택 가능)
  if (start_date) {
    // 시작 날짜가 여러 개 선택되었는지 확인 (여러 날짜가 들어오면 에러 처리)
    const startDateArray = start_date.split(","); // ,로 여러 날짜가 들어온 경우 처리
    if (startDateArray.length > 1) {
      throw new Error("시작 날짜는 하나만 선택할 수 있습니다.");
    }

    // 시작 날짜 값이 있으면 values 배열에 추가
    values.push(start_date);
    query += ` AND mission_rooms.started_at >= $${values.length}`; // 'mission_rooms.started_at'을 기준으로 시작 날짜 필터링
  }

  // 결과 쿼리문에 참여자 수 내림차순 및 방 생성일 순으로 정렬
  query += `
    GROUP BY 
        mission_rooms.room_number, 
        mission_rooms.title, 
        mission_rooms.started_at, 
        mission_rooms.img_link,
        mission_rooms.ended_at
    HAVING 
        COUNT(mission_participants.user_number) <= 2000  -- 최대 참여자 수 2000명 이하로 제한
    ORDER BY 
        participant_count DESC, mission_rooms.created_at DESC;  -- 참여자 수 내림차순, 방 생성일 순으로 정렬
  `;

  try {
    const { rows } = await postgreSQL.query(query, values);
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
    throw new Error(
      "지금 주목받는 미션 리스트를 불러오는 중 데이터베이스 오류가 발생했습니다."
    );
  }
};

// 마감 임박 미션 전체 조회
exports.getAllUpcomingMissions = async ({ category, start_date }) => {
  let query = `
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
    INNER JOIN 
        missions
    ON 
        mission_rooms.mission_number = missions.mission_number
    WHERE 
        mission_rooms.state = 'recruiting'  -- 모집 중인 미션만 조회
  `;

  // 필터링 조건을 위한 values 배열 선언
  const values = [];

  // 카테고리 필터링 (하나만 선택 가능)
  if (category) {
    // 카테고리가 하나 이상 선택되었는지 확인 (예: "운동, 식단" 형태로 두 개 이상의 값이 들어오면 에러 처리)
    const selectedCategories = category.split(","); // ,로 나누어 배열로 분리
    if (selectedCategories.length > 1) {
      throw new Error("카테고리는 하나만 선택할 수 있습니다.");
    }

    const validCategories = ["운동", "식단", "걸음수", "러닝"];
    if (!validCategories.includes(selectedCategories[0])) {
      throw new Error(
        "유효하지 않은 카테고리입니다. 선택할 수 있는 카테고리는 '운동', '식단', '걸음수', '러닝'입니다."
      );
    }

    // 카테고리 값이 유효하면 values 배열에 추가
    values.push(selectedCategories[0]); // 첫 번째 카테고리만 values 배열에 추가
    query += ` AND missions.title = $${values.length}`; // 'missions.title'을 기준으로 카테고리 필터링
  }

  // 시작 날짜 필터링 (하나만 선택 가능)
  if (start_date) {
    // 시작 날짜가 여러 개 선택되었는지 확인 (예: "2024-01-01, 2024-01-02" 형태로 여러 날짜가 들어오면 에러 처리)
    const startDateArray = start_date.split(","); // ,로 여러 날짜가 들어온 경우 처리
    if (startDateArray.length > 1) {
      throw new Error("시작 날짜는 하나만 선택할 수 있습니다.");
    }

    // 시작 날짜 값이 있으면 values 배열에 추가
    values.push(start_date);
    query += ` AND mission_rooms.started_at >= $${values.length}`; // 'mission_rooms.started_at'을 기준으로 시작 날짜 필터링
  }

  // 결과 쿼리문에 참여자 수 내림차순 및 방 생성일 순으로 정렬
  query += `
    GROUP BY 
        mission_rooms.room_number, 
        mission_rooms.title, 
        mission_rooms.started_at, 
        mission_rooms.img_link,
        mission_rooms.ended_at
    HAVING 
        COUNT(mission_participants.user_number) <= 2000  -- 최대 참여자 수 2000명 이하로 제한
    ORDER BY 
        mission_rooms.started_at ASC, mission_rooms.created_at ASC;  -- 시작일이 가까운 순서대로, 방 생성일 순으로 정렬
  `;

  try {
    const { rows } = await postgreSQL.query(query, values);
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
    throw new Error(
      "마감 임박 미션 리스트를 불러오는 중 데이터베이스 오류가 발생했습니다."
    );
  }
};

// 참여 중인 미션 전체 조회
exports.getAllParticipatingMissions = async (userNumber, { category }) => {
  let query = `
    SELECT
      mission_rooms.room_number,
      mission_rooms.title,
      TO_CHAR(mission_rooms.started_at, 'YYYY-MM-DD') AS started_at,
      mission_rooms.img_link,
      COUNT(mission_participants.user_number) AS participant_count,
      COALESCE(
        MAX(
          CASE
            WHEN mission_validations.success_status = 'approved' THEN '인증 완료'
            ELSE '인증 미완료'
          END
        ),
        '인증 미완료'
      ) AS validation_status,
      CASE
        WHEN mission_rooms.ended_at::date - mission_rooms.started_at::date = 1 THEN '하루'
        WHEN mission_rooms.ended_at::date - mission_rooms.started_at::date = 3 THEN '3일'
        WHEN mission_rooms.ended_at::date - mission_rooms.started_at::date = 7 THEN '일주일'
        WHEN mission_rooms.ended_at::date - mission_rooms.started_at::date = 30 THEN '한 달'
        ELSE '기간 알 수 없음'
      END AS duration
    FROM mission_participants
    INNER JOIN mission_rooms 
      ON mission_participants.room_number = mission_rooms.room_number
    INNER JOIN missions 
      ON mission_rooms.mission_number = missions.mission_number
    LEFT JOIN mission_validations
      ON mission_participants.group_number = mission_validations.group_number
    WHERE 
      mission_participants.user_number = $1
      AND mission_rooms.state = 'ongoing'  -- 참여 중인 미션만 조회
  `;

  const values = [userNumber];

  // 카테고리 필터링 (하나만 선택 가능)
  if (category) {
    // 카테고리 값이 하나만 선택되도록 확인
    const selectedCategories = category.split(",");
    if (selectedCategories.length > 1) {
      throw new Error("카테고리는 하나만 선택할 수 있습니다.");
    }

    const validCategories = ["운동", "식단", "걸음수", "러닝"];
    if (!validCategories.includes(selectedCategories[0])) {
      throw new Error(
        "유효하지 않은 카테고리입니다. 선택할 수 있는 카테고리는 '운동', '식단', '걸음수', '러닝'입니다."
      );
    }

    // 유효한 카테고리 값이면 필터링 조건 추가
    values.push(selectedCategories[0]);
    query += ` AND missions.title = $${values.length}`; // 카테고리 필터링
  }

  // 정렬 조건: 인증 미완료 미션을 먼저 보여주고, 시작일 순, 동일한 경우 방 생성일 순으로 정렬
  query += `
    GROUP BY mission_rooms.room_number
    ORDER BY 
      validation_status DESC,  -- '인증 미완료'가 먼저 나오게 정렬
      mission_rooms.started_at ASC,  -- 시작일 순으로 정렬
      mission_rooms.created_at ASC;  -- 방 생성일 순으로 정렬
  `;

  try {
    const { rows } = await postgreSQL.query(query, values); // 쿼리 실행
    return rows.map((row) => ({
      room_number: row.room_number, // 미션 방 번호
      title: row.title, // 미션 제목
      started_at: row.started_at, // 시작 날짜
      img_link: row.img_link, // 썸네일 이미지 링크
      participant_count: row.participant_count, // 참여 인원 수
      validation_status: row.validation_status, // 인증 상태
      duration: row.duration, // 기간
    }));
  } catch (error) {
    console.error(
      "[Model] Error fetching participating missions:",
      error.message
    );
    throw new Error(
      "참여 중인 미션 리스트를 불러오는 중 데이터베이스 오류가 발생했습니다."
    );
  }
};

// 참여했던 미션 리스트 조회
exports.getCompletedMissions = async (userNumber, { category }) => {
  let query = `
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
      mission_participants
    INNER JOIN
      mission_rooms
    ON
      mission_participants.room_number = mission_rooms.room_number
    INNER JOIN
      missions
    ON
      mission_rooms.mission_number = missions.mission_number
    WHERE
      mission_participants.user_number = $1
      AND mission_rooms.state = 'completed'
  `;

  const values = [userNumber];

  // 카테고리 필터링 조건 추가
  if (category) {
    values.push(category);
    query += ` AND missions.title = $${values.length}`; // 카테고리 필터링
  }

  query += `
    GROUP BY
      mission_rooms.room_number,
      mission_rooms.title,
      mission_rooms.started_at,
      mission_rooms.img_link,
      mission_rooms.ended_at
    ORDER BY
      mission_rooms.ended_at DESC,  -- 미션 종료일이 먼저인 순서대로 정렬
      mission_rooms.created_at ASC;  -- 종료일이 같으면 방 생성일 순으로 정렬
  `;

  try {
    const { rows } = await postgreSQL.query(query, values);

    // 빈 배열이 반환된 경우
    if (rows.length === 0) {
      console.log("[Model] No completed missions found.");
      return []; // 빈 배열 반환
    }

    return rows.map((row) => ({
      room_number: row.room_number,
      title: row.title,
      started_at: row.started_at,
      img_link: row.img_link,
      participant_count: row.participant_count,
      duration: row.duration,
    }));
  } catch (error) {
    console.error("[Model] Error fetching completed missions:", error.message);
    throw new Error(
      "진행했던 미션 리스트를 불러오는 중 데이터베이스 오류가 발생했습니다."
    );
  }
};
