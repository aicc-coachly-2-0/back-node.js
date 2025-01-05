const { postgreSQL } = require("../config/database");

// 모집 중인 미션 상세 페이지 조회 (상태와 관계없이 조회 가능)
exports.getRecruitingMissionDetails = async (room_number) => {
  const query = `
    SELECT 
        mission_rooms.room_number,
        mission_rooms.title AS mission_room_title,
        mission_rooms.content AS mission_room_content,
        mission_rooms.started_at,
        mission_rooms.ended_at,
        mission_rooms.cert_freq,
        COALESCE(mission_rooms.weekly_cert_count, '하루 1회') AS weekly_cert_count,
        mission_rooms.img_link,
        missions.title AS mission_category_title,
        users.user_name AS room_creator_name,
        COUNT(mission_participants.user_number) AS participant_count
    FROM mission_rooms
    JOIN missions ON mission_rooms.mission_number = missions.mission_number
    JOIN users ON mission_rooms.user_number = users.user_number
    LEFT JOIN mission_participants ON mission_rooms.room_number = mission_participants.room_number
    WHERE mission_rooms.room_number = $1
    GROUP BY mission_rooms.room_number, mission_rooms.title, mission_rooms.content, mission_rooms.started_at, mission_rooms.ended_at, mission_rooms.cert_freq, mission_rooms.img_link, missions.title, users.user_name
  `;

  try {
    const { rows } = await postgreSQL.query(query, [room_number]);

    // 조회된 미션 반환, 미션이 없으면 null 반환
    return rows[0] || null;
  } catch (error) {
    console.error(
      "[MODEL ERROR] Failed to retrieve mission details:",
      error.message
    );
    throw new Error("미션 상세 조회 중 오류가 발생했습니다.");
  }
};

// 진행 중 또는 완료된 미션 상세 페이지 조회
exports.getMissionDetails = async (room_number) => {
  const query = `
    SELECT 
        mission_rooms.room_number,
        mission_rooms.title AS mission_room_title,
        mission_rooms.started_at,
        mission_rooms.ended_at,
        mission_rooms.cert_freq,
        COALESCE(mission_rooms.weekly_cert_count, '하루 1회') AS weekly_cert_count,
        mission_rooms.img_link
    FROM mission_rooms
    WHERE mission_rooms.room_number = $1
    AND mission_rooms.state IN ('ongoing', 'completed')  -- 상태가 'ongoing' 또는 'completed'인 경우만 조회
  `;

  try {
    const { rows } = await postgreSQL.query(query, [room_number]);

    // 상태가 'ongoing' 또는 'completed'인 경우만 반환
    return rows[0] || null; // 미션이 없거나 상태가 해당하지 않으면 null 반환
  } catch (error) {
    console.error(
      "[MODEL ERROR] Failed to retrieve mission details:",
      error.message
    );
    throw new Error("미션 상세 조회 중 오류가 발생했습니다.");
  }
};
