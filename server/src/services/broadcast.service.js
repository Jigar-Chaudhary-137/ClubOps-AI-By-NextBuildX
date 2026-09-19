const Announcement = require('../models/Announcement');
const BroadcastDelivery = require('../models/BroadcastDelivery');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/errors');
const { validateObjectId } = require('../utils/pagination');
const { broadcastNotification, sendToClub } = require('../utils/realtime');

const ALLOWED_CHANNELS = new Set(['in_app', 'email', 'whatsapp']);

/**
 * Resolves recipient users within the club matching the announcement target audience.
 */
const resolveAudienceRecipients = async (clubId, audience = 'all') => {
  const query = { club: clubId, isActive: true };

  switch (audience) {
    case 'organizers':
      query.role = { $in: ['admin', 'organizer'] };
      break;
    case 'volunteers':
      query.role = 'volunteer';
      break;
    case 'members':
      query.role = 'member';
      break;
    case 'all':
    default:
      // All club members
      break;
  }

  return User.find(query).select('_id name email role').lean();
};

/**
 * Dispatches an announcement across multiple communication channels with simulated delivery receipts.
 */
const broadcastAnnouncement = async (clubId, userId, announcementId, channels = ['in_app']) => {
  validateObjectId(announcementId, 'announcement ID');

  const announcement = await Announcement.findOne({
    _id: announcementId,
    club: clubId
  });

  if (!announcement) {
    throw new AppError('Announcement not found or does not belong to your club', 404);
  }

  const requestedChannels = Array.isArray(channels) && channels.length > 0 ? channels : ['in_app'];

  for (const ch of requestedChannels) {
    if (!ALLOWED_CHANNELS.has(ch)) {
      throw new AppError(`Invalid broadcast channel "${ch}". Allowed: in_app, email, whatsapp`, 400);
    }
  }

  // 1. Resolve recipients
  const recipients = await resolveAudienceRecipients(clubId, announcement.targetAudience);

  let sentCount = 0;
  let simulatedCount = 0;
  let failedCount = 0;
  const receipts = [];

  const now = new Date();

  // 2. Iterate each channel and recipient with idempotency
  for (const channel of requestedChannels) {
    for (const recipient of recipients) {
      // Check if already dispatched for this announcement+channel+recipient
      const existing = await BroadcastDelivery.findOne({
        announcement: announcement._id,
        channel,
        recipient: recipient._id
      });

      if (existing) {
        receipts.push({
          channel,
          recipientId: recipient._id,
          recipientName: recipient.name,
          status: existing.status,
          providerMessageId: existing.providerMessageId,
          alreadySent: true
        });
        continue;
      }

      if (channel === 'in_app') {
        try {
          // Create in-app notification
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

          // Push SSE
          broadcastNotification(notif);

          // Record delivery
          const delivery = new BroadcastDelivery({
            announcement: announcement._id,
            club: clubId,
            event: announcement.event || null,
            channel: 'in_app',
            recipient: recipient._id,
            status: 'delivered',
            providerMessageId: `inapp_${notif._id}`,
            sentAt: now,
            deliveredAt: now
          });
          await delivery.save();

          sentCount++;
          receipts.push({
            channel: 'in_app',
            recipientId: recipient._id,
            recipientName: recipient.name,
            status: 'delivered',
            providerMessageId: delivery.providerMessageId
          });
        } catch (err) {
          failedCount++;
          receipts.push({
            channel: 'in_app',
            recipientId: recipient._id,
            recipientName: recipient.name,
            status: 'failed',
            error: err.message
          });
        }
      } else if (channel === 'email') {
        // Simulate email delivery
        const simMessageId = `sim-email-${announcement._id.toString().slice(-6)}-${recipient._id.toString().slice(-4)}-${Date.now()}`;
        const delivery = new BroadcastDelivery({
          announcement: announcement._id,
          club: clubId,
          event: announcement.event || null,
          channel: 'email',
          recipient: recipient._id,
          status: 'simulated',
          providerMessageId: simMessageId,
          metadata: { email: recipient.email, simulatedSubject: announcement.title },
          sentAt: now,
          deliveredAt: now
        });
        await delivery.save();

        simulatedCount++;
        receipts.push({
          channel: 'email',
          recipientId: recipient._id,
          recipientName: recipient.name,
          status: 'simulated',
          providerMessageId: simMessageId
        });
      } else if (channel === 'whatsapp') {
        // Simulate WhatsApp webhook delivery
        const simMessageId = `sim-whatsapp-${announcement._id.toString().slice(-6)}-${recipient._id.toString().slice(-4)}-${Date.now()}`;
        const delivery = new BroadcastDelivery({
          announcement: announcement._id,
          club: clubId,
          event: announcement.event || null,
          channel: 'whatsapp',
          recipient: recipient._id,
          status: 'simulated',
          providerMessageId: simMessageId,
          metadata: { simulatedText: announcement.content.substring(0, 100) },
          sentAt: now,
          deliveredAt: now
        });
        await delivery.save();

        simulatedCount++;
        receipts.push({
          channel: 'whatsapp',
          recipientId: recipient._id,
          recipientName: recipient.name,
          status: 'simulated',
          providerMessageId: simMessageId
        });
      }
    }
  }

  // 3. Mark announcement published if it was in draft
  if (announcement.status === 'draft') {
    announcement.status = 'published';
    await announcement.save();
  }

  // 4. Emit club-wide SSE event
  sendToClub(clubId, 'announcement.broadcast', {
    announcementId: announcement._id,
    title: announcement.title,
    priority: announcement.priority,
    targetAudience: announcement.targetAudience,
    channels: requestedChannels,
    publishedAt: now
  });

  return {
    announcement: {
      id: announcement._id,
      title: announcement.title,
      status: announcement.status,
      targetAudience: announcement.targetAudience
    },
    summary: {
      requestedRecipients: recipients.length,
      requestedChannels: requestedChannels.length,
      totalOperations: recipients.length * requestedChannels.length,
      inAppDelivered: sentCount,
      simulatedExternal: simulatedCount,
      failed: failedCount
    },
    receipts
  };
};

module.exports = {
  broadcastAnnouncement,
  resolveAudienceRecipients
};
