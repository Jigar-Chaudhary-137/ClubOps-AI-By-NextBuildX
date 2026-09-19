const express = require('express');
const { errorResponse } = require('../utils/apiResponse');

const router = express.Router();

// Placeholder for future task endpoints
router.use((req, res) => {
  return errorResponse(res, {
    status: 501,
    message: 'Tasks module is not implemented yet'
  });
});

module.exports = router;
