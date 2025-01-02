const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const errorHandler = require("./middlewares/errorHandler");
const config = require("./config/config");

// route
const authRoute = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");
const feedRoute = require("./routes/feedRoute");
const userRoute = require("./routes/userRoute");

const missionRoute = require("./routes/missionRoute");

const PORT = config.server.port || 8080;
const app = express();

const runScheduler = require("./schedulers/missionStateScheduler");

// 서버 시작 시 스케줄러 실행
try {
  runScheduler();
} catch (error) {
  console.error("Error initializing scheduler:", error.message);
}

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World! Test Server Running.");
});

// 정민석이 임시로 한거임 지우지 마세요
const fastapiUrl = "http://127.0.0.1:8000/report";
app.post("/send-report", async (req, res) => {
  try {
    const requestData = req.body; // 클라이언트에서 받은 데이터
    console.log("Received data:", requestData); // 요청 본문 데이터 출력

    // FastAPI 서버로 데이터 전송
    const response = await axios.post(fastapiUrl, requestData);

    // FastAPI 서버의 응답을 클라이언트로 전달
    res.json(response.data);
  } catch (error) {
    console.error("Error sending data to FastAPI:", error);
    res.status(500).send("Error communicating with FastAPI server");
  }
});
// 여기까지 정민석이 임시로 작업한거 건들 ㄴㄴ

// route
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/feeds", feedRoute);
app.use("/api/user", userRoute);

app.use("/api/missions", missionRoute);

// error route
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
