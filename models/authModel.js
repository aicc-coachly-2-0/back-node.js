const { postgreSQL } = require('../config/database');
const User = require('../models/mongoDBModels');

// PostgreSQL 사용자 생성
exports.createUser = async ({
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

  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// MongoDB 사용자 생성
exports.createMongoUser = async (userData, session) => {
  const newUser = new User({
    user_number: userData.user_number,
    profile_picture: userData.profile_picture || '',
    nickname: userData.nickname,
  });

  return await newUser.save({ session }); // 세션 사용
};

// 관리자 생성
exports.createAdmin = async ({ admin_id, admin_pw, position }) => {
  const query = `
    INSERT INTO administrators (admin_id, admin_pw, position)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [admin_id, admin_pw, position];

  try {
    console.log('Executing query:', query, 'with values:', values);
    const { rows } = await postgreSQL.query(query, values);
    console.log('Query result:', rows);
    return rows[0]; // 반환된 user_number 포함
  } catch (error) {
    console.error('Failed to create user:', error.message);
    throw error;
  }
};

// 관리자 ID로 검색
exports.findAdminById = async (admin_id) => {
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
