const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new organizer, volunteer, or member (with optional club creation/joining)
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and obtain JWT token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve authenticated user's profile and club context
 * @access  Private (Authenticated)
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   POST /api/auth/club
 * @desc    Create a new Club (designated lead organizer)
 * @access  Private (Admin / Organizer only)
 */
router.post('/club', authenticate, authorize('admin', 'organizer'), authController.createClub);

/**
 * @route   POST /api/auth/join-club
 * @desc    Join an existing club using club code
 * @access  Private (Authenticated)
 */
router.post('/join-club', authenticate, authController.joinClub);

module.exports = router;
