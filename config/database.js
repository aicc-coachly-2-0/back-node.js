// 데이터베이스 연결

const { Pool } = require('pg');

// PostgreSQL 연결 설정
const pool = new Pool({
  user: process.env.PG_USER,       // PostgreSQL 사용자
  host: process.env.PG_HOST,       // 호스트 (기본값: localhost)
  database: process.env.PG_DB,     // 데이터베이스 이름
  password: process.env.PG_PASS,   // 비밀번호
  port: process.env.PG_PORT,       // 포트 (기본값: 5432)
});

// 연결 테스트 함수 (선택 사항)
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Connected');
    client.release();
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };