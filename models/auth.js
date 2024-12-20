const { pool } = require('../config/database');

const createUser = async (userData) => {
  const query = `
    INSERT INTO users (
      user_id, user_name, user_email, user_pw, user_phone, user_date_of_birth, user_gender
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = Object.values(userData); // 객체의 값들을 배열로 변환

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Failed to create user:', error.message);
    throw error;
  }
};

module.exports = { createUser };
