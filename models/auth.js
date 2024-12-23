const { postgreSQL } = require('../config/database');

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
    RETURNING user_number;
  `;
  const values = Object.values(userData);

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // 반환된 usernumber 포함
  } catch (error) {
    console.error('Failed to create user:', error.message);
    throw error;
  }
};

module.exports = {
  createUser,
};
