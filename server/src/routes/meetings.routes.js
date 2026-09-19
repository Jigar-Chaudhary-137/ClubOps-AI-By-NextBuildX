const express = require('express');
const { errorResponse } = require('../utils/apiResponse');

const router = express.Router();

// Placeholder for future meeting endpoints
router.use((req, res) => {
  return errorResponse(res, {
    status: 501,
    message: 'Meetings module is not implemented yet'
  });
});

module.exports = router;
