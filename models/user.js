const mongoose = require('mongoose');
const speakeasy = require('speakeasy');

const { hashPassword } = require('../utils/hashPassword');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  tfa: {
    secret: String,
    tempSecret: String,
    dataUrl: String,
    tfaUrl: String
  }
});

userSchema.pre('save', async function(next) {
  this.password = await hashPassword(this.password);

  next();
});

userSchema.methods.checkPassword = async function(password) {
  const hash = await hashPassword(password);

  return this.password === hash;
}

userSchema.methods.checkAuthCode = function(authCode) {
  return speakeasy.totp.verify({
    secret: this.tfa.secret,
    encoding: 'base32',
    token: authCode
  });
}

function getUserModel(db) {
  if (db) {
    return db.model('user', userSchema, 'users');
  }

  return mongoose.model('user', userSchema, 'users');
}

module.exports = { getUserModel };
