const express = require('express');
const { errorResponse } = require('../utils/apiResponse');

const router = express.Router();

// Placeholder for future AI endpoints (planner, assistant, extraction, rag, etc.)
router.use((req, res) => {
  return errorResponse(res, {
    status: 501,
    message: 'AI module is not implemented yet'
  });
});

module.exports = router;
