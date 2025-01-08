const { postgreSQL } = require('../config/database');

// 1. room_number를 기반으로 mission_rooms의 상태 확인
exports.checkMissionRoomState = async (room_number) => {
  const query = `
    SELECT state
    FROM mission_rooms
    WHERE room_number = $1;
  `;
  const values = [room_number];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]?.state || null; // state 반환 (없으면 null)
  } catch (error) {
    console.error('checkMissionRoomState 실패:', error.message);
    throw error;
  }
};

// 2. room_number와 user_number를 기반으로 group_number 조회
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
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]?.group_number || null; // group_number 반환 (없으면 null)
  } catch (error) {
    console.error('findGroupNumber 실패:', error.message);
    throw error;
  }
};

// 3. group_number와 이미지 URL 데이터를 mission_validations 테이블에 저장
exports.postMissionValidation = async ({ group_number, image_url }) => {
  const query = `
    INSERT INTO mission_validations (group_number, img_link)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [group_number, image_url];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // 삽입된 데이터 반환
  } catch (error) {
    console.error('createMissionValidation 실패:', error.message);
    throw error;
  }
};

// 미션 인증 데이터 저장
// 1. user_number와 mission_validation_number를 기반으로 group_number 조회
exports.findGroupNumber2 = async (user_number, mission_validation_number) => {
  const query = `
    SELECT mission_participants.group_number
    FROM mission_participants
    JOIN mission_validations
    ON mission_validations.group_number = mission_participants.group_number
    WHERE mission_participants.user_number = $1
      AND mission_validations.mission_validation_number = $2
      AND mission_participants.state = 'active'; -- 활성 상태의 유저만 조회
  `;
  const values = [user_number, mission_validation_number];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]?.group_number || null; // 조회된 group_number 반환
  } catch (error) {
    console.error('findGroupNumber2 실패:', error.message);
    throw error;
  }
};

// 2. 인증 확인 데이터 삽입
exports.insertValidationApproval = async ({
  mission_validation_number,
  group_number,
}) => {
  const query = `
    INSERT INTO validation_approvals (mission_validation_number, group_number)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [mission_validation_number, group_number];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // 삽입된 데이터 반환
  } catch (error) {
    console.error('insertValidationApproval 실패:', error.message);
    throw error;
  }
};
