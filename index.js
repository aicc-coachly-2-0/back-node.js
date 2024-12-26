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

const PORT = config.server.port || 8000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World! Test Server Running.');
});

// route
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/feeds', feedRoute);
app.use('/api/user', userRoute);

// error route
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
