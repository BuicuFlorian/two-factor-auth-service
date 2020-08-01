require('dotenv').config()

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const { loadRoutes } = require('./routes/main.js');

function initService() {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(bodyParser.json());

  loadRoutes(app);

  app.listen(3000, () => console.log('Magic happens on localhost:3000'));
}

initService();
