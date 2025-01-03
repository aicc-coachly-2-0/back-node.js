const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { postgreSQL } = require('../config/database');
const mongoose = require('mongoose');
const authModel = require('../models/authModel');
const userService = require('./userService');
const config = require('../config/config');

exports.createUser = async (userData) => {
  const client = await postgreSQL.connect(); // PostgreSQL 클라이언트 연결
  const session = await mongoose.startSession(); // MongoDB 세션 시작

  try {
    await client.query('BEGIN'); // PostgreSQL 트랜잭션 시작
    session.startTransaction(); // MongoDB 트랜잭션 시작

    const hashedPassword = await bcrypt.hash(userData.user_pw, 10);
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
    await userService.createMongoUser(
      {
        user_number: createdUser.user_number,
        nickname: userData.nickname,
        profile_picture: userData.profile_picture,
      },
      session
    );

    await client.query('COMMIT'); // PostgreSQL 커밋
    await session.commitTransaction(); // MongoDB 커밋

    return createdUser; // 생성된 사용자 반환
  } catch (error) {
    await client.query('ROLLBACK'); // PostgreSQL 롤백
    await session.abortTransaction(); // MongoDB 롤백
    throw error;
  } finally {
    client.release(); // PostgreSQL 클라이언트 해제
    session.endSession(); // MongoDB 세션 종료
  }
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
  const hashedPassword = await bcrypt.hash(adminData.user_pw, 10);

  const createAdmin = await authModel.createAdmin({
    admin_id: adminData.admin_id,
    admin_pw: hashedPassword,
  });

  return createAdmin;
};

exports.loginAdmin = async (adminData) => {
  const { admin_id, admin_pw } = adminData;

  const admin = await authModel.findAdminById(admin_id);
  if (!admin) {
    throw new Error('Admin not found');
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
