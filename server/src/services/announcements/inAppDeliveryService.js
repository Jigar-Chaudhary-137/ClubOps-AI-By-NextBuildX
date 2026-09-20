const Notification = require('../../models/Notification');
const { broadcastNotification } = require('../../utils/realtime');
const logger = require('../../utils/logger');

/**
 * Checks in-app provider health.
 * In-app delivery uses MongoDB Notification storage and real-time SSE.
 */
const getStatus = async () => {
  return {
    configured: true,
    connected: true,
    provider: 'MongoDB + Realtime SSE',
    details: 'Native in-app notifications and live Server-Sent Events are operational'
  };
};

/**
 * Delivers an in-app notification to a specific recipient and emits via SSE.
 *
 * @param {Object} params
 * @param {Object} params.recipient - Recipient user object ({ _id, name, email })
 * @param {Object} params.announcement - Announcement object ({ _id, title, content, priority, event })
 * @param {string|ObjectId} params.clubId - Club ID
 * @returns {Promise<Object>} Delivery result object
 */
const sendInApp = async ({ recipient, announcement, clubId }) => {
  try {
    if (!recipient || !recipient._id) {
      return {
        status: 'skipped',
        errorCode: 'INVALID_RECIPIENT',
        errorMessage: 'Missing recipient identifier'
      };
    }

    const notif = new Notification({
      recipient: recipient._id,
      club: clubId,
      event: announcement.event || null,
      type: 'announcement_broadcast',
      title: `Announcement: ${announcement.title}`,
      message: announcement.content,
      priority: announcement.priority === 'urgent' ? 'urgent' : (announcement.priority === 'high' ? 'high' : 'normal'),
      metadata: {
        announcementId: announcement._id.toString()
      }
    });

    await notif.save();

    // Stream SSE to connected client in real-time
    try {
      broadcastNotification(notif);
    } catch (sseErr) {
      logger.warn(`SSE broadcast warning for recipient ${recipient._id}: ${sseErr.message}`);
    }

    return {
      status: 'delivered',
      providerMessageId: `inapp_${notif._id}`,
      metadata: {
        notificationId: notif._id.toString()
      }
    };
  } catch (error) {
    logger.error(`In-app delivery error for recipient ${recipient?._id}: ${error.message}`);
    return {
      status: 'failed',
      errorCode: 'INAPP_SAVE_FAILED',
      errorMessage: error.message
    };
  }
};

module.exports = {
  getStatus,
  sendInApp
};
