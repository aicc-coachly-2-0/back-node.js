const { postgreSQL } = require('../config/database');

// 전체 유저 조회
exports.findAllUsers = async () => {
  const query = `SELECT * FROM users`;
  const { rows } = await postgreSQL.query(query);
  return rows;
};

// ID 또는 이름으로 유저 검색
exports.searchUsers = async (keyword) => {
    const query = `
      SELECT * FROM users
      WHERE user_id ILIKE $1 OR username ILIKE $1
    `;
    const { rows } = await postgreSQL.query(query, [`%${keyword}%`]);
    return rows;
};