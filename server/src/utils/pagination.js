const mongoose = require('mongoose');
const { AppError } = require('./errors');

/**
 * Validates and parses pagination query parameters.
 */
const parsePagination = (query = {}) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    limit = 10;
  } else if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Formats standardized pagination metadata.
 */
const formatPagination = (total, page, limit) => {
  const pages = Math.ceil(total / limit) || 0;
  return {
    page,
    limit,
    total,
    pages
  };
};

/**
 * Validates a MongoDB ObjectId, throwing a 400 AppError if invalid.
 */
const validateObjectId = (id, label = 'resource ID') => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
  return id;
};

/**
 * Safely escapes user input string for regex queries.
 */
const escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = {
  parsePagination,
  formatPagination,
  validateObjectId,
  escapeRegex
};
