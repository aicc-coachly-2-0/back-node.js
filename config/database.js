const { Pool } = require('pg');
const mongoose = require('mongoose');
const config = require('./config'); // config 파일 불러오기

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
    console.log('PostgreSQL에 성공적으로 연결되었습니다!');
    const res = await client.query('SELECT NOW()');
    console.log('PostgreSQL 현재 시간:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('PostgreSQL 연결 에러:', err.message);
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
    console.log('MongoDB에 성공적으로 연결되었습니다!');
  } catch (err) {
    console.error('MongoDB 연결 에러:', err.message);
  }
}
connectMongoDB();

module.exports = {
  postgreSQL: pool,
  connectMongoDB,
};
