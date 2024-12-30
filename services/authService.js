const bcrypt = require('bcrypt');
const authModel = require('../models/authModel');
const userService = require('./userService');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.createUser = async (userData) => {
  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(userData.user_pw, 10);

  // 전화번호 정리 (숫자 외 문자 제거)
  const sanitizedPhone = userData.user_phone.replace(/\D/g, '');

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

exports.loginUser = async (userData) => {
  const { user_id, user_pw } = userData;

  const user = await authModel.findUserById(user_id);
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(user_pw, user.user_pw);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign(
    { user_id: user.user_id, user_email: user.user_email },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );

  return {
    token,
    user: { user_id: user.user_id, user_email: user.user_email },
  };
};

exports.createAdmin = async (adminData) => {
  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(adminData.user_pw, 10);

  const createAdmin = await authModel.createAdmin({
    admin_id: adminData.admin_id,
    admin_pw: hashedPassword,
  });

  return createAdmin; // PostgreSQL 사용자 데이터 반환
};

exports.loginAdmin = async (adminData) => {
  const { admin_id, admin_pw } = adminData;

  const admin = await authModel.findAdminById(admin_id);
  if (!admin) {
    throw new Error('Adminr not found');
  }

  const isPasswordValid = await bcrypt.compare(admin_pw, admin.admin_pw);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign(
    { admin_id: admin.admin_id, isAdmin: true },
    config.auth.jwtSecret,
    {
      expiresIn: config.auth.jwtExpiresIn,
    }
  );

  return {
    token,
    admin: { admin_id: admin.admin_id },
  };
};
