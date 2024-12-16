const express = require('express');
const app = express();

require("dotenv").config();

// 기본 라우트
app.get('/', (req, res) => {
    res.send('Hello, Node.js!');
});

// 서버 시작
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});