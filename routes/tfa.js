const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

const { user } = require('../db/user');

function tfaRoutes(router) {
  router.post('/tfa', (req, res) => {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: user.email,
      issuer: 'FlorianAuth'
    });

    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.email,
      issuer: 'FlorianAuth',
      encoding: 'base32'
    });

    QRCode.toDataURL(url, (err, dataURL) => {
      user.tfa = {
        secret: '',
        tempSecret: secret.base32,
        dataURL,
        tfaURL: url
      };

      return res.json({
        message: 'TFA needs to be verified',
        tempSecret: secret.base32,
        dataURL,
        tfaURL: secret.otpauth_url
      });
    });
  });

  router.get('/tfa', (req, res) => {
    const tfa = user.tfa ? user.tfa : null;

    res.json(tfa);
  });

  router.delete('/tfa', (req, res) => {
    delete user.tfa;

    res.json({ message: 'success' });
  });

  router.post('/tfa/verify', (req, res) => {
    const isValidToken = speakeasy.totp.verify({
      secret: user.tfa.tempSecret,
      encoding: 'base32',
      token: req.body.token
    });

    if (isValidToken) {
      user.tfa.secret = user.tfa.tempSecret

      return res.json({ message: 'TFS was successfully enabled' });
    }

    return res.send({
      status: 403,
      message: 'Invalid auth code. Please verify system date and time.'
    });
  });

  return router;
}

module.exports = { tfaRoutes };
