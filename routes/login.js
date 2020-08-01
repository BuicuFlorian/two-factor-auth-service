const speakeasy = require('speakeasy');

const { user } = require('../db/user');

function loginRoutes(router) {
  router.post('/login', (req, res) => {
    // TFA is disabled
    if (!user.tfa || !user.tfa.secret) {
      if (user.email === req.body.email && user.password === req.body.password) {
        return res.json({ message: 'success' });
      }

      return res.send({
        status: 403,
        message: 'Invalid email or password'
      });
    // TFA is enabled
    } else {
      if (user.email !== req.body.email && user.password !== req.body.password) {
        return res.send({
          status: 403,
          message: 'Invalid email or password'
        });
      }

      if (!req.headers['tfa-token']) {
        return res.send({
          status: 206,
          message: 'Please enter the Auth Code'
        });
      }

      const isVerified = speakeasy.totp.verify({
        secret: user.tfa.secret,
        encoding: 'base32',
        token: req.headers['tfa-token']
      });

      if (isVerified) {
        res.json({ message: 'Successfully logged in' })
      } else {
        res.send({
          status: 206,
          message: 'Invalid auth code'
        });
      }
    }
  });

  return router;
}

module.exports = { loginRoutes };
