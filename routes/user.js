const { getUserModel } = require('../models/user');
const { UserController } = require('../controllers/user');

function userRoutes(router, db) {
  const userModel = getUserModel(db);
  const userController = new UserController(userModel)

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await userController.find({ email });
      const isValidPassword = await user.checkPassword(password);

      if (isValidPassword) {
        const token = await userController.generateJwt(user);
        // TFA is disabled
        if (!user.tfa || !user.tfa.secret) {
          return res.json({ jwt: token, email });
        // TFA is enabled
        } else {
          if (!req.headers['tfa-token']) {
            return res.status(206).send({ message: 'Please enter the Auth Code' });
          }

          const authCode = req.headers['tfa-token'];
          const isValidAuthCode = user.checkAuthCode(authCode);

          if (isValidAuthCode) {
            return res.json({ jwt: token, email });
          }

          return res.status(206).send({ message: 'Invalid auth code' });
        }
      } else {
        return res.status(403).send({ message: 'Wrong password' });
      }
    } catch (error) {
      res.status(500).end();
    }
  });

  return router;
}

module.exports = { userRoutes };
