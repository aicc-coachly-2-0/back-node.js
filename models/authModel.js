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
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // 반환된 user_number 포함
  } catch (error) {
    console.error('Failed to create user:', error.message);
    throw error;
  }
};

const findUserById = async (user_id) => {
  const query = `
    SELECT * FROM users WHERE user_id = $1;
  `;
  try {
    const { rows } = await postgreSQL.query(query, [user_id]);
    return rows[0];
  } catch (error) {
    console.error('Failed to find user:', error.message);
    throw error;
  }
};

// 관리자 생성
const createAdmin = async ({ admin_id, admin_pw }) => {
  const query = `
    INSERT INTO administrators (
      admin_id, admin_pw
    ) VALUES ($1, $2)
    RETURNING *;
  `;

  const values = [admin_id, admin_pw];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // 반환된 user_number 포함
  } catch (error) {
    console.error('Failed to create user:', error.message);
    throw error;
  }
};

const findAdminById = async (admin_id) => {
  const query = `
    SELECT * FROM administrators WHERE admin_id = $1;
  `;
  try {
    const { rows } = await postgreSQL.query(query, [admin_id]);
    return rows[0];
  } catch (error) {
    console.error('Failed to find user:', error.message);
    throw error;
  }
};

module.exports = {
  createUser,
  findUserById,
  createAdmin,
  findAdminById,
};

