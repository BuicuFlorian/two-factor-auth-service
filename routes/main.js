const router = require('express').Router();

const { loginRoutes } = require('./login');
const { tfaRoutes } = require('./tfa');

function loadRoutes(app) {
  const db = mongoose.createConnection(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });

}

module.exports = { loadRoutes };
