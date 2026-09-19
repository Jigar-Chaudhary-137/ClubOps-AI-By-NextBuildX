const { errorResponse } = require('../utils/apiResponse');

/**
 * 404 Not Found middleware for handling unmatched routes.
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, {
    status: 404,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

module.exports = notFoundHandler;
