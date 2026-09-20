/**
 * Central Announcement Delivery Orchestrator
 * Coordinates multi-channel delivery across Email, WhatsApp, SMS, Push, and In-App.
 * 
 * Features:
 * - Safe Dry-Run default (ANNOUNCEMENT_DELIVERY_MODE=dry_run)
 * - Database-level idempotency enforcement
 * - User notification preference opt-out checks
 * - Accurate status tracking (pending, accepted, sent, delivered, failed, skipped, not_configured, simulated)
 * - Controlled test dispatch
 */

const Announcement = require('../../models/Announcement');
const BroadcastDelivery = require('../../models/BroadcastDelivery');
const User = require('../../models/User');
const Volunteer = require('../../models/Volunteer');
const Task = require('../../models/Task');
const config = require('../../config/env');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errors');
const { validateObjectId } = require('../../utils/pagination');
const { sendToClub } = require('../../utils/realtime');

const whatsappService = require('../whatsapp.service');
const emailDeliveryService = require('./emailDeliveryService');
const smsDeliveryService = require('./smsDeliveryService');
const whatsappDeliveryService = require('./whatsappDeliveryService');
const pushDeliveryService = require('./pushDeliveryService');
const inAppDeliveryService = require('./inAppDeliveryService');

const ALLOWED_CHANNELS = new Set(['in_app', 'email', 'whatsapp', 'sms', 'push']);

/**
 * Retrieves aggregate provider health and configuration status without exposing credentials.
 */
const getProviderStatus = async () => {
  const [email, sms, whatsapp, push, inApp] = await Promise.all([
    emailDeliveryService.checkHealth(),
    smsDeliveryService.checkHealth(),
    whatsappDeliveryService.checkHealth(),
    pushDeliveryService.checkHealth(),
    inAppDeliveryService.getStatus()
  ]);

  return {
    deliveryMode: config.announcementDeliveryMode || 'dry_run',
    providers: {
      in_app: inApp,
      email,
      whatsapp,
      sms,
      push
    }
  };
};

/**
 * Normalizes audience identifiers to standard tags.
 */
const normalizeAudienceTag = (tag) => {
  if (!tag) return 'entire_club';
  const clean = tag.toString().toLowerCase().trim().replace(/[-_\s]+/g, '_');
  if (clean.includes('all') || clean.includes('entire')) return 'entire_club';
  if (clean.includes('event') || clean.includes('participant')) return 'event_participants';
  if (clean.includes('volunteer')) return 'volunteers';
  if (clean.includes('organizer') || clean.includes('admin') || clean.includes('lead')) return 'organizers';
  if (clean.includes('trainer') || clean.includes('mentor')) return 'trainers';
  if (clean.includes('custom')) return 'custom_audience';
  return clean;
};

/**
 * Resolves deduplicated recipients across selected audiences in a club.
 */
const resolveAudienceRecipients = async (clubId, options = {}) => {
  validateObjectId(clubId, 'club ID');

  const rawAudiences = Array.isArray(options.audiences) && options.audiences.length > 0
    ? options.audiences
    : (options.targetAudience ? [options.targetAudience] : ['Entire Club']);

  const normalizedAudiences = new Set(rawAudiences.map(normalizeAudienceTag));
  const eventId = options.eventId || null;
  const customUserIds = Array.isArray(options.customUserIds) ? options.customUserIds : [];

  const recipientMap = new Map();

  const addUsersToMap = (users) => {
    if (!Array.isArray(users)) return;
    for (const u of users) {
      if (u && u._id) {
        const idStr = u._id.toString();
        if (!recipientMap.has(idStr)) {
          recipientMap.set(idStr, {
            _id: u._id,
            name: u.name || 'Member',
            email: u.email || '',
            phone: u.phone || '',
            whatsappNumber: u.whatsappNumber || '',
            role: u.role || 'member',
            avatarUrl: u.avatarUrl || '',
            deviceTokens: Array.isArray(u.deviceTokens) ? u.deviceTokens : [],
            notificationPreferences: u.notificationPreferences || {
              emailAnnouncements: true,
              smsAnnouncements: true,
              whatsappAnnouncements: true,
              pushAnnouncements: true,
              inAppAnnouncements: true
            }
          });
        }
      }
    }
  };

  // 1. Entire Club
  if (normalizedAudiences.has('entire_club')) {
    const clubMembers = await User.find({ club: clubId, isActive: true })
      .select('_id name email phone whatsappNumber role avatarUrl deviceTokens notificationPreferences')
      .lean();
    addUsersToMap(clubMembers);
  }

  // 2. Event Participants
  if (normalizedAudiences.has('event_participants') && eventId) {
    validateObjectId(eventId, 'event ID');
    const eventVolunteers = await Volunteer.find({ club: clubId, event: eventId })
      .populate('user', '_id name email phone whatsappNumber role avatarUrl deviceTokens notificationPreferences')
      .lean();
    const volunteerUsers = eventVolunteers.map(v => v.user).filter(Boolean);
    addUsersToMap(volunteerUsers);

    const eventTasks = await Task.find({ club: clubId, event: eventId, assignedTo: { $ne: null } })
      .populate('assignedTo', '_id name email phone whatsappNumber role avatarUrl deviceTokens notificationPreferences')
      .lean();
    const taskUsers = eventTasks.map(t => t.assignedTo).filter(Boolean);
    addUsersToMap(taskUsers);
  }

  // 3. Volunteers
  if (normalizedAudiences.has('volunteers')) {
    const volQuery = { club: clubId };
    if (eventId) {
      volQuery.event = eventId;
    }
    const volunteers = await Volunteer.find(volQuery)
      .populate('user', '_id name email phone whatsappNumber role avatarUrl deviceTokens notificationPreferences')
      .lean();
    const volunteerUsers = volunteers.map(v => v.user).filter(Boolean);
    addUsersToMap(volunteerUsers);

    const roleVolunteers = await User.find({ club: clubId, role: 'volunteer', isActive: true })
      .select('_id name email phone whatsappNumber role avatarUrl deviceTokens notificationPreferences')
      .lean();
    addUsersToMap(roleVolunteers);
  }

  // 4. Organizers
  if (normalizedAudiences.has('organizers')) {
    const organizers = await User.find({
      club: clubId,
      role: { $in: ['admin', 'organizer'] },
      isActive: true
    })
      .select('_id name email phone whatsappNumber role avatarUrl deviceTokens notificationPreferences')
      .lean();
    addUsersToMap(organizers);
  }

  // 5. Trainers
  if (normalizedAudiences.has('trainers')) {
    const trainers = await User.find({
      club: clubId,
      $or: [{ role: 'trainer' }, { department: /trainer|mentor/i }],
      isActive: true
    })
      .select('_id name email phone whatsappNumber role avatarUrl deviceTokens notificationPreferences')
      .lean();
    addUsersToMap(trainers);
  }

  // 6. Custom Audience
  if (normalizedAudiences.has('custom_audience') && customUserIds.length > 0) {
    const validIds = customUserIds.filter(id => id && typeof id === 'string');
    if (validIds.length > 0) {
      const customMembers = await User.find({
        _id: { $in: validIds },
        club: clubId,
        isActive: true
      })
        .select('_id name email phone whatsappNumber role avatarUrl deviceTokens notificationPreferences')
        .lean();
      addUsersToMap(customMembers);
    }
  }

  return Array.from(recipientMap.values());
};

/**
 * Calculates real-time preview metrics for the audience selector.
 */
const getAudiencePreview = async (clubId, options = {}) => {
  const recipients = await resolveAudienceRecipients(clubId, options);
  const health = await getProviderStatus();

  let emailAvailableCount = 0;
  let pushAvailableCount = 0;
  let whatsappValidCount = 0;
  const inAppAvailableCount = recipients.length;

  const whatsappRecipients = [];

  for (const r of recipients) {
    if (r.email && /^\S+@\S+\.\S+$/.test(r.email.trim())) {
      emailAvailableCount++;
    }
    if (Array.isArray(r.deviceTokens) && r.deviceTokens.length > 0) {
      pushAvailableCount++;
    }

    const rawWa = r.whatsappNumber || r.phone;
    const normalizedWa = rawWa ? whatsappService.normalizePhoneNumber(rawWa) : null;
    if (normalizedWa) {
      whatsappValidCount++;
      whatsappRecipients.push({
        userId: r._id,
        name: r.name || 'Member',
        phone: normalizedWa,
        status: 'ready'
      });
    } else {
      whatsappRecipients.push({
        userId: r._id,
        name: r.name || 'Member',
        phone: null,
        status: 'missing_contact'
      });
    }
  }

  const noEmailCount = recipients.length - emailAvailableCount;
  const noPhoneCount = recipients.length - whatsappValidCount;
  const noPushCount = recipients.length - pushAvailableCount;

  return {
    audiences: options.audiences || [options.targetAudience || 'Entire Club'],
    uniqueRecipients: recipients.length,
    deliveryMode: health.deliveryMode,
    whatsapp: {
      channel: 'whatsapp',
      totalRecipients: recipients.length,
      validRecipients: whatsappValidCount,
      missingContact: noPhoneCount,
      recipients: whatsappRecipients
    },
    channelAvailability: {
      in_app: {
        total: recipients.length,
        available: inAppAvailableCount,
        missing: 0,
        status: health.providers.in_app.connected ? 'CONNECTED' : 'NOT_CONFIGURED',
        providerNotice: health.providers.in_app.details
      },
      email: {
        total: recipients.length,
        available: emailAvailableCount,
        missing: noEmailCount,
        status: health.providers.email.status,
        providerNotice: health.providers.email.connected
          ? `SendGrid connected via ${health.providers.email.fromEmail}`
          : 'SendGrid API credentials not configured in environment'
      },
      whatsapp: {
        total: recipients.length,
        available: whatsappValidCount,
        missing: noPhoneCount,
        status: health.providers.whatsapp.status,
        providerNotice: health.providers.whatsapp.connected
          ? `WhatsApp provider ready`
          : 'WhatsApp provider not configured in environment'
      },
      sms: {
        total: recipients.length,
        available: whatsappValidCount,
        missing: noPhoneCount,
        status: health.providers.sms.status,
        providerNotice: health.providers.sms.connected
          ? `SMS provider ready`
          : 'SMS provider not configured in environment'
      },
      push: {
        total: recipients.length,
        available: pushAvailableCount,
        missing: noPushCount,
        status: health.providers.push.status,
        providerNotice: health.providers.push.connected
          ? 'Firebase Cloud Messaging connected and ready'
          : 'Firebase Admin credentials not configured in environment'
      }
    },
    missingContactSummary: {
      noEmailCount,
      noPhoneCount,
      noPushCount
    },
    channelConfigStatus: {
      in_app: health.providers.in_app.connected ? 'AVAILABLE' : 'NOT_CONFIGURED',
      email: health.providers.email.connected ? 'AVAILABLE' : 'NOT_CONFIGURED',
      whatsapp: health.providers.whatsapp.connected ? 'AVAILABLE' : 'NOT_CONFIGURED',
      sms: health.providers.sms.connected ? 'AVAILABLE' : 'NOT_CONFIGURED',
      push: health.providers.push.connected ? 'AVAILABLE' : 'NOT_CONFIGURED'
    }
  };
};

/**
 * Checks if a recipient has opted out of a specific channel.
 */
const isChannelOptedOut = (recipient, channel) => {
  const prefs = recipient.notificationPreferences;
  if (!prefs) return false;
  switch (channel) {
    case 'email':
      return prefs.emailAnnouncements === false;
    case 'sms':
      return prefs.smsAnnouncements === false;
    case 'whatsapp':
      return prefs.whatsappAnnouncements === false;
    case 'push':
      return prefs.pushAnnouncements === false;
    case 'in_app':
      return prefs.inAppAnnouncements === false;
    default:
      return false;
  }
};

/**
 * Broadcasts an announcement across selected channels with strict idempotency and accurate delivery tracking.
 *
 * @param {string|ObjectId} clubId - The club ID
 * @param {string|ObjectId} userId - Requesting user ID
 * @param {string|ObjectId} announcementId - Announcement ID
 * @param {string[]} [requestedChannels] - Channels to dispatch
 * @param {Object} [options] - Options (e.g. override deliveryMode)
 */
const broadcastAnnouncement = async (clubId, userId, announcementId, requestedChannels = ['in_app'], options = {}) => {
  validateObjectId(announcementId, 'announcement ID');

  const announcement = await Announcement.findOne({
    _id: announcementId,
    club: clubId
  });

  if (!announcement) {
    throw new AppError('Announcement not found or does not belong to your club', 404);
  }

  const channelsToUse = Array.isArray(requestedChannels) && requestedChannels.length > 0
    ? requestedChannels
    : (Array.isArray(announcement.channels) && announcement.channels.length > 0 ? announcement.channels : ['in_app']);

  for (const ch of channelsToUse) {
    if (!ALLOWED_CHANNELS.has(ch)) {
      throw new AppError(`Invalid broadcast channel "${ch}". Allowed: in_app, email, whatsapp, sms, push`, 400);
    }
  }

  // Determine delivery mode: dry_run (safe default) vs live
  const deliveryMode = (options.deliveryMode || config.announcementDeliveryMode || 'dry_run').toLowerCase();
  const isDryRun = deliveryMode !== 'live';

  // 1. Resolve deduplicated recipients
  const audienceList = announcement.targetAudiences && announcement.targetAudiences.length > 0
    ? announcement.targetAudiences
    : [announcement.targetAudience || 'Entire Club'];

  const recipients = await resolveAudienceRecipients(clubId, {
    audiences: audienceList,
    eventId: announcement.event,
    customUserIds: announcement.customRecipients
  });

  const providerHealth = await getProviderStatus();
  const now = new Date();
  const receipts = [];

  const stats = {
    uniqueRecipients: recipients.length,
    deliveryMode,
    in_app: { sent: 0, failed: 0, skipped: 0, simulated: 0, status: 'delivered' },
    email: { accepted: 0, sent: 0, skipped: 0, failed: 0, simulated: 0, not_configured: 0, status: providerHealth.providers.email.connected ? 'ready' : 'not_configured' },
    whatsapp: { accepted: 0, sent: 0, skipped: 0, failed: 0, simulated: 0, not_configured: 0, status: providerHealth.providers.whatsapp.connected ? 'ready' : 'not_configured' },
    sms: { accepted: 0, sent: 0, skipped: 0, failed: 0, simulated: 0, not_configured: 0, status: providerHealth.providers.sms.connected ? 'ready' : 'not_configured' },
    push: { accepted: 0, sent: 0, skipped: 0, failed: 0, simulated: 0, not_configured: 0, status: providerHealth.providers.push.connected ? 'ready' : 'not_configured' }
  };

  // 2. Iterate channels & recipients with idempotency
  for (const channel of channelsToUse) {
    const channelProvider = providerHealth.providers[channel];
    const isConfigured = channelProvider ? channelProvider.connected : false;

    for (const recipient of recipients) {
      // Step A: Check DB-level idempotency to prevent duplicate dispatches
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
          alreadySent: true
        });
        continue;
      }

      // Step B: Check user opt-out preferences
      if (isChannelOptedOut(recipient, channel)) {
        try {
          const skippedDelivery = new BroadcastDelivery({
            announcement: announcement._id,
            club: clubId,
            event: announcement.event || null,
            channel,
            recipient: recipient._id,
            status: 'skipped',
            errorCode: 'USER_OPTED_OUT',
            errorMessage: `User opted out of ${channel} announcements`
          });
          await skippedDelivery.save();
        } catch (e) {
          // Ignore duplicate-key error if race condition
        }

        if (stats[channel]) stats[channel].skipped++;
        receipts.push({
          channel,
          recipientId: recipient._id,
          recipientName: recipient.name,
          status: 'skipped',
          errorCode: 'USER_OPTED_OUT',
          notice: 'User opted out'
        });
        continue;
      }

      // Step C: Channel Dispatch
      let deliveryResult;

      if (channel === 'in_app') {
        // In-app is always executed live because it is internal to the application
        deliveryResult = await inAppDeliveryService.sendInApp({
          recipient,
          announcement,
          clubId
        });
      } else if (channel === 'email') {
        deliveryResult = await emailDeliveryService.sendEmail({
          recipient,
          announcement,
          clubId,
          isDryRun
        });
      } else if (channel === 'sms') {
        deliveryResult = await smsDeliveryService.sendSms({
          recipient,
          announcement,
          clubId,
          isDryRun
        });
      } else if (channel === 'whatsapp') {
        deliveryResult = await whatsappDeliveryService.sendWhatsapp({
          recipient,
          announcement,
          clubId,
          isDryRun
        });
      } else if (channel === 'push') {
        deliveryResult = await pushDeliveryService.sendPush({
          recipient,
          announcement,
          clubId,
          isDryRun
        });
      }

      // Step D: Persist delivery record with duplicate-key protection
      let savedDelivery = null;
      try {
        savedDelivery = new BroadcastDelivery({
          announcement: announcement._id,
          club: clubId,
          event: announcement.event || null,
          channel,
          recipient: recipient._id,
          status: deliveryResult.status,
          provider: deliveryResult.provider || channel,
          destinationType: deliveryResult.destinationType || (channel === 'email' ? 'email' : 'phone'),
          providerMessageId: deliveryResult.providerMessageId || null,
          errorCode: deliveryResult.errorCode || null,
          errorMessage: deliveryResult.errorMessage || null,
          attemptCount: deliveryResult.attemptCount || 1,
          lastAttemptAt: deliveryResult.lastAttemptAt || now,
          sentAt: deliveryResult.sentAt || (['sent', 'delivered', 'accepted'].includes(deliveryResult.status) ? now : null),
          deliveredAt: deliveryResult.status === 'delivered' ? now : null,
          metadata: deliveryResult.metadata || {}
        });
        await savedDelivery.save();
      } catch (dbErr) {
        if (dbErr.code === 11000) {
          logger.warn(`Duplicate delivery record caught for announcement ${announcement._id}, user ${recipient._id}, channel ${channel}`);
        } else {
          logger.error(`Database error saving BroadcastDelivery: ${dbErr.message}`);
        }
      }

      // Step E: Update aggregate stats
      const resultStatus = deliveryResult.status;
      if (stats[channel]) {
        if (resultStatus === 'simulated') stats[channel].simulated++;
        else if (resultStatus === 'accepted') stats[channel].accepted++;
        else if (resultStatus === 'sent') stats[channel].sent++;
        else if (resultStatus === 'delivered') stats[channel].sent++;
        else if (resultStatus === 'skipped') stats[channel].skipped++;
        else if (resultStatus === 'not_configured') stats[channel].not_configured++;
        else if (resultStatus === 'failed') stats[channel].failed++;
      }

      receipts.push({
        channel,
        recipientId: recipient._id,
        recipientName: recipient.name,
        status: resultStatus,
        providerMessageId: deliveryResult.providerMessageId || null,
        errorCode: deliveryResult.errorCode || null,
        errorMessage: deliveryResult.errorMessage || null
      });
    }
  }

  // 3. Mark announcement published if it was draft/scheduled
  if (announcement.status === 'draft' || announcement.status === 'scheduled') {
    announcement.status = 'published';
    announcement.publishedAt = now;
  }
  announcement.channels = channelsToUse;
  announcement.deliveryStats = stats;
  await announcement.save();

  // 4. Emit club-wide SSE event
  sendToClub(clubId, 'announcement.broadcast', {
    announcementId: announcement._id,
    title: announcement.title,
    priority: announcement.priority,
    targetAudiences: audienceList,
    channels: channelsToUse,
    deliveryMode,
    deliveryStats: stats,
    publishedAt: now
  });

  return {
    announcement: {
      id: announcement._id,
      title: announcement.title,
      status: announcement.status,
      targetAudiences: audienceList,
      channels: channelsToUse,
      deliveryMode,
      deliveryStats: stats
    },
    summary: {
      deliveryMode,
      uniqueRecipients: recipients.length,
      requestedChannels: channelsToUse.length,
      totalOperations: recipients.length * channelsToUse.length,
      inAppDelivered: stats.in_app.sent,
      inAppFailed: stats.in_app.failed,
      emailAccepted: stats.email.accepted,
      emailSent: stats.email.sent,
      emailSkipped: stats.email.skipped,
      emailSimulated: stats.email.simulated,
      emailFailed: stats.email.failed,
      whatsappAccepted: stats.whatsapp.accepted,
      whatsappSent: stats.whatsapp.sent,
      whatsappSkipped: stats.whatsapp.skipped,
      whatsappSimulated: stats.whatsapp.simulated,
      whatsappFailed: stats.whatsapp.failed,
      smsAccepted: stats.sms.accepted,
      smsSent: stats.sms.sent,
      smsSkipped: stats.sms.skipped,
      smsSimulated: stats.sms.simulated,
      smsFailed: stats.sms.failed,
      pushAccepted: stats.push.accepted,
      pushSent: stats.push.sent,
      pushSkipped: stats.push.skipped,
      pushSimulated: stats.push.simulated,
      pushFailed: stats.push.failed
    },
    receipts
  };
};

/**
 * Executes a controlled test delivery to an isolated single test destination.
 * Does NOT broadcast to the club audience.
 */
const sendControlledTest = async ({ channel, testTarget, customContent = 'This is a verified test announcement from ClubOps AI.', isDryRun = false }) => {
  if (!ALLOWED_CHANNELS.has(channel)) {
    throw new AppError(`Invalid test channel: ${channel}`, 400);
  }

  const mockAnnouncement = {
    _id: 'test_announcement_' + Date.now(),
    title: 'ClubOps AI Provider Verification Test',
    content: customContent,
    priority: 'high'
  };

  const mockRecipient = {
    _id: 'test_user_' + Date.now(),
    name: 'Test Administrator',
    email: channel === 'email' ? testTarget : '',
    phone: (channel === 'sms' || channel === 'whatsapp') ? testTarget : '',
    deviceTokens: channel === 'push' ? [{ token: testTarget, platform: 'web' }] : []
  };

  if (channel === 'email') {
    return await emailDeliveryService.sendEmail({
      recipient: mockRecipient,
      announcement: mockAnnouncement,
      isDryRun
    });
  }
  if (channel === 'sms') {
    return await smsDeliveryService.sendSms({
      recipient: mockRecipient,
      announcement: mockAnnouncement,
      isDryRun
    });
  }
  if (channel === 'whatsapp') {
    return await whatsappDeliveryService.sendWhatsapp({
      recipient: mockRecipient,
      announcement: mockAnnouncement,
      isDryRun
    });
  }
  if (channel === 'push') {
    return await pushDeliveryService.sendPush({
      recipient: mockRecipient,
      announcement: mockAnnouncement,
      isDryRun
    });
  }
  if (channel === 'in_app') {
    return {
      status: 'delivered',
      provider: 'MongoDB + Realtime SSE',
      providerMessageId: `test_inapp_${Date.now()}`,
      sentAt: new Date()
    };
  }
};

module.exports = {
  getProviderStatus,
  resolveAudienceRecipients,
  getAudiencePreview,
  broadcastAnnouncement,
  sendControlledTest
};
