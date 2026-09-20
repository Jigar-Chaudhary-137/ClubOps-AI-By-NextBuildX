/**
 * WhatsApp & Multi-Channel Delivery Controller
 * Handles Meta webhook verification, delivery status callbacks, delivery tracking queries,
 * and delivery retries with strict tenant isolation.
 */

const config = require('../config/env');
const whatsappService = require('../services/whatsapp.service');
const broadcastService = require('../services/broadcast.service');
const BroadcastDelivery = require('../models/BroadcastDelivery');
const Announcement = require('../models/Announcement');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { AppError } = require('../utils/errors');
const { validateObjectId } = require('../utils/pagination');

/**
 * Meta WhatsApp Cloud API Webhook Verification Endpoint (GET).
 */
const verifyWebhook = async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === config.whatsappVerifyToken) {
      console.log('[WHATSAPP WEBHOOK] Challenge verification successful');
      return res.status(200).send(challenge);
    }
    console.warn('[WHATSAPP WEBHOOK] Challenge verification failed: token mismatch');
    return res.status(403).json({ success: false, message: 'Verification token mismatch' });
  }

  return res.status(400).json({ success: false, message: 'Missing hub verification parameters' });
};

/**
 * Meta WhatsApp Cloud API / Provider Status Callback Endpoint (POST).
 */
const handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }

    // 1. Check for Meta WhatsApp Cloud API status notification
    if (body.object === 'whatsapp_business_account' && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            const value = change.value;
            if (value && Array.isArray(value.statuses)) {
              for (const statusObj of value.statuses) {
                const providerMessageId = statusObj.id;
                const status = statusObj.status; // 'sent', 'delivered', 'read', 'failed'
                const timestamp = statusObj.timestamp ? new Date(parseInt(statusObj.timestamp, 10) * 1000) : new Date();
                const failureReason = statusObj.errors?.[0]?.title || statusObj.errors?.[0]?.message || null;

                await whatsappService.handleWebhookStatusUpdate({
                  providerMessageId,
                  status,
                  timestamp,
                  failureReason
                });
              }
            }
          }
        }
      }
      return res.status(200).json({ success: true, message: 'Webhook processed' });
    }

    // 2. Generic status callback (direct format)
    if (body.providerMessageId && body.status) {
      const updated = await whatsappService.handleWebhookStatusUpdate({
        providerMessageId: body.providerMessageId,
        status: body.status,
        timestamp: body.timestamp || new Date(),
        failureReason: body.failureReason || body.error || null
      });

      return res.status(200).json({
        success: true,
        message: 'Direct status callback processed',
        data: updated ? { id: updated._id, status: updated.status } : null
      });
    }

    return res.status(200).json({ success: true, message: 'Webhook received (no actionable status objects found)' });
  } catch (err) {
    console.error('[WHATSAPP WEBHOOK ERROR]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error processing webhook' });
  }
};

/**
 * Retrieves delivery logs and statistics for a specific announcement (Authenticated & Club-Scoped).
 */
const getAnnouncementDeliveries = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const announcementId = req.params.id;
    validateObjectId(announcementId, 'announcement ID');

    const announcement = await Announcement.findOne({ _id: announcementId, club: clubId });
    if (!announcement) {
      throw new AppError('Announcement not found or does not belong to your club', 404);
    }

    const [deliveries, stats] = await Promise.all([
      BroadcastDelivery.find({ announcement: announcementId, club: clubId })
        .populate('recipient', 'name email role avatarUrl')
        .sort({ createdAt: -1 })
        .lean(),
      whatsappService.getBroadcastDeliveryStats(announcementId, clubId)
    ]);

    const sanitizedDeliveries = deliveries.map(d => ({
      _id: d._id,
      channel: d.channel,
      recipient: d.recipient ? {
        _id: d.recipient._id,
        name: d.recipient.name,
        email: d.recipient.email,
        role: d.recipient.role,
        avatarUrl: d.recipient.avatarUrl
      } : null,
      phone: d.phone ? whatsappService.maskPhoneNumber(d.phone) : null,
      status: d.status,
      provider: d.provider,
      providerMessageId: d.providerMessageId,
      failureReason: d.failureReason || d.errorMessage || null,
      queuedAt: d.queuedAt,
      sentAt: d.sentAt,
      deliveredAt: d.deliveredAt,
      readAt: d.readAt,
      failedAt: d.failedAt,
      createdAt: d.createdAt
    }));

    return successResponse(res, {
      status: 200,
      message: 'Announcement delivery logs retrieved successfully',
      data: {
        announcementId,
        stats,
        total: sanitizedDeliveries.length,
        deliveries: sanitizedDeliveries
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

/**
 * Retries failed or pending deliveries for an announcement (Authenticated & Club-Scoped).
 */
const retryAnnouncementDelivery = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const announcementId = req.params.id;
    validateObjectId(announcementId, 'announcement ID');

    const result = await broadcastService.retryFailedDeliveries(clubId, announcementId, req.body);

    return successResponse(res, {
      status: 200,
      message: `Retried ${result.retriedCount} delivery operations`,
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  verifyWebhook,
  handleWebhook,
  getAnnouncementDeliveries,
  retryAnnouncementDelivery
};
