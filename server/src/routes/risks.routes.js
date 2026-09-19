const express = require('express');
const { errorResponse } = require('../utils/apiResponse');

const router = express.Router();

// Placeholder for future risk management endpoints
router.use((req, res) => {
  return errorResponse(res, {
    status: 501,
    message: 'Risks module is not implemented yet'
  });
});

module.exports = router;
