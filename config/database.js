// 데이터베이스 연결

const { Pool } = require('pg');

// PostgreSQL 연결 설정
const pool = new Pool({
  user: process.env.PG_USER,       
  host: process.env.PG_HOST,       
  database: process.env.PG_DB,     
  password: process.env.PG_PASS,   
  port: process.env.PG_PORT,       
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