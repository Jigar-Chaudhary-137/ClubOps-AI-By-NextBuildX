const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check endpoint with database readyState
 * @access  Public
 */
router.get('/', healthController.getHealth);

/**
 * @route   GET /api/health/full
 * @desc    Deep subsystem diagnostic health check (MongoDB, Gemini, RAG, SSE, Process)
 * @access  Public
 */
router.get('/full', healthController.getFullHealth);

module.exports = router;
