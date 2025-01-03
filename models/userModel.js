const { postgreSQL } = require('../config/database');

// 전체 유저 조회
exports.findAllUsers = async () => {
  const query = `SELECT * FROM users ORDER BY created_at DESC`; 
  const { rows } = await postgreSQL.query(query);
  return rows;
};

// 상태로 유저 조회
exports.findUsersByStatus = async (status) => {
  const validStatuses = ['active', 'inactive', 'deleted', 'suspended'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }
  const query = `SELECT * FROM users WHERE status = $1 ORDER BY created_at DESC`;
  const { rows } = await postgreSQL.query(query, [status]);
  return rows;
};
  
// 전화번호로 유저 검색
exports.findUsersByPhoneNumber = async (phoneNumber) => {
  const query = `SELECT * FROM users WHERE user_phone = $1 ORDER BY created_at DESC`;
  const { rows } = await postgreSQL.query(query, [phoneNumber]);
  return rows;
};
  
// 아이디나 이름, 번호로 유저 검색
exports.findUsersByIdOrName = async (searchTerm) => {
  const query = `
    SELECT * FROM users
    WHERE user_id LIKE $1 OR user_name LIKE $1
    ORDER BY created_at DESC
  `;
  const { rows } = await postgreSQL.query(query, [`%${searchTerm}%`]);
  return rows;
};

// 사용자 정보 수정 (role에 따른 제한 처리)
exports.updateUser = async (user_id, fieldsToUpdate, role) => {
  // 관리자일 경우 모든 필드 수정 가능, 사용자일 경우 특정 필드만 수정 가능
  if (role !== 'admin') {
    fieldsToUpdate = {
      user_email: fieldsToUpdate.user_email,
      user_phone: fieldsToUpdate.user_phone,
    };
  }

  const query = `
    UPDATE users
    SET 
      user_name = COALESCE($1, user_name),
      user_email = COALESCE($2, user_email),
      user_phone = COALESCE($3, user_phone),
      user_date_of_birth = COALESCE($4, user_date_of_birth),
      user_gender = COALESCE($5, user_gender),
      status = COALESCE($6, status)
    WHERE user_id = $7
    RETURNING *;
  `;

  const values = [
    fieldsToUpdate.user_name,
    fieldsToUpdate.user_email,
    fieldsToUpdate.user_phone,
    fieldsToUpdate.user_date_of_birth,
    fieldsToUpdate.user_gender,
    fieldsToUpdate.status,
    user_id,
  ];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // 업데이트된 사용자 정보 반환
  } catch (error) {
    console.error('Failed to update user:', error.message);
    throw error;
  }
};
