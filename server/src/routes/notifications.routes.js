const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all notification routes
router.use(authenticate);

// Real-Time SSE Stream (must be before :id routes)
router.get('/stream', notificationController.streamNotifications);

// Unread Count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark All Read
router.patch('/read-all', notificationController.markAllAsRead);

// List Notifications
router.get('/', notificationController.listNotifications);

// Mark Single Notification Read
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
