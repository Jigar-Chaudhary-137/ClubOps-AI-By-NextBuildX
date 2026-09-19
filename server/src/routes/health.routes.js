const express = require('express');
const { getDatabaseStatus } = require('../db/connection');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint with live database status
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.readyState === 1;

  const responsePayload = {
    success: isHealthy,
    message: isHealthy ? 'ClubOps API is running' : 'ClubOps API is running but database is degraded/disconnected',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.status,
      readyState: dbStatus.readyState
    }
  };

  return res.status(isHealthy ? 200 : 503).json(responsePayload);
});

module.exports = router;
