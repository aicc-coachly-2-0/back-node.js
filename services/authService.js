const { connectFTP, postgreSQL } = require('../config/database');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const authModel = require('../models/authModel');
const userService = require('./userService');
const config = require('../config/config');
const jwt = require('jsonwebtoken');

exports.uploadToFTP = async (userId, file) => {
  const ftpClient = await connectFTP();
  try {
    const remoteImagePath = `/kochiri/profile/${userId}-${Date.now()}.jpg`;
    await ftpClient.uploadFrom(file.buffer, remoteImagePath); // Multer 메모리 버퍼 데이터 업로드

    return `${config.ftp.baseUrl}${remoteImagePath}`;
  } catch (error) {
    console.error('FTP 업로드 실패:', error.message);
    throw new Error('FTP 업로드 실패');
  } finally {
    ftpClient.close();
  }
};

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
      profile_picture: profilePictureUrl,
    });

    // MongoDB에 사용자 데이터 저장
    await userService.createMongoUser(
      {
        user_number: createdUser.user_number, // PostgreSQL에서 생성된 user_number
        nickname: userData.nickname,
        profile_picture: profilePictureUrl,
      },
      session
    );

    await client.query('COMMIT'); // PostgreSQL 트랜잭션 커밋
    await session.commitTransaction(); // MongoDB 트랜잭션 커밋

    return createdUser; // 생성된 사용자 데이터 반환
  } catch (error) {
    await client.query('ROLLBACK'); // PostgreSQL 트랜잭션 롤백
    await session.abortTransaction(); // MongoDB 트랜잭션 롤백
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
