/**
 * Centralized WhatsApp Service
 * Provides phone normalization, message formatting, click-to-chat URL generation,
 * multi-provider dispatch (Meta Cloud API / Twilio / Simulator), delivery state machine,
 * and delivery statistics.
 */

const config = require('../config/env');
const BroadcastDelivery = require('../models/BroadcastDelivery');
const cloudApiProvider = require('./whatsapp/cloudApiProvider');
const simulatorProvider = require('./whatsapp/simulatorProvider');
const twilioProvider = require('./whatsapp/twilioProvider');
const { sendToClub, sendToEvent } = require('../utils/realtime');
const { validateObjectId } = require('../utils/pagination');
const { AppError } = require('../utils/errors');

/**
 * Normalizes a raw phone input into standard E.164 format.
 *
 * Supported formats:
 * - +919876543210 -> +919876543210
 * - 919876543210  -> +919876543210
 * - 09876543210   -> +919876543210 (with default country code 91)
 * - 9876543210    -> +919876543210 (with default country code 91)
 * 
 * @param {string} rawPhone 
 * @param {string} [defaultCountryCode='91']
 * @returns {string|null} E.164 string with leading '+' or null if invalid
 */
const normalizePhoneNumber = (rawPhone, defaultCountryCode) => {
  if (!rawPhone || typeof rawPhone !== 'string') return null;

  const countryCode = defaultCountryCode || config.whatsappDefaultCountryCode || '91';
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  if (!cleaned) return null;

  // Case 1: Already has leading +
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.substring(1);
    if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
      return `+${digitsOnly}`;
    }
    return null;
  }

  // Case 2: Starts with leading 0 (e.g. local 09876543210)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.replace(/^0+/, '');
  }

  // Case 3: Starts with the default country code already (e.g. 919876543210)
  if (cleaned.startsWith(countryCode) && cleaned.length === countryCode.length + 10) {
    return `+${cleaned}`;
  }

  // Case 4: 10-digit standard local number -> prepend default country code
  if (cleaned.length === 10) {
    return `+${countryCode}${cleaned}`;
  }

  // Case 5: 7 to 15 digit international number without +
  if (cleaned.length >= 7 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  return null;
};

/**
 * Masks a phone number for privacy in logs and non-privileged responses.
 * Example: +919876543210 -> +91******3210
 *
 * @param {string} phone 
 * @returns {string}
 */
const maskPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return '******';
  const clean = phone.trim();
  if (clean.length <= 6) return '******';
  const prefix = clean.substring(0, 3);
  const suffix = clean.substring(clean.length - 4);
  return `${prefix}${'*'.repeat(Math.max(4, clean.length - 7))}${suffix}`;
};

/**
 * Converts announcement markdown into WhatsApp-compatible formatted text.
 * 
 * @param {Object} announcement 
 * @param {string} [clubName='ClubOps'] 
 * @param {string} [eventName]
 * @returns {string}
 */
const formatWhatsAppAnnouncement = (announcement, clubName = 'ClubOps', eventName = null) => {
  if (!announcement) return '';

  const rawTitle = announcement.title || 'Announcement';
  const rawContent = announcement.content || announcement.message || '';

  // 1. Convert Markdown bold **text** to WhatsApp *text*
  let formattedContent = rawContent
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/^#+\s*(.*)$/gm, '*$1*') // Convert markdown headings to *bold*
    .replace(/__([^_]+)__/g, '_$1_') // Convert double underscores to italics
    .trim();

  // 2. Build structured message header
  let message = `📢 *[${clubName}] ${rawTitle}*`;

  if (eventName) {
    message += `\n🎯 *Event:* ${eventName}`;
  }

  if (announcement.venue) {
    message += `\n📍 *Venue:* ${announcement.venue}`;
  }

  if (announcement.scheduledFor || announcement.time) {
    const timeStr = announcement.scheduledFor
      ? new Date(announcement.scheduledFor).toLocaleString()
      : announcement.time;
    message += `\n⏰ *Time:* ${timeStr}`;
  }

  message += `\n\n${formattedContent}`;
  message += `\n\n_Delivered via ClubOps AI Operations_`;

  return message;
};

/**
 * Generates an instant Click-to-Chat WhatsApp URL for manual organizer dispatch.
 * 
 * @param {string} phone 
 * @param {string} text 
 * @returns {string|null}
 */
const generateClickToChatUrl = (phone, text = '') => {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return null;
  const digitsOnly = normalized.replace(/^\+/, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${digitsOnly}?text=${encodedText}`;
};

/**
 * Selects the active WhatsApp provider based on configuration.
 */
const getActiveProvider = () => {
  const configuredProvider = (config.whatsappProvider || '').toLowerCase().trim();

  if (configuredProvider === 'cloud_api' && config.whatsappApiToken && config.whatsappPhoneNumberId) {
    return { name: 'cloud_api', adapter: cloudApiProvider };
  }

  if (configuredProvider === 'twilio' && config.twilioAccountSid && config.twilioAuthToken && config.twilioWhatsappFrom) {
    return { name: 'twilio', adapter: twilioProvider };
  }

  // Default / fallback to High-Fidelity Simulator
  return { name: 'simulator', adapter: simulatorProvider };
};

/**
 * Sends a single WhatsApp message through the active provider.
 *
 * @param {Object} params
 * @param {string} params.toPhone - Raw or formatted recipient phone
 * @param {string} params.messageBody - Text body
 * @param {Object} [params.metadata]
 * @returns {Promise<Object>}
 */
const sendWhatsAppMessage = async ({ toPhone, messageBody, metadata = {} }) => {
  const normalizedPhone = normalizePhoneNumber(toPhone);

  if (!normalizedPhone) {
    return {
      success: false,
      mode: 'validation',
      provider: 'none',
      status: 'failed',
      errorCode: 'INVALID_PHONE',
      errorMessage: 'Recipient has missing or invalid phone number',
      recipient: toPhone || null
    };
  }

  const { name: providerName, adapter } = getActiveProvider();
  const masked = maskPhoneNumber(normalizedPhone);
  const startTime = Date.now();

  try {
    const result = await adapter.sendMessage({
      toPhone: normalizedPhone,
      messageBody,
      metadata
    });

    const duration = Date.now() - startTime;
    console.log(`[WHATSAPP] Dispatch to ${masked} via ${providerName} (${duration}ms): status=${result.status}`);

    return {
      ...result,
      normalizedPhone
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[WHATSAPP ERROR] Dispatch to ${masked} failed (${duration}ms): ${err.message}`);

    return {
      success: false,
      mode: providerName,
      provider: providerName,
      status: 'failed',
      errorCode: 'DISPATCH_ERROR',
      errorMessage: err.message,
      normalizedPhone
    };
  }
};

/**
 * Retrieves aggregate delivery funnel statistics for an announcement scoped to a club.
 *
 * @param {string|ObjectId} announcementId 
 * @param {string|ObjectId} clubId 
 * @returns {Promise<{ queued: number, sent: number, delivered: number, read: number, failed: number, total: number }>}
 */
const getBroadcastDeliveryStats = async (announcementId, clubId) => {
  validateObjectId(announcementId, 'announcement ID');
  validateObjectId(clubId, 'club ID');

  const stats = await BroadcastDelivery.aggregate([
    {
      $match: {
        announcement: new (require('mongoose').Types.ObjectId)(announcementId.toString()),
        club: new (require('mongoose').Types.ObjectId)(clubId.toString()),
        channel: 'whatsapp'
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const summary = {
    queued: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    total: 0
  };

  for (const item of stats) {
    if (item._id === 'queued' || item._id === 'pending') summary.queued += item.count;
    else if (item._id === 'sent' || item._id === 'accepted') summary.sent += item.count;
    else if (item._id === 'delivered') summary.delivered += item.count;
    else if (item._id === 'read') summary.read += item.count;
    else if (item._id === 'failed' || item._id === 'skipped' || item._id === 'not_configured') summary.failed += item.count;
    else if (item._id === 'simulated') summary.delivered += item.count;

    summary.total += item.count;
  }

  return summary;
};

/**
 * Validates delivery state machine transitions.
 */
const STATE_HIERARCHY = {
  queued: 1,
  pending: 1,
  sent: 2,
  accepted: 2,
  delivered: 3,
  simulated: 3,
  read: 4,
  failed: 5
};

const isValidTransition = (currentStatus, newStatus) => {
  if (newStatus === 'failed') return true;
  const currentRank = STATE_HIERARCHY[currentStatus] || 0;
  const newRank = STATE_HIERARCHY[newStatus] || 0;
  return newRank >= currentRank;
};

/**
 * Updates a delivery record via webhook status callback and emits real-time SSE updates.
 *
 * @param {Object} params
 * @param {string} params.providerMessageId 
 * @param {string} params.status - 'sent' | 'delivered' | 'read' | 'failed'
 * @param {Date} [params.timestamp]
 * @param {string} [params.failureReason]
 * @returns {Promise<Object|null>}
 */
const handleWebhookStatusUpdate = async ({ providerMessageId, status, timestamp = new Date(), failureReason = null }) => {
  if (!providerMessageId) return null;

  const delivery = await BroadcastDelivery.findOne({ providerMessageId });
  if (!delivery) {
    console.warn(`[WHATSAPP WEBHOOK] No delivery record found for message ID: ${providerMessageId}`);
    return null;
  }

  if (!isValidTransition(delivery.status, status)) {
    console.log(`[WHATSAPP WEBHOOK] Ignored backward state transition from "${delivery.status}" to "${status}" for ${providerMessageId}`);
    return delivery;
  }

  delivery.status = status;
  const now = new Date(timestamp);

  if (status === 'sent') delivery.sentAt = now;
  else if (status === 'delivered') delivery.deliveredAt = now;
  else if (status === 'read') delivery.readAt = now;
  else if (status === 'failed') {
    delivery.failedAt = now;
    if (failureReason) delivery.failureReason = failureReason;
  }

  await delivery.save();

  // Emit real-time SSE updates scoped strictly to the club
  const ssePayload = {
    deliveryId: delivery._id.toString(),
    providerMessageId,
    announcementId: delivery.announcement ? delivery.announcement.toString() : null,
    recipientId: delivery.recipient ? delivery.recipient.toString() : null,
    status,
    channel: 'whatsapp',
    timestamp: now.toISOString()
  };

  sendToClub(delivery.club, `whatsapp.delivery.${status}`, ssePayload);
  sendToClub(delivery.club, 'whatsapp.delivery.updated', ssePayload);
  if (delivery.event) {
    sendToEvent(delivery.event, 'whatsapp.delivery.updated', ssePayload);
  }

  return delivery;
};

module.exports = {
  normalizePhoneNumber,
  maskPhoneNumber,
  formatWhatsAppAnnouncement,
  generateClickToChatUrl,
  getActiveProvider,
  sendWhatsAppMessage,
  getBroadcastDeliveryStats,
  handleWebhookStatusUpdate,
  isValidTransition
};
