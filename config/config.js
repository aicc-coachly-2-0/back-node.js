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
    host: process.env.PG_HOST, // 호스트 (기본값: localhost)
    database: process.env.PG_DB, // 데이터베이스 이름
    password: process.env.PG_PASS, // 비밀번호
    port: process.env.PG_PORT, // 포트 (기본값: 5432)
  },
};

module.exports = config;
