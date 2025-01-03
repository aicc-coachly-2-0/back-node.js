require('dotenv').config();

const config = {
  server: {
    port: process.env.SERVER_PORT || 8000, // 서버 포트
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET, // JWT 시크릿 키
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h', // 토큰 만료 시간
  },
  externalApi: {
    apiKey: process.env.EXTERNAL_API_KEY, // 외부 API 키
  },
  postgre: {
    user: process.env.PG_USER, // PostgreSQL 사용자
    host: process.env.PG_HOST, // 호스트
    database: process.env.PG_DB, // 데이터베이스 이름
    password: process.env.PG_PASS, // 비밀번호
    port: process.env.PG_PORT, // 포트
  },
  mongo: {
    user: process.env.MG_USER, // MongoDB 사용자
    host: process.env.MG_HOST, // 호스트
    database: process.env.MG_DB, // 데이터베이스 이름
    password: process.env.MG_PW, // 비밀번호
    port: process.env.MG_PORT, // 포트
  },
  ftp: {
    host: process.env.FTP_HOST || 'localhost', // FTP 호스트
    port: process.env.FTP_PORT || 21, // FTP 포트
    user: process.env.FTP_USER, // FTP 사용자
    password: process.env.FTP_PASSWORD, // FTP 비밀번호
    secure: process.env.FTP_SECURE === 'true', // FTP 보안 설정 (true/false)
    baseUrl: process.env.FTP_URL === 'http://222.112.27.120/kochiri',
  },
};
module.exports = config;
