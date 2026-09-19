/**
 * Standard API response helper for successful operations.
 *
 * @param {import('express').Response} res - Express response object
 * @param {object} options
 * @param {number} [options.status=200] - HTTP status code
 * @param {string} [options.message='Request successful'] - Informative success message
 * @param {*} [options.data=null] - Response payload
 * @param {object|null} [options.pagination=null] - Optional pagination metadata
 */
const successResponse = (res, { status = 200, message = 'Request successful', data = null, pagination = null } = {}) => {
  const responseBody = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    responseBody.data = data;
  }

  if (pagination) {
    responseBody.pagination = pagination;
  }

  return res.status(status).json(responseBody);
};

/**
 * Standard API response helper for error scenarios.
 *
 * @param {import('express').Response} res - Express response object
 * @param {object} options
 * @param {number} [options.status=500] - HTTP status code
 * @param {string} [options.message='Something went wrong'] - Readable error message
 * @param {Array|object|null} [options.errors=null] - Optional structured error details
 */
const errorResponse = (res, { status = 500, message = 'Something went wrong', errors = null } = {}) => {
  const responseBody = {
    success: false,
    message
  };

  if (errors !== null && errors !== undefined) {
    responseBody.errors = errors;
  }

  return res.status(status).json(responseBody);
};

module.exports = {
  successResponse,
  errorResponse
};
