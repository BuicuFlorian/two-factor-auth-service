const jwt = require('jsonwebtoken');

function checkJwt(req, res, next) {
  const token = req.headers['authorization'];

  if (token) {
    try {
      const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodedJwt;

      next();
    } catch (error) {
      res.status(403).send();
    }
  } else {
    res.status(403).send();
  }
}

module.exports = { checkJwt };
