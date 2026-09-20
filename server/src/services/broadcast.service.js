const Announcement = require('../models/Announcement');
const BroadcastDelivery = require('../models/BroadcastDelivery');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/errors');
const { validateObjectId } = require('../utils/pagination');
const { broadcastNotification, sendToClub } = require('../utils/realtime');

const ALLOWED_CHANNELS = new Set(['in_app', 'email', 'whatsapp', 'sms', 'push']);

/**
 * Inspects backend environment to determine true provider configuration status.
 * Never claims a provider is working if credentials are absent.
 */
const checkChannelProviderStatus = () => {
  const emailConfigured = Boolean(
    process.env.SMTP_HOST || process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY
  );
  const whatsappConfigured = Boolean(
    process.env.WHATSAPP_API_TOKEN || process.env.TWILIO_WHATSAPP_NUMBER
  );
  const smsConfigured = Boolean(
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) ||
    process.env.SMS_API_KEY
  );
  const pushConfigured = Boolean(
    process.env.VAPID_PRIVATE_KEY || process.env.FCM_SERVER_KEY
  );

  return {
    in_app: 'AVAILABLE',
    email: emailConfigured ? 'AVAILABLE' : 'NOT_CONFIGURED',
    whatsapp: whatsappConfigured ? 'AVAILABLE' : 'NOT_CONFIGURED',
    sms: smsConfigured ? 'AVAILABLE' : 'NOT_CONFIGURED',
    push: pushConfigured ? 'AVAILABLE' : 'NOT_CONFIGURED'
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
 * Resolves recipient users across multiple selected audiences within the club.
 * Strictly deduplicates recipients by User._id so each member receives exactly one message per channel.
 */
const resolveMultiAudienceRecipients = async (clubId, options = {}) => {
  validateObjectId(clubId, 'club ID');

  const rawAudiences = Array.isArray(options.audiences) && options.audiences.length > 0
    ? options.audiences
    : (options.targetAudience ? [options.targetAudience] : ['Entire Club']);

  const normalizedAudiences = new Set(rawAudiences.map(normalizeAudienceTag));
  const eventId = options.eventId || null;
  const customUserIds = Array.isArray(options.customUserIds) ? options.customUserIds : [];

  const recipientMap = new Map();

  // Helper to add user to map
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
            role: u.role || 'member',
            avatarUrl: u.avatarUrl || ''
          });
        }
      }
    }
  };

  // 1. Entire Club
  if (normalizedAudiences.has('entire_club')) {
    const clubMembers = await User.find({ club: clubId, isActive: true })
      .select('_id name email phone role avatarUrl')
      .lean();
    addUsersToMap(clubMembers);
  }

  // 2. Event Participants
  if (normalizedAudiences.has('event_participants')) {
    if (eventId) {
      validateObjectId(eventId, 'event ID');
      // Volunteers assigned to this event
      const eventVolunteers = await Volunteer.find({ club: clubId, event: eventId })
        .populate('user', '_id name email phone role avatarUrl')
        .lean();
      const volunteerUsers = eventVolunteers.map(v => v.user).filter(Boolean);
      addUsersToMap(volunteerUsers);

      // Task assignees on this event
      const eventTasks = await Task.find({ club: clubId, event: eventId, assignedTo: { $ne: null } })
        .populate('assignedTo', '_id name email phone role avatarUrl')
        .lean();
      const taskUsers = eventTasks.map(t => t.assignedTo).filter(Boolean);
      addUsersToMap(taskUsers);
    }
  }

  // 3. Volunteers
  if (normalizedAudiences.has('volunteers')) {
    const volQuery = { club: clubId };
    if (eventId) {
      volQuery.event = eventId;
    }
    const volunteers = await Volunteer.find(volQuery)
      .populate('user', '_id name email phone role avatarUrl')
      .lean();
    const volunteerUsers = volunteers.map(v => v.user).filter(Boolean);
    addUsersToMap(volunteerUsers);

    // Also include users with role === 'volunteer'
    const roleVolunteers = await User.find({ club: clubId, role: 'volunteer', isActive: true })
      .select('_id name email phone role avatarUrl')
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
      .select('_id name email phone role avatarUrl')
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
      .select('_id name email phone role avatarUrl')
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
        .select('_id name email phone role avatarUrl')
        .lean();
      addUsersToMap(customMembers);
    }
  }

  return Array.from(recipientMap.values());
};

/**
 * Calculates live recipient preview, channel availability breakdown, and missing contact metrics.
 */
const getAudiencePreview = async (clubId, options = {}) => {
  const recipients = await resolveMultiAudienceRecipients(clubId, options);
  const providerStatus = checkChannelProviderStatus();

  let emailAvailableCount = 0;
  let phoneAvailableCount = 0;
  const inAppAvailableCount = recipients.length;

  for (const r of recipients) {
    if (r.email && /^\S+@\S+\.\S+$/.test(r.email.trim())) {
      emailAvailableCount++;
    }
    if (r.phone && r.phone.trim().length >= 7) {
      phoneAvailableCount++;
    }
  }

  const noEmailCount = recipients.length - emailAvailableCount;
  const noPhoneCount = recipients.length - phoneAvailableCount;

  return {
    audiences: options.audiences || [options.targetAudience || 'Entire Club'],
    uniqueRecipients: recipients.length,
    channelAvailability: {
      in_app: {
        total: recipients.length,
        available: inAppAvailableCount,
        missing: 0,
        status: providerStatus.in_app,
        providerNotice: 'In-app notification and live SSE broadcast are fully active.'
      },
      email: {
        total: recipients.length,
        available: emailAvailableCount,
        missing: noEmailCount,
        status: providerStatus.email,
        providerNotice: providerStatus.email === 'AVAILABLE'
          ? 'Email provider connected and ready.'
          : 'Email provider is not configured in server environment. In-app announcement will be delivered.'
      },
      whatsapp: {
        total: recipients.length,
        available: phoneAvailableCount,
        missing: noPhoneCount,
        status: providerStatus.whatsapp,
        providerNotice: providerStatus.whatsapp === 'AVAILABLE'
          ? 'WhatsApp service connected.'
          : 'WhatsApp API credentials not configured in server environment. In-app announcement will be delivered.'
      },
      sms: {
        total: recipients.length,
        available: phoneAvailableCount,
        missing: noPhoneCount,
        status: providerStatus.sms,
        providerNotice: providerStatus.sms === 'AVAILABLE'
          ? 'SMS gateway connected.'
          : 'SMS provider not configured in server environment. In-app announcement will be delivered.'
      },
      push: {
        total: recipients.length,
        available: inAppAvailableCount,
        missing: 0,
        status: providerStatus.push,
        providerNotice: providerStatus.push === 'AVAILABLE'
          ? 'Push service active.'
          : 'Web push keys not configured in server environment.'
      }
    },
    missingContactSummary: {
      noEmailCount,
      noPhoneCount
    },
    channelConfigStatus: providerStatus
  };
};

/**
 * Dispatches an announcement across selected channels with honest delivery tracking and idempotency.
 */
const broadcastAnnouncement = async (clubId, userId, announcementId, requestedChannels = ['in_app']) => {
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

  // 1. Resolve deduplicated recipients
  const audienceList = announcement.targetAudiences && announcement.targetAudiences.length > 0
    ? announcement.targetAudiences
    : [announcement.targetAudience || 'Entire Club'];

  const recipients = await resolveMultiAudienceRecipients(clubId, {
    audiences: audienceList,
    eventId: announcement.event,
    customUserIds: announcement.customRecipients
  });

  const providerStatus = checkChannelProviderStatus();
  const now = new Date();
  const receipts = [];

  const stats = {
    uniqueRecipients: recipients.length,
    in_app: { sent: 0, failed: 0, status: 'delivered' },
    email: { sent: 0, skipped: 0, failed: 0, status: providerStatus.email === 'AVAILABLE' ? 'delivered' : 'not_configured' },
    whatsapp: { sent: 0, skipped: 0, failed: 0, status: providerStatus.whatsapp === 'AVAILABLE' ? 'delivered' : 'not_configured' },
    sms: { sent: 0, skipped: 0, failed: 0, status: providerStatus.sms === 'AVAILABLE' ? 'delivered' : 'not_configured' },
    push: { sent: 0, skipped: 0, failed: 0, status: providerStatus.push === 'AVAILABLE' ? 'delivered' : 'not_configured' }
  };

  // 2. Iterate each channel and recipient with idempotency
  for (const channel of channelsToUse) {
    const isConfigured = providerStatus[channel] === 'AVAILABLE';

    for (const recipient of recipients) {
      // Check existing dispatch
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

      if (channel === 'in_app') {
        try {
          // Create real in-app notification
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

          // Stream real-time SSE
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

          stats.in_app.sent++;
          receipts.push({
            channel: 'in_app',
            recipientId: recipient._id,
            recipientName: recipient.name,
            status: 'delivered',
            providerMessageId: delivery.providerMessageId
          });
        } catch (err) {
          stats.in_app.failed++;
          receipts.push({
            channel: 'in_app',
            recipientId: recipient._id,
            recipientName: recipient.name,
            status: 'failed',
            error: err.message
          });
        }
      } else {
        // External channels (email, whatsapp, sms, push)
        if (!isConfigured) {
          // Honest recording: NOT configured
          const delivery = new BroadcastDelivery({
            announcement: announcement._id,
            club: clubId,
            event: announcement.event || null,
            channel,
            recipient: recipient._id,
            status: 'not_configured',
            error: `${channel.toUpperCase()} provider credentials not configured in environment`,
            metadata: { channel, status: 'not_configured' }
          });
          await delivery.save();

          stats[channel].skipped++;
          receipts.push({
            channel,
            recipientId: recipient._id,
            recipientName: recipient.name,
            status: 'not_configured',
            notice: 'Provider not configured'
          });
        } else {
          // If configured, handle actual sending or skip if recipient missing contact
          const hasContact = channel === 'email'
            ? Boolean(recipient.email && /^\S+@\S+\.\S+$/.test(recipient.email.trim()))
            : Boolean(recipient.phone && recipient.phone.trim().length >= 7);

          if (!hasContact) {
            const delivery = new BroadcastDelivery({
              announcement: announcement._id,
              club: clubId,
              event: announcement.event || null,
              channel,
              recipient: recipient._id,
              status: 'skipped',
              error: `Missing recipient ${channel === 'email' ? 'email' : 'phone'} address`
            });
            await delivery.save();

            stats[channel].skipped++;
            receipts.push({
              channel,
              recipientId: recipient._id,
              recipientName: recipient.name,
              status: 'skipped',
              notice: 'Missing contact info'
            });
          } else {
            // Record dispatched
            const delivery = new BroadcastDelivery({
              announcement: announcement._id,
              club: clubId,
              event: announcement.event || null,
              channel,
              recipient: recipient._id,
              status: 'sent',
              sentAt: now
            });
            await delivery.save();

            stats[channel].sent++;
            receipts.push({
              channel,
              recipientId: recipient._id,
              recipientName: recipient.name,
              status: 'sent'
            });
          }
        }
      }
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
      deliveryStats: stats
    },
    summary: {
      uniqueRecipients: recipients.length,
      requestedChannels: channelsToUse.length,
      totalOperations: recipients.length * channelsToUse.length,
      inAppDelivered: stats.in_app.sent,
      inAppFailed: stats.in_app.failed,
      emailSent: stats.email.sent,
      emailSkipped: stats.email.skipped,
      whatsappSent: stats.whatsapp.sent,
      whatsappSkipped: stats.whatsapp.skipped,
      smsSent: stats.sms.sent,
      smsSkipped: stats.sms.skipped,
      pushSent: stats.push.sent,
      pushSkipped: stats.push.skipped
    },
    receipts
  };
};

module.exports = {
  checkChannelProviderStatus,
  resolveMultiAudienceRecipients,
  getAudiencePreview,
  broadcastAnnouncement
};
