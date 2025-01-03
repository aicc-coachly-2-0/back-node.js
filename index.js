const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const errorHandler = require('./middlewares/errorHandler');
const config = require('./config/config');

// route
const authRoute = require('./routes/authRoute');
const postRoute = require('./routes/postRoute');
const feedRoute = require('./routes/feedRoute');
const userRoute = require('./routes/userRoute');
const missionRoute = require('./routes/missionRoute');
const faqRoute = require('./routes/faqRoutes');
const qnaRoute = require('./routes/qnaRoutes');

const PORT = config.server.port || 8000;
const app = express();

const runScheduler = require('./schedulers/missionStateScheduler');

// 서버 시작 시 스케줄러 실행
try {
  runScheduler();
} catch (error) {
  console.error('Error initializing scheduler:', error.message);
}

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World! Test Server Running.');
});

// route
app.use('/auth', authRoute);
app.use('/posts', postRoute);
app.use('/feeds', feedRoute);
app.use('/user', userRoute);
app.use('/missions', missionRoute);
app.use('/faqs', faqRoute);
app.use('/qnas', qnaRoute);


// error route
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
