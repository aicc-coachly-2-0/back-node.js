const db = require('../config/database'); // DB 연결 설정

// 1. room_number와 user_number를 기반으로 group_number 조회
exports.findGroupNumber = async (user_number, room_number) => {
  const query = `
    SELECT group_number
    FROM mission_participants
    WHERE user_number = $1
      AND room_number = $2
      AND state = 'active'; -- 활성 상태의 참가자만 조회
  `;
  const values = [user_number, room_number];

  try {
    const { rows } = await db.query(query, values);
    return rows[0]?.group_number || null; // group_number 반환 (없으면 null)
  } catch (error) {
    console.error('findGroupNumber 실패:', error.message);
    throw error;
  }
};

// 2. group_number와 이미지 URL 데이터를 mission_validations 테이블에 저장
exports.postMissionValidation = async ({ group_number, image_url }) => {
  const query = `
    INSERT INTO mission_validations (group_number, img_link)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [group_number, image_url];

  try {
    const { rows } = await db.query(query, values);
    return rows[0]; // 삽입된 데이터 반환
  } catch (error) {
    console.error('createMissionValidation 실패:', error.message);
    throw error;
  }
};
