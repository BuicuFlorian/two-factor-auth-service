const mongoose = require('mongoose');
const router = require('express').Router();

const { checkJwt } = require('../middlewares/checkJwt');
const { loginRoutes } = require('./login');
const { tfaRoutes } = require('./tfa');

function loadRoutes(app) {
  const db = mongoose.createConnection(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });

  app.use(loginRoutes(router, db));
  app.use('/tfa', checkJwt);
  app.use(tfaRoutes(router, db))
}

module.exports = { loadRoutes };
