const bcrypt = require('bcrypt');
const authModel = require('../models/auth');

exports.createUser = async (userData) => {
  // 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(userData.user_pw, 10);

  // 암호화된 비밀번호로 업데이트
  userData.user_pw = hashedPassword;

  // 데이터베이스에 사용자 추가
  const newUser = await authModel.createUser(userData);

  return newUser; // 생성된 사용자 정보 반환
};
