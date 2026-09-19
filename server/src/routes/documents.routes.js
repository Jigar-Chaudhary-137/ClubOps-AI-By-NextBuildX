const express = require('express');
const { errorResponse } = require('../utils/apiResponse');

const router = express.Router();

// Placeholder for future document repository endpoints
router.use((req, res) => {
  return errorResponse(res, {
    status: 501,
    message: 'Documents module is not implemented yet'
  });
});

module.exports = router;
