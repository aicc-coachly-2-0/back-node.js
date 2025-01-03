const { postgreSQL } = require('../config/database');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const authModel = require('../models/authModel');
const config = require('../config/config');
const jwt = require('jsonwebtoken');

// 사용자 생성 (회원가입)
exports.createUser = async (userData, profilePictureUrl) => {
  const client = await postgreSQL.connect(); // PostgreSQL 클라이언트 연결
  const session = await mongoose.startSession(); // MongoDB 세션 시작

  try {
    await client.query('BEGIN'); // PostgreSQL 트랜잭션 시작
    session.startTransaction(); // MongoDB 트랜잭션 시작

    const hashedPassword = await bcrypt.hash(userData.user_pw, 10);
    const sanitizedPhone = userData.user_phone.replace(/\D/g, '');

    // PostgreSQL에 사용자 데이터 저장
    const createdUser = await authModel.createUser({
      user_id: userData.user_id,
      user_name: userData.user_name,
      user_email: userData.user_email,
      user_pw: hashedPassword,
      user_phone: sanitizedPhone,
      user_date_of_birth: userData.user_date_of_birth,
      user_gender: userData.user_gender,
    });

    // MongoDB에 사용자 데이터 저장
    await authModel.createMongoUser(
      {
        user_number: createdUser.user_number,
        nickname: userData.nickname,
        profile_picture: profilePictureUrl,
      },
      session
    );

    await client.query('COMMIT'); // PostgreSQL 트랜잭션 커밋
    await session.commitTransaction(); // MongoDB 트랜잭션 커밋

    return createdUser;
  } catch (error) {
    try {
      await session.abortTransaction(); // MongoDB 트랜잭션 롤백
    } catch (mongoError) {
      console.error('MongoDB 롤백 에러:', mongoError.message);
    }

    try {
      await client.query('ROLLBACK'); // PostgreSQL 트랜잭션 롤백
    } catch (pgError) {
      console.error('PostgreSQL 롤백 에러:', pgError.message);
    }

    console.error('사용자 생성 에러:', error.message);
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
    {
      user_number: user.user_number,
      user_id: user.user_id,
      user_email: user.user_email,
    },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );

  return {
    token,
    user: {
      user_number: user.user_number,
      user_id: user.user_id,
      user_email: user.user_email,
    },
  };
};

exports.createAdmin = async (adminData) => {
  const hashedPassword = await bcrypt.hash(adminData.admin_pw, 10);

  const createAdmin = await authModel.createAdmin({
    admin_id: adminData.admin_id,
    admin_pw: hashedPassword,
    position: adminData.position,
  });
  console.log('Admin created in DB:', createAdmin);
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
    { admin_number: admin.admin_number,
      admin_id: admin.admin_id,
      isAdmin: true },
    config.auth.jwtSecret,
    {
      expiresIn: config.auth.jwtExpiresIn,
    }
  );

  return {
    token,
    admin: { 
      admin_number: admin.admin_number,
      admin_id: admin.admin_id 
    },
  };
};
