const { postgreSQL } = require('../config/database');

// 공통 함수: room_number와 user_number를 기반으로 group_number 조회
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
    return rows[0]?.group_number || null;
  } catch (error) {
    console.error('findGroupNumber 실패:', error.message);
    throw error;
  }
};
// =============================================================================================

// 미션 인증샷 업로드
// room_number를 기반으로 mission_rooms의 상태 확인
exports.checkMissionRoomState = async (room_number) => {
  const query = `
    SELECT state
    FROM mission_rooms
    WHERE room_number = $1;
  `;
  const values = [room_number];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]?.state || null;
  } catch (error) {
    console.error('checkMissionRoomState 실패:', error.message);
    throw error;
  }
};

// room_number, user_number, 이미지 URL 데이터를 mission_validations 테이블에 저장
exports.postMissionValidation = async ({
  room_number,
  user_number,
  image_url,
}) => {
  const query = `
    INSERT INTO mission_validations (room_number, user_number, img_link, created_at, state)
    VALUES ($1, $2, $3, NOW(), 'pending')
    RETURNING *;
  `;
  const values = [room_number, user_number, image_url];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('postMissionValidation 실패:', error.message);
    throw error;
  }
};

// 미션 인증샷 상세 조회
// exports.findValidationDetails = async (mission_validation_number) => {
//   const query = `
//     SELECT
//         mission_validations.img_link AS validation_img_link,
//         mission_validations.created_at AS validation_created_at,
//         users.user_name,
//         users.img_link AS user_img_link,
//         (
//             SELECT COUNT(*)
//             FROM validation_approvals
//             WHERE validation_approvals.mission_validation_number = mission_validations.mission_validation_number
//         ) AS approval_count
//     FROM
//         mission_validations
//     JOIN
//         mission_participants ON mission_validations.group_number = mission_participants.group_number
//     JOIN
//         users ON mission_participants.user_number = users.user_number
//     WHERE
//         mission_validations.mission_validation_number = $1;
//   `;

//   const values = [mission_validation_number];

//   try {
//     const { rows } = await postgreSQL.query(query, values);

//     return rows[0] || null;
//   } catch (error) {
//     console.error('findValidationDetails 실패:', error.message);
//     throw error;
//   }
// };

// 인증샷 확인해주기
exports.insertApproval = async (mission_validation_number, user_number) => {
  const query = `
    INSERT INTO validation_approvals (mission_validation_number, user_number, created_at, state)
    SELECT $1, $2, NOW(), 'active'
    FROM mission_validations
    WHERE mission_validation_number = $1
      AND user_number != $2
    RETURNING *;
  `;
  const values = [mission_validation_number, user_number];

  try {
    const { rows } = await postgreSQL.query(query, values);

    if (rows.length === 0) {
      throw new Error('본인의 인증샷에 확인을 누를 수 없습니다.');
    }

    return rows[0];
  } catch (error) {
    // 유니크 제약 조건 위반 에러 처리
    if (error.code === '23505') {
      // PostgreSQL의 유니크 제약 조건 위반 에러 코드
      throw new Error('이미 확인을 누른 인증샷입니다.');
    }

    console.error('insertApproval 실패:', error.message);
    throw error;
  }
};

// 인증 몇 명 했는지 확인해주기, 인증 성공 여부 반환하기
exports.getValidationData = async (mission_validation_number) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) 
       FROM validation_approvals 
       WHERE mission_validation_number = $1 
         AND state = 'active') AS approval_count,
      (SELECT success_status 
       FROM mission_validations 
       WHERE mission_validation_number = $1) AS success_status;
  `;
  const values = [mission_validation_number];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // approval_count와 success_status를 반환
  } catch (error) {
    console.error('Error in getValidationData model:', error.message);
    throw error;
  }
};

// 사용자의 미션 인증샷 전체 리스트 조회
exports.findUserMissionValidations = async (user_number, room_number) => {
  const query = `
    SELECT 
      users.user_name, -- 사용자 이름
      users.img_link AS user_img_link,
      mission_validations.img_link AS validation_img_link,
      mission_validations.created_at
    FROM mission_validations
    JOIN users 
      ON mission_validations.user_number = users.user_number
    WHERE mission_validations.user_number = $1
      AND mission_validations.room_number = $2
      AND mission_validations.state = 'active'
    ORDER BY mission_validations.created_at DESC;
  `;
  const values = [user_number, room_number];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows || [];
  } catch (error) {
    console.error('findUserMissionValidations 실패:', error.message);
    throw error;
  }
};

// 참가자 인증샷 전체 리스트 조회
exports.findParticipantValidations = async (room_number) => {
  const query = `
    SELECT 
      users.user_name,
      users.img_link AS user_img_link,
      mission_validations.img_link AS validation_img_link,
      mission_validations.created_at
    FROM mission_validations
    JOIN users 
      ON mission_validations.user_number = users.user_number
    WHERE mission_validations.room_number = $1
      AND mission_validations.state = 'active'
    ORDER BY mission_validations.created_at DESC;
  `;
  const values = [room_number];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows || [];
  } catch (error) {
    console.error('findParticipantValidations 실패:', error.message);
    throw error;
  }
};
