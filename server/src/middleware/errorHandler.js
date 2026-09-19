const config = require('../config/env');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Global application error handling middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  // Server-side logging
  console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode} - Error: ${err.message}`);
  if (err.stack && config.isDevelopment) {
    console.error(err.stack);
  }

  const errors = config.isDevelopment && err.stack ? { stack: err.stack } : null;

  return errorResponse(res, {
    status: statusCode,
    message,
    errors
  });
};

module.exports = errorHandler;
