const { getUserModel } = require('../models/user');
const { UserController } = require('../controllers/user');

function tfaRoutes(router, db) {
  const userModel = getUserModel(db);
  const userController = new UserController(userModel);

  router.post('/tfa', async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await userController.find({ _id: userId });
      const { secret, dataURL } = await userController.setupTFA(user);

      return res.json({
        message: 'TFA needs to be verified',
        tempSecret: secret.base32,
        dataURL,
        tfaURL: secret.otpauth_url
      });
    } catch (error) {
      res.status(500).end();
    }
  });

  router.get('/tfa', async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await userController.find({ _id: userId });
      const response = user.tfa
        ? user.tfa
        : { message: 'Two Factor Auth is not enabled' };

      res.json(response);
    } catch (error) {
      res.status(500).end();
    }
  });

  router.post('/tfa/verify', async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await userController.find({ _id: userId });
      const token = req.body.token;
      const isValidToken = await userController.verifyToken(user, token);

      if (isValidToken) {
        return res.json({ message: 'TFS was successfully enabled' });
      }

      return res.send({
        status: 403,
        message: 'Invalid auth code. Please verify system date and time.'
      });
    } catch (error) {
      res.status(500).end();
    }
  });

  router.delete('/tfa', async (req, res) => {
    try {
      const userId = req.user._id;
      await userController.removeTFA(userId);

      res.json({ message: 'Successfully disabled Two Factor Auth' });
    } catch (error) {
      res.status(500).end();
    }
  });

  return router;
}

module.exports = { tfaRoutes };
