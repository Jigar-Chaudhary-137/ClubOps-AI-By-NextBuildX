const { verifyToken } = require('../utils/token');
const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');

/**
 * Authentication middleware: verifies JWT Bearer token and attaches active user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, {
        status: 401,
        message: 'Authentication required. No Bearer token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, {
        status: 401,
        message: 'Authentication token missing.'
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      const message = jwtError.name === 'TokenExpiredError' 
        ? 'Authentication token has expired. Please log in again.' 
        : 'Invalid authentication token.';

      return errorResponse(res, {
        status: 401,
        message
      });
    }

    if (!decoded || !decoded.id) {
      return errorResponse(res, {
        status: 401,
        message: 'Invalid token payload.'
      });
    }

    // Fetch user from database to ensure current validity
    const user = await User.findById(decoded.id).populate('club', 'name code category logoUrl');

    if (!user) {
      return errorResponse(res, {
        status: 401,
        message: 'Authenticated user account no longer exists.'
      });
    }

    if (!user.isActive) {
      return errorResponse(res, {
        status: 403,
        message: 'User account is deactivated. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, {
      status: 500,
      message: 'Internal server error during authentication.'
    });
  }
};

module.exports = {
  authenticate
};
