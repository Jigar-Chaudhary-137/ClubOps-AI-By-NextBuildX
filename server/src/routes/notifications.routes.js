const express = require('express');
const notificationController = require('../controllers/notification.controller');
const whatsappController = require('../controllers/whatsapp.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public WhatsApp Webhook Endpoints (Meta challenge & status callbacks)
router.get('/whatsapp/webhook', whatsappController.verifyWebhook);
router.post('/whatsapp/webhook', whatsappController.handleWebhook);

// Apply authentication to protected notification routes
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
