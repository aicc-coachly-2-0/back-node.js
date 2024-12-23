const bcrypt = require('bcrypt');
const authModel = require('../models/auth');
const userService = require('./userService');

exports.createUser = async (userData) => {
  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(userData.user_pw, 10);
  const sanitizedPhone = userData.user_phone.replace(/\D/g, ''); // 숫자 외 문자 제거
  // PostgreSQL에 사용자 생성
  const createdUser = await authModel.createUser({
    user_id: userData.user_id,
    user_name: userData.user_name,
    user_email: userData.user_email,
    user_pw: hashedPassword,
    user_phone: sanitizedPhone,
    user_date_of_birth: userData.user_date_of_birth,
    user_gender: userData.user_gender,
  });

  // MongoDB에 사용자 생성
  await userService.createMongoUser({
    user_number: createdUser.user_number, // PostgreSQL에서 반환된 user_number
    nickname: userData.nickname,
    profile_picture: userData.profile_picture,
  });

  return createdUser; // PostgreSQL 사용자 데이터 반환
};
