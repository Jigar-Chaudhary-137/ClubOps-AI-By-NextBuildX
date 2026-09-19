const { errorResponse } = require('../utils/apiResponse');

/**
 * Role-based authorization middleware builder.
 *
 * @param  {...string} allowedRoles - List of permitted roles (e.g., 'admin', 'organizer')
 * @returns {import('express').RequestHandler}
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        status: 401,
        message: 'Authentication required before authorization.'
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, {
        status: 403,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

module.exports = {
  authorize
};
