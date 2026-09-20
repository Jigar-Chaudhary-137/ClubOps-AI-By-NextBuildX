/**
 * Broadcast Service Bridge
 * Provides audience resolution, recipient preview, and announcement delivery dispatch.
 * Delegates to announcementDeliveryService for multi-channel provider execution,
 * dry-run evaluation, and database-level idempotency.
 */

const announcementDeliveryService = require('./announcements/announcementDeliveryService');

module.exports = {
  checkChannelProviderStatus: announcementDeliveryService.getProviderStatus,
  getProviderStatus: announcementDeliveryService.getProviderStatus,
  resolveMultiAudienceRecipients: announcementDeliveryService.resolveAudienceRecipients,
  getAudiencePreview: announcementDeliveryService.getAudiencePreview,
  broadcastAnnouncement: announcementDeliveryService.broadcastAnnouncement,
  sendControlledTest: announcementDeliveryService.sendControlledTest
};
