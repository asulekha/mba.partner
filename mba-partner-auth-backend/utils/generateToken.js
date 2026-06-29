const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for a given user id.
 * @param {string} id - Mongo user _id
 * @param {boolean} remember - if true, issue a long-lived token ("Remember me")
 */
const generateToken = (id, remember = false) => {
  const expiresIn = remember
    ? process.env.JWT_REMEMBER_EXPIRES_IN || '30d'
    : process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = generateToken;