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
    return rows[0]?.group_number || null; // group_number 반환 (없으면 null)
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
    return rows[0]?.state || null; // state 반환 (없으면 null)
  } catch (error) {
    console.error('checkMissionRoomState 실패:', error.message);
    throw error;
  }
};

// group_number와 이미지 URL 데이터를 mission_validations 테이블에 저장
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

// 인증샷 확인해주기
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
    console.error('findGroupNumberByValidation 실패:', error.message);
    throw error;
  }
};

// 2. 인증 확인 데이터 삽입
exports.insertValidationApproval = async ({
  mission_validation_number,
  group_number,
}) => {
  const client = await postgreSQL.connect();
  try {
    await client.query('BEGIN');

    // 1. 현재 인증 상태 확인
    const { rows: stateRows } = await client.query(
      `
      SELECT state
      FROM mission_validations
      WHERE mission_validation_number = $1;
    `,
      [mission_validation_number]
    );

    const { state } = stateRows[0];

    // 상태가 approved라면 연산 생략
    if (state === 'approved') {
      await client.query('COMMIT');
      return { message: '이미 approved 상태입니다.' };
    }

    // 2. 인증 확인 데이터 삽입
    await client.query(
      `
      INSERT INTO validation_approvals (mission_validation_number, group_number)
      VALUES ($1, $2)
    `,
      [mission_validation_number, group_number]
    );

    // 3. 상태가 pending일 경우 확인 수 계산
    const { rows: countRows } = await client.query(
      `
      SELECT COUNT(*) AS approval_count
      FROM validation_approvals
      WHERE mission_validation_number = $1;
    `,
      [mission_validation_number]
    );

    const approval_count = parseInt(countRows[0].approval_count, 10);

    // 4. 확인 수가 3 이상이면 상태 변경
    if (approval_count >= 3) {
      await client.query(
        `
        UPDATE mission_validations
        SET state = 'approved'
        WHERE mission_validation_number = $1
      `,
        [mission_validation_number]
      );
    }

    await client.query('COMMIT');
    return { message: '인증 확인 성공', approvalCount: approval_count };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 로그인한 사용자의 미션 인증샷 전체 리스트 조회
exports.findUserMissionValidations = async (group_number) => {
  const query = `
    SELECT mission_validations.img_link, mission_validations.created_at, mission_validations.state
    FROM mission_validations
    WHERE mission_validations.group_number = $1
      AND mission_validations.state = 'active'
    ORDER BY mission_validations.created_at DESC; -- 최신순으로 정렬
  `;
  const values = [group_number];

  try {
    const { rows } = await postgreSQL.query(query, values);

    // 데이터가 없을 경우 빈 배열 반환
    return rows || [];
  } catch (error) {
    console.error('findUserMissionValidations 실패:', error.message);
    throw error; // 에러 전달
  }
};

// 참가자 인증샷 전체 리스트 조회 (로그인 유저 제외한 미션방 참여 유저)
exports.findParticipantValidations = async (group_number, room_number) => {
  const query = `
    SELECT 
      mission_validations.img_link, 
      mission_validations.created_at, 
      mission_validations.state
    FROM mission_validations
    JOIN mission_participants
      ON mission_validations.group_number = mission_participants.group_number
    WHERE mission_participants.room_number = $1
      AND mission_participants.group_number != $2 -- 현재 사용자의 group_number 제외
      AND mission_validations.state = 'active'   -- 활성화된 인증샷만 조회
    ORDER BY mission_validations.created_at DESC; -- 최신순으로 정렬
  `;
  const values = [room_number, group_number];

  try {
    const { rows } = await postgreSQL.query(query, values);

    // 데이터가 없을 경우 빈 배열 반환
    return rows || [];
  } catch (error) {
    console.error('findParticipantValidations 실패:', error.message);
    throw error; // 에러 전달
  }
};
