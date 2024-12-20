const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middlewares/errorHandler');
const authRoute = require('./routes/authRoute');
require('dotenv').config();

const PORT = 8000;
const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
// 기본 경로
app.get('/', (req, res) => {
  res.send('Hello World! Test Server Running.');
});

// 라우트 파일 연결
app.use('/api/auth', authRoute);

// 에러라우터 (모든 라우터 이후 나와야함)
app.use(errorHandler);

// 서버 실행
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
