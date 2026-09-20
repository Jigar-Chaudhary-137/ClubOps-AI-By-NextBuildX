/**
 * WhatsApp Delivery & Webhook Routes
 */

const express = require('express');
const whatsappController = require('../controllers/whatsapp.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Public Webhook Endpoints (Meta WhatsApp Cloud API Challenge & Status Notifications)
router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.handleWebhook);

// Authenticated Delivery Tracking & Retries
router.get('/deliveries/:id', authenticate, whatsappController.getAnnouncementDeliveries);
router.post('/deliveries/:id/retry', authenticate, authorize('admin', 'organizer'), whatsappController.retryAnnouncementDelivery);

module.exports = router;
