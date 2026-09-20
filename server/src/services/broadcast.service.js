/**
 * Broadcast Service
 * Provides audience resolution, recipient preview, multi-channel broadcast dispatch,
 * delivery statistics, and retry mechanisms.
 */

const Announcement = require('../models/Announcement');
const BroadcastDelivery = require('../models/BroadcastDelivery');
const User = require('../models/User');
const Notification = require('../models/Notification');
const whatsappService = require('./whatsapp.service');
const simulatorProvider = require('./whatsapp/simulatorProvider');
const announcementDeliveryService = require('./announcements/announcementDeliveryService');
const { AppError } = require('../utils/errors');
const { validateObjectId } = require('../utils/pagination');
const { broadcastNotification, sendToClub } = require('../utils/realtime');

const ALLOWED_CHANNELS = new Set(['in_app', 'email', 'whatsapp', 'sms', 'push']);

/**
 * Resolves audience recipients in a club.
 */
const resolveAudienceRecipients = async (clubId, audience = 'all') => {
  validateObjectId(clubId, 'club ID');

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
      break;
  }

  return User.find(query).select('_id name email role phone notificationPreferences avatarUrl').lean();
};

/**
 * Dispatches an announcement across requested communication channels.
 * 
 * @param {string|ObjectId} clubId 
 * @param {string|ObjectId} userId 
 * @param {string|ObjectId} announcementId 
 * @param {string[]} [channels=['in_app']] 
 * @param {Object} [options={}]
 */
const broadcastAnnouncement = async (clubId, userId, announcementId, channels = ['in_app'], options = {}) => {
  validateObjectId(announcementId, 'announcement ID');
  validateObjectId(clubId, 'club ID');

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
      throw new AppError(`Invalid broadcast channel "${ch}". Allowed: in_app, email, whatsapp, sms, push`, 400);
    }
  }

  const startTime = Date.now();

  // 1. Resolve recipients
  const audienceTag = announcement.targetAudience || 'all';
  const recipients = await resolveAudienceRecipients(clubId, audienceTag);

  const resolutionTime = Date.now() - startTime;
  console.log(`[WHATSAPP] recipient resolution: ${resolutionTime}ms (${recipients.length} recipients)`);

  let sentCount = 0;
  let simulatedCount = 0;
  let failedCount = 0;
  let queuedCount = 0;
  const receipts = [];
  const now = new Date();

  // 2. Iterate each channel and recipient with idempotency
  for (const channel of requestedChannels) {
    for (const recipient of recipients) {
      // Check existing delivery record for idempotency
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

          broadcastNotification(notif);

          const delivery = new BroadcastDelivery({
            announcement: announcement._id,
            club: clubId,
            event: announcement.event || null,
            channel: 'in_app',
            recipient: recipient._id,
            status: 'delivered',
            provider: 'in_app',
            providerMessageId: `inapp_${notif._id}`,
            queuedAt: now,
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
        const simMessageId = `sim-email-${announcement._id.toString().slice(-6)}-${recipient._id.toString().slice(-4)}-${Date.now()}`;
        const delivery = new BroadcastDelivery({
          announcement: announcement._id,
          club: clubId,
          event: announcement.event || null,
          channel: 'email',
          recipient: recipient._id,
          status: 'simulated',
          provider: 'email-simulator',
          providerMessageId: simMessageId,
          metadata: { email: recipient.email, simulatedSubject: announcement.title },
          queuedAt: now,
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
        const rawPhone = recipient.phone;
        const normalizedPhone = whatsappService.normalizePhoneNumber(rawPhone);

        if (!normalizedPhone) {
          // Gracefully mark single recipient as failed without aborting batch
          const delivery = new BroadcastDelivery({
            announcement: announcement._id,
            club: clubId,
            event: announcement.event || null,
            channel: 'whatsapp',
            recipient: recipient._id,
            phone: rawPhone || null,
            status: 'failed',
            provider: 'whatsapp',
            errorCode: 'INVALID_PHONE',
            errorMessage: 'Recipient has no phone number on profile',
            failureReason: 'Recipient has no phone number on profile',
            failedAt: now,
            queuedAt: now
          });
          await delivery.save();

          failedCount++;
          receipts.push({
            channel: 'whatsapp',
            recipientId: recipient._id,
            recipientName: recipient.name,
            status: 'failed',
            failureReason: 'Recipient has no phone number on profile'
          });
          continue;
        }

        const messageBody = whatsappService.formatWhatsAppAnnouncement(
          announcement,
          'ClubOps',
          announcement.event ? announcement.event.title : null
        );

        const dispatchResult = await whatsappService.sendWhatsAppMessage({
          toPhone: normalizedPhone,
          messageBody,
          metadata: {
            announcementId: announcement._id.toString(),
            recipientId: recipient._id.toString()
          }
        });

        const initialStatus = dispatchResult.status || 'queued';
        const delivery = new BroadcastDelivery({
          announcement: announcement._id,
          club: clubId,
          event: announcement.event || null,
          channel: 'whatsapp',
          recipient: recipient._id,
          phone: normalizedPhone,
          status: initialStatus,
          provider: dispatchResult.provider || 'whatsapp',
          providerMessageId: dispatchResult.providerMessageId || `wa_${Date.now()}_${recipient._id.toString().slice(-4)}`,
          metadata: dispatchResult.metadata || {},
          queuedAt: now,
          sentAt: initialStatus === 'sent' ? now : null,
          failedAt: initialStatus === 'failed' ? now : null,
          failureReason: dispatchResult.errorMessage || null
        });
        await delivery.save();

        if (initialStatus === 'failed') {
          failedCount++;
        } else {
          queuedCount++;
          if (dispatchResult.mode === 'simulator') {
            simulatedCount++;
            // Schedule background progression: queued -> sent -> delivered -> read
            simulatorProvider.scheduleSimulationProgression(
              delivery._id,
              delivery.providerMessageId,
              clubId.toString(),
              announcement.event ? announcement.event.toString() : null,
              announcement._id.toString()
            );
          } else {
            sentCount++;
          }
        }

        receipts.push({
          channel: 'whatsapp',
          recipientId: recipient._id,
          recipientName: recipient.name,
          phone: whatsappService.maskPhoneNumber(normalizedPhone),
          status: initialStatus,
          providerMessageId: delivery.providerMessageId
        });
      }
    }
  }

  // 3. Mark announcement published if it was in draft
  if (announcement.status === 'draft') {
    announcement.status = 'published';
    announcement.publishedAt = now;
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

  const totalDuration = Date.now() - startTime;
  console.log(`[WHATSAPP] broadcast total: ${totalDuration}ms`);

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
      queued: queuedCount,
      simulatedExternal: simulatedCount,
      failed: failedCount
    },
    receipts
  };
};

/**
 * Retries failed or pending deliveries for an announcement scoped to a club.
 */
const retryFailedDeliveries = async (clubId, announcementId, options = {}) => {
  validateObjectId(announcementId, 'announcement ID');
  validateObjectId(clubId, 'club ID');

  const announcement = await Announcement.findOne({ _id: announcementId, club: clubId });
  if (!announcement) {
    throw new AppError('Announcement not found or does not belong to your club', 404);
  }

  const query = {
    announcement: announcementId,
    club: clubId,
    status: { $in: ['failed', 'queued', 'pending'] }
  };

  if (Array.isArray(options.deliveryIds) && options.deliveryIds.length > 0) {
    query._id = { $in: options.deliveryIds };
  }

  const failedDeliveries = await BroadcastDelivery.find(query).populate('recipient', 'name phone email role');
  const retried = [];
  const now = new Date();

  for (const delivery of failedDeliveries) {
    if (delivery.channel === 'whatsapp' && delivery.recipient) {
      const normalizedPhone = whatsappService.normalizePhoneNumber(delivery.recipient.phone || delivery.phone);

      if (!normalizedPhone) {
        delivery.status = 'failed';
        delivery.failureReason = 'Recipient has no phone number on profile';
        delivery.lastAttemptAt = now;
        delivery.attemptCount = (delivery.attemptCount || 1) + 1;
        await delivery.save();
        retried.push({ id: delivery._id, status: 'failed', reason: delivery.failureReason });
        continue;
      }

      const formattedBody = whatsappService.formatWhatsAppAnnouncement(
        announcement,
        'ClubOps',
        announcement.event?.title
      );

      const dispatchResult = await whatsappService.sendWhatsAppMessage({
        toPhone: normalizedPhone,
        messageBody: formattedBody,
        metadata: {
          announcementId: announcement._id.toString(),
          recipientId: delivery.recipient._id.toString(),
          retry: true
        }
      });

      delivery.status = dispatchResult.status || 'queued';
      delivery.phone = normalizedPhone;
      delivery.provider = dispatchResult.provider || 'whatsapp';
      delivery.providerMessageId = dispatchResult.providerMessageId || delivery.providerMessageId;
      delivery.lastAttemptAt = now;
      delivery.attemptCount = (delivery.attemptCount || 1) + 1;
      delivery.failureReason = dispatchResult.errorMessage || null;
      await delivery.save();

      if (dispatchResult.mode === 'simulator' && delivery.status !== 'failed') {
        simulatorProvider.scheduleSimulationProgression(
          delivery._id,
          delivery.providerMessageId,
          clubId.toString(),
          announcement.event ? announcement.event.toString() : null,
          announcement._id.toString()
        );
      }

      retried.push({
        id: delivery._id,
        status: delivery.status,
        providerMessageId: delivery.providerMessageId
      });
    }
  }

  return {
    announcementId,
    retriedCount: retried.length,
    retried
  };
};

module.exports = {
  broadcastAnnouncement,
  resolveAudienceRecipients,
  getBroadcastDeliveryStats: whatsappService.getBroadcastDeliveryStats,
  retryFailedDeliveries,
  checkChannelProviderStatus: announcementDeliveryService.getProviderStatus,
  getProviderStatus: announcementDeliveryService.getProviderStatus,
  resolveMultiAudienceRecipients: announcementDeliveryService.resolveAudienceRecipients,
  getAudiencePreview: announcementDeliveryService.getAudiencePreview,
  sendControlledTest: announcementDeliveryService.sendControlledTest
};
