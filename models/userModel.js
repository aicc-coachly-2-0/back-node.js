const { postgreSQL } = require('../config/database');

// 전체 유저 조회
exports.findAllUsers = async () => {
  const query = `SELECT * FROM users`;
  const { rows } = await postgreSQL.query(query);
  return rows;
};

// 전화번호로 유저 검색
exports.findUsersByPhoneNumber = async (phoneNumber) => {
    const query = `SELECT * FROM users WHERE user_phone = $1`;
    const { rows } = await postgreSQL.query(query, [phoneNumber]);
    return rows;
  };
  
  // 아이디나 이름으로 유저 검색
  exports.findUsersByIdOrName = async (searchTerm) => {
    const query = `
      SELECT * FROM users
      WHERE user_id LIKE $1 OR user_name LIKE $1
    `;
    const { rows } = await postgreSQL.query(query, [`%${searchTerm}%`]);
    return rows;
  };

// 상태로 유저 조회
exports.findUsersByStatus = async (status) => {
    const query = `SELECT * FROM users WHERE status = $1`;
    const { rows } = await postgreSQL.query(query, [status]);
    return rows;
};
  
