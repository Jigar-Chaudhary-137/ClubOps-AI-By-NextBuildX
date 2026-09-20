/**
 * High-Fidelity WhatsApp Simulator Provider
 * Provides zero-configuration sandbox delivery simulation with realistic message IDs
 * and asynchronous lifecycle progression: queued -> sent -> delivered -> read.
 */

const crypto = require('crypto');
const config = require('../../config/env');
const BroadcastDelivery = require('../../models/BroadcastDelivery');
const { sendToClub, sendToEvent } = require('../../utils/realtime');

/**
 * Generates a realistic Meta WhatsApp message ID (e.g. wamid.HBgLMTIzNDU2Nzg5MA==).
 */
const generateWamid = () => {
  const randomBytes = crypto.randomBytes(16).toString('base64url');
  return `wamid.HB${randomBytes}`;
};

/**
 * Progresses delivery record through realistic lifecycle states asynchronously.
 * 
 * @param {string} deliveryId 
 * @param {string} providerMessageId 
 * @param {string} clubId 
 * @param {string} [eventId]
 * @param {string} announcementId 
 */
const scheduleSimulationProgression = (deliveryId, providerMessageId, clubId, eventId, announcementId) => {
  const sentDelay = config.whatsappSimulatedSentDelayMs || 300;
  const deliveredDelay = config.whatsappSimulatedDeliveredDelayMs || 700;
  const readDelay = config.whatsappSimulatedReadDelayMs || 1200;

  // 1. Transition: queued -> sent
  const sentTimer = setTimeout(async () => {
    try {
      const now = new Date();
      await BroadcastDelivery.updateOne(
        { _id: deliveryId, status: 'queued' },
        { $set: { status: 'sent', sentAt: now, lastAttemptAt: now } }
      );

      const payload = {
        deliveryId: deliveryId.toString(),
        providerMessageId,
        announcementId: announcementId ? announcementId.toString() : null,
        status: 'sent',
        channel: 'whatsapp',
        timestamp: now.toISOString()
      };

      sendToClub(clubId, 'whatsapp.delivery.sent', payload);
      sendToClub(clubId, 'whatsapp.delivery.updated', payload);
      if (eventId) sendToEvent(eventId, 'whatsapp.delivery.updated', payload);
    } catch (err) {
      console.error('[WhatsApp Simulator] Failed to update sent status:', err.message);
    }
  }, sentDelay);

  // 2. Transition: sent -> delivered
  const deliveredTimer = setTimeout(async () => {
    try {
      const now = new Date();
      await BroadcastDelivery.updateOne(
        { _id: deliveryId, status: { $in: ['queued', 'sent'] } },
        { $set: { status: 'delivered', deliveredAt: now } }
      );

      const payload = {
        deliveryId: deliveryId.toString(),
        providerMessageId,
        announcementId: announcementId ? announcementId.toString() : null,
        status: 'delivered',
        channel: 'whatsapp',
        timestamp: now.toISOString()
      };

      sendToClub(clubId, 'whatsapp.delivery.delivered', payload);
      sendToClub(clubId, 'whatsapp.delivery.updated', payload);
      if (eventId) sendToEvent(eventId, 'whatsapp.delivery.updated', payload);
    } catch (err) {
      console.error('[WhatsApp Simulator] Failed to update delivered status:', err.message);
    }
  }, deliveredDelay);

  // 3. Transition: delivered -> read
  const readTimer = setTimeout(async () => {
    try {
      const now = new Date();
      await BroadcastDelivery.updateOne(
        { _id: deliveryId, status: { $in: ['queued', 'sent', 'delivered'] } },
        { $set: { status: 'read', readAt: now } }
      );

      const payload = {
        deliveryId: deliveryId.toString(),
        providerMessageId,
        announcementId: announcementId ? announcementId.toString() : null,
        status: 'read',
        channel: 'whatsapp',
        timestamp: now.toISOString()
      };

      sendToClub(clubId, 'whatsapp.delivery.read', payload);
      sendToClub(clubId, 'whatsapp.delivery.updated', payload);
      if (eventId) sendToEvent(eventId, 'whatsapp.delivery.updated', payload);
    } catch (err) {
      console.error('[WhatsApp Simulator] Failed to update read status:', err.message);
    }
  }, readDelay);

  // Unref timers so background test runs or graceful server shutdowns are not held open
  if (sentTimer.unref) sentTimer.unref();
  if (deliveredTimer.unref) deliveredTimer.unref();
  if (readTimer.unref) readTimer.unref();
};

/**
 * Simulates sending a WhatsApp message.
 *
 * @param {Object} params
 * @param {string} params.toPhone
 * @param {string} params.messageBody
 * @param {Object} [params.metadata]
 * @returns {Promise<{ success: boolean, mode: string, provider: string, providerMessageId: string, status: string, recipient: string }>}
 */
const sendMessage = async ({ toPhone, messageBody, metadata = {} }) => {
  const providerMessageId = generateWamid();

  return {
    success: true,
    mode: 'simulator',
    provider: 'simulator',
    providerMessageId,
    status: 'queued',
    recipient: toPhone,
    metadata: {
      ...metadata,
      simulated: true,
      previewText: messageBody.substring(0, 100)
    }
  };
};

/**
 * Health check for simulator provider.
 */
const checkHealth = async () => {
  return {
    configured: true,
    connected: true,
    provider: 'ClubOps WhatsApp Simulator',
    status: 'READY',
    mode: 'simulator',
    description: 'High-fidelity sandbox simulation with automatic queued -> sent -> delivered -> read lifecycle progression'
  };
};

module.exports = {
  sendMessage,
  checkHealth,
  scheduleSimulationProgression,
  generateWamid
};
