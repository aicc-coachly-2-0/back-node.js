const { Pool } = require("pg");
const mongoose = require("mongoose");
const Client = require("ssh2-sftp-client"); // FTP 클라이언트 모듈 추가
const config = require("./config"); // config 파일 불러오기

// PostgreSQL 연결 설정
const pool = new Pool({
  user: config.postgre.user,
  host: config.postgre.host,
  database: config.postgre.database,
  password: config.postgre.password,
  port: config.postgre.port,
});

// PostgreSQL 연결 테스트 함수
async function connectPostgreSQL() {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL에 성공적으로 연결되었습니다!");
    const res = await client.query("SELECT NOW()");
    console.log("PostgreSQL 현재 시간:", res.rows[0]);
    client.release();
  } catch (err) {
    console.error("PostgreSQL 연결 에러:", err.message);
  }
}
connectPostgreSQL();

// MongoDB 연결 URI
const mongoURI = `mongodb://${config.mongo.user}:${encodeURIComponent(
  config.mongo.password
)}@${config.mongo.host}:${config.mongo.port}/${
  config.mongo.database
}?authSource=${config.mongo.database}`;

// MongoDB 연결 설정
async function connectMongoDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB에 성공적으로 연결되었습니다!");
  } catch (err) {
    console.error("MongoDB 연결 에러:", err.message);
  }
}
connectMongoDB();

async function connectSFTP() {
  const sftp = new Client();

  try {
    await sftp.connect({
      host: config.ftp.host,
      port: config.ftp.port,
      username: config.ftp.user,
      password: config.ftp.password,
      secure: config.ftp.secure,
      readyTimeout: 6000, // Timeout을 2분으로 늘려보기
    });
    console.log("SFTP에 성공적으로 연결되었습니다!");

    // 필요한 경우, 디렉토리 변경 (sftp.cwd 사용)
    const currentDir = await sftp.cwd(); // 현재 디렉토리 확인
    console.log("현재 디렉토리:", currentDir);

    // 예: /kochiri/profile로 이동 (디렉토리 변경)
    await sftp.cwd("/profile");
    console.log("디렉토리 변경 완료");

    return sftp; // FTP 클라이언트를 반환
  } catch (err) {
    console.error("SFTP 연결 에러:", err.message);
  }
}
connectSFTP(); // 연결 함수 호출

module.exports = {
  postgreSQL: pool,
  mongoURI,
  connectSFTP,
};
