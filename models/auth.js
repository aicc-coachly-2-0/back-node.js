const pool = require('../config/database');

// 사용자 생성 (회원가입)
const createUser = async ({
  user_id,
  user_name,
  user_email,
  user_pw,
  user_phone,
  user_date_of_birth,
  user_gender,
}) => {
  const query = `
    INSERT INTO users (
      user_id, user_name, user_email, user_pw, user_phone, user_date_of_birth, user_gender
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    user_id,
    user_name,
    user_email,
    user_pw,
    user_phone,
    user_date_of_birth,
    user_gender,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // 삽입된 사용자 데이터 반환
  } catch (error) {
    console.error('Failed to create user:', error.message);
    throw error;
  }
};

module.exports = {
  createUser,
};
