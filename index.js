const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middlewares/errorHandler');
const authRoute = require('./routes/authRoute');
const config = require('./config/config');

const PORT = config.server.port || 8000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World! Test Server Running.');
});

app.use('/api/auth', authRoute);

app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
