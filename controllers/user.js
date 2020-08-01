const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

class UserController {
  #userModel = null;

  /**
   * Class constructor.
   *
   * @param {Object} userModel
   */
  constructor(userModel) {
    this.#userModel = userModel;
  }

  /**
   * Create a new user account.
   *
   * @param {Object} user
   * @returns {Promise<Void>}
   */
  async save(user) {
    const newUser = new this.#userModel(user);

    await newUser.save();
  }

  /**
   * Find a user by ID.
   *
   * @param {String} email
   * @returns {Promise<Object>}
   */
  async find(query) {
    const user = await this.#userModel.findOne(query).exec();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Setup two factor authentication for the given user.
   * 
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  setupTFA(user) {
    return new Promise((resolve, reject) => {
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

      QRCode.toDataURL(url, async (err, dataURL) => {
        if (err) {
          reject(err);
        }

        user.tfa = {
          secret: '',
          tempSecret: secret.base32,
          dataURL,
          tfaURL: url
        };

        await user.save();

        resolve({ secret, dataURL });
      });
    });
  }

  /**
   * Validate the given token.
   * 
   * @param {Object} user 
   * @param {String} token
   * @returns {Boolean} 
   */
  async verifyToken(user, token) {
    const isValidToken = speakeasy.totp.verify({
      secret: user.tfa.tempSecret,
      encoding: 'base32',
      token
    });

    if (isValidToken) {
      user.tfa.secret = user.tfa.tempSecret
      await user.save();
    }

    return isValidToken;
  }

  /**
   * Disable two factor authentication for the given user.
   * 
   * @param {String} userId 
   * @returns {Promise}
   */
  async removeTFA(userId) {
    await this.#userModel.findOneAndUpdate(
      { _id: userId }, 
      { $unset: { tfa: 1 } }
    ).exec();
  }

  /**
   * Generate a new JSON web token.
   * 
   * @param {Object} user 
   * @returns {Promise<String>}
   */
  async generateJwt(user) {
    const token = await jwt.sign(
      { _id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7h' }
    );

    return token;
  }
}

module.exports = { UserController };
