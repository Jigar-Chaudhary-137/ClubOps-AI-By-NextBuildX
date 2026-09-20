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

// Device Token Registration (FCM Push)
router.post('/register-device', notificationController.registerDevice);
router.delete('/unregister-device', notificationController.unregisterDevice);

// Notification Preferences
router.patch('/preferences', notificationController.updatePreferences);

// List Notifications
router.get('/', notificationController.listNotifications);

// Mark Single Notification Read
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
