const bcrypt = require('bcrypt');

/**
 * Generate a hash for the given password.
 *
 * @param {String} password
 * @returns {String}
 */
async function hashPassword(password) {
  const saltRounds = 7;
  const hash = await bcrypt.hash(this.password, saltRounds);

  return hash;
}

module.exports = { hashPassword };
