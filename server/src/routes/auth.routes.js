const express = require('express');
const { errorResponse } = require('../utils/apiResponse');

const router = express.Router();

// Placeholder for future authentication endpoints (login, register, me, etc.)
router.use((req, res) => {
  return errorResponse(res, {
    status: 501,
    message: 'Auth module is not implemented yet'
  });
});

module.exports = router;
