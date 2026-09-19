const express = require('express');
const { errorResponse } = require('../utils/apiResponse');

const router = express.Router();

// Placeholder for future volunteer endpoints
router.use((req, res) => {
  return errorResponse(res, {
    status: 501,
    message: 'Volunteers module is not implemented yet'
  });
});

module.exports = router;
