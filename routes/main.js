const router = require('express').Router();

const { loginRoutes } = require('./login');
const { tfaRoutes } = require('./tfa');

function loadRoutes(app) {
  app.use(loginRoutes(router));
  app.use(tfaRoutes(router))
}

module.exports = { loadRoutes };
