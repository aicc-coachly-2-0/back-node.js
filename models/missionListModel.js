const { postgreSQL } = require("../config/database");

// 지금 주목받는 미션 전체 조회
exports.getAllPopularMissions = async () => {
  const query = `
    SELECT 
        mission_rooms.room_number,
        mission_rooms.title,
        mission_rooms.started_at,
        mission_rooms.img_link,
        COUNT(mission_participants.user_number) AS participant_count,
        CASE 
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 1 THEN '하루'
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 3 THEN '3일'
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 7 THEN '일주일'
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 30 THEN '한 달'
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
        participant_count DESC;
  `;

  try {
    const { rows } = await postgreSQL.query(query);
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

// 마감 임박 미션 전체 조회
exports.getAllUpcomingMissions = async () => {
  const query = `
    SELECT 
        mission_rooms.room_number,
        mission_rooms.title,
        mission_rooms.started_at,
        mission_rooms.img_link,
        COUNT(mission_participants.user_number) AS participant_count,
        CASE 
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 1 THEN '하루'
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 3 THEN '3일'
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 7 THEN '일주일'
          WHEN mission_rooms.ended_at - mission_rooms.started_at = 30 THEN '한 달'
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
        AND mission_rooms.started_at > CURRENT_DATE
    GROUP BY 
        mission_rooms.room_number, 
        mission_rooms.title, 
        mission_rooms.started_at, 
        mission_rooms.img_link,
        mission_rooms.ended_at
    HAVING 
        COUNT(mission_participants.user_number) <= 2000
    ORDER BY 
        mission_rooms.started_at ASC;
  `;

  try {
    const { rows } = await postgreSQL.query(query);
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

// 참여 중인 미션 전체 조회
exports.getAllParticipatingMissions = async (userNumber) => {
  const query = `
    SELECT
      mission_rooms.room_number,
      mission_rooms.title,
      mission_rooms.started_at,
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
        WHEN mission_rooms.ended_at - mission_rooms.started_at = 1 THEN '하루'
        WHEN mission_rooms.ended_at - mission_rooms.started_at = 3 THEN '3일'
        WHEN mission_rooms.ended_at - mission_rooms.started_at = 7 THEN '일주일'
        WHEN mission_rooms.ended_at - mission_rooms.started_at = 30 THEN '한 달'
        ELSE '기간 알 수 없음'
      END AS duration
    FROM mission_participants
    INNER JOIN mission_rooms ON mission_participants.room_number = mission_rooms.room_number
    LEFT JOIN mission_validations
      ON mission_participants.group_number = mission_validations.group_number
    WHERE mission_participants.user_number = $1
      AND mission_rooms.state = 'ongoing'
    GROUP BY mission_rooms.room_number
    ORDER BY mission_rooms.started_at ASC;
  `;

  const values = [userNumber];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows.map((row) => ({
      room_number: row.room_number,
      title: row.title,
      started_at: row.started_at,
      img_link: row.img_link,
      participant_count: row.participant_count,
      validation_status: row.validation_status,
      duration: row.duration,
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

// 참여했던 미션 리스트 조회
exports.getCompletedMissions = async (userNumber) => {
  const query = `
    SELECT
      mission_rooms.room_number,
      mission_rooms.title,
      mission_rooms.started_at,
      mission_rooms.img_link,
      COUNT(mission_participants.user_number) AS participant_count,
      CASE
        WHEN mission_rooms.ended_at - mission_rooms.started_at = 1 THEN '하루'
        WHEN mission_rooms.ended_at - mission_rooms.started_at = 3 THEN '3일'
        WHEN mission_rooms.ended_at - mission_rooms.started_at = 7 THEN '일주일'
        WHEN mission_rooms.ended_at - mission_rooms.started_at = 30 THEN '한 달'
        ELSE '기간 알 수 없음'
      END AS duration
    FROM
      mission_participants
    INNER JOIN
      mission_rooms
    ON
      mission_participants.room_number = mission_rooms.room_number
    WHERE
      mission_participants.user_number = $1 
      AND mission_rooms.state = 'completed'
    GROUP BY
      mission_rooms.room_number, 
      mission_rooms.title,
      mission_rooms.started_at,
      mission_rooms.img_link,
      mission_rooms.ended_at
    ORDER BY
      mission_rooms.started_at ASC;
  `;

  const values = [userNumber];

  try {
    const { rows } = await postgreSQL.query(query, values);

    // 필요한 데이터만 반환
    return rows.map((row) => ({
      room_number: row.room_number, // 미션 방 번호
      title: row.title, // 미션 제목
      started_at: row.started_at, // 미션 시작일
      img_link: row.img_link, // 썸네일 이미지 링크
      participant_count: row.participant_count, // 현재 참여 중인 인원 수
      duration: row.duration, // 미션 진행 기간
    }));
  } catch (error) {
    console.error("[Model] Error fetching completed missions:", error.message);
    throw new Error(
      "완료된 미션 리스트를 불러오는 중 데이터베이스 오류가 발생했습니다."
    );
  }
};
