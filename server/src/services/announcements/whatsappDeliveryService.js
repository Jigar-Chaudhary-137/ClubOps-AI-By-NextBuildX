/**
 * Unified WhatsApp Delivery Adapter
 * Bridges announcementDeliveryService to the modern WhatsApp Service (Meta Cloud API + Simulator).
 */

const whatsappService = require('../whatsapp.service');
const simulatorProvider = require('../whatsapp/simulatorProvider');

const formatWhatsappAddress = (rawPhone) => {
  const normalized = whatsappService.normalizePhoneNumber(rawPhone);
  if (!normalized) return null;
  return `whatsapp:${normalized}`;
};

const checkHealth = async () => {
  const { name, adapter } = whatsappService.getActiveProvider();
  return adapter.checkHealth();
};

const sendWhatsapp = async ({ recipient, announcement, clubName, isDryRun = false, maxRetries = 2 }) => {
  const rawPhone = recipient.phone;
  const normalizedPhone = whatsappService.normalizePhoneNumber(rawPhone);

  if (!normalizedPhone) {
    return {
      status: 'failed',
      provider: 'whatsapp',
      destinationType: 'phone',
      errorCode: 'INVALID_PHONE_NUMBER',
      errorMessage: 'Recipient has no phone number on profile',
      failureReason: 'Recipient has no phone number on profile',
      sentAt: null
    };
  }

  if (isDryRun) {
    return {
      status: 'simulated',
      provider: 'whatsapp-simulator',
      destinationType: 'phone',
      providerMessageId: `sim_wa_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sentAt: new Date(),
      metadata: {
        to: normalizedPhone,
        mode: 'dry_run'
      }
    };
  }

  const formattedBody = whatsappService.formatWhatsAppAnnouncement(
    announcement,
    clubName,
    announcement.event?.title || null
  );

  const result = await whatsappService.sendWhatsAppMessage({
    toPhone: normalizedPhone,
    messageBody: formattedBody,
    metadata: {
      announcementId: announcement._id?.toString(),
      recipientId: recipient._id?.toString()
    }
  });

  if (result.success) {
    return {
      status: result.status || 'queued',
      provider: result.provider || 'whatsapp',
      destinationType: 'phone',
      providerMessageId: result.providerMessageId,
      sentAt: result.status === 'sent' ? new Date() : null,
      queuedAt: new Date(),
      metadata: result.metadata || {}
    };
  }

  return {
    status: 'failed',
    provider: result.provider || 'whatsapp',
    destinationType: 'phone',
    errorCode: result.errorCode || 'WHATSAPP_DISPATCH_FAILED',
    errorMessage: result.errorMessage || 'Failed to dispatch WhatsApp message',
    failureReason: result.errorMessage || 'Failed to dispatch WhatsApp message',
    sentAt: null
  };
};

module.exports = {
  formatWhatsappAddress,
  checkHealth,
  sendWhatsapp
};
