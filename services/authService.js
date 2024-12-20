const bcrypt = require('bcrypt');
const authModel = require('../models/auth');

exports.createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.user_pw, 10);
  return authModel.createUser({ ...userData, user_pw: hashedPassword }); // 스프레드 연산자로 간결화
};
