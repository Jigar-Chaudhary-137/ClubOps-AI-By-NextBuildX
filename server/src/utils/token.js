const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generates a signed JWT token with essential identity payload.
 *
 * @param {string|object} userId - User's MongoDB ObjectId or string
 * @param {string} role - User role ('admin', 'organizer', 'volunteer', 'member')
 * @param {string|object|null} [clubId=null] - Associated Club ObjectId or null
 * @returns {string} - Signed JWT token string
 */
const generateToken = (userId, role, clubId = null) => {
  const payload = {
    id: userId ? userId.toString() : null,
    role,
    clubId: clubId ? clubId.toString() : null
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

/**
 * Verifies and decodes a JWT token.
 *
 * @param {string} token - JWT token string
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken
};
