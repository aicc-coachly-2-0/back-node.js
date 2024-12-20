// 데이터베이스 연결

const { Pool } = require('pg');
const config = require('./config'); // config 파일 불러오기

// PostgreSQL 연결 설정
const pool = new Pool({
  user: config.postgre.user, // PostgreSQL 사용자
  host: config.postgre.host, // 호스트
  database: config.postgre.database, // 데이터베이스 이름
  password: config.postgre.password, // 비밀번호
  port: config.postgre.port, // 포트
});

module.exports = pool;

// 연결 테스트 함수 (선택 사항)
// const connectDB = async () => {
//   try {
//     const client = await pool.connect();
//     console.log('PostgreSQL Connected');
//     client.release();
//   } catch (error) {
//     console.error('PostgreSQL connection failed:', error.message);
//     process.exit(1);
//   }
// };
async function connectDB() {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL에 성공적으로 연결되었습니다!');

    // 쿼리 실행 예시
    const res = await client.query('SELECT NOW()');
    console.log('현재 시간:', res.rows[0]);

    client.release(); // 연결 해제
  } catch (err) {
    console.error('데이터베이스 연결 에러:', err);
  }
}
connectDB();
