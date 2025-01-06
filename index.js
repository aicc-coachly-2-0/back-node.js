const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config/config");

// middlewares
const errorHandler = require("./middlewares/errorHandler");

// route
const authRoute = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");
const feedRoute = require("./routes/feedRoute");
const userRoute = require("./routes/userRoute");
const missionRoute = require("./routes/missionRoute");

// schedulers and services
const missionStateScheduler = require("./schedulers/missionStateScheduler");
const { updateMissionStates } = require("./services/missionService");

const PORT = config.server.port || 8000;
const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// root endpoint
app.get("/", (req, res) => {
  res.send("Hello World! Test Server Running.");
});

// route
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/feeds", feedRoute);
app.use("/api/user", userRoute);
app.use("/api/missions", missionRoute);

// error route
app.use(errorHandler);

// 서버 시작 시 mission_rooms 상태 업데이트
(async () => {
  try {
    console.log("서버 시작: mission_rooms 상태 업데이트");
    await updateMissionStates(); // 초기 상태 업데이트
    console.log("서버 시작 시 상태 업데이트 완료");
  } catch (error) {
    console.error("초기 상태 업데이트 중 오류 발생:", error.message);
  }
})();

// 스케줄러 실행
missionStateScheduler();

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
