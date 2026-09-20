/**
 * Twilio WhatsApp Delivery Service
 * Dedicated integration for WhatsApp Business & Messaging Sandbox announcements.
 */

const twilio = require('twilio');
const config = require('../../config/env');
const { normalizeE164 } = require('./smsDeliveryService');

/**
 * Formats a phone number for the Twilio WhatsApp API (whatsapp:<E.164>).
 */
const formatWhatsappAddress = (rawPhone) => {
  const e164 = normalizeE164(rawPhone);
  if (!e164) return null;
  return `whatsapp:${e164}`;
};

/**
 * Validates Twilio WhatsApp configuration.
 */
const validateConfiguration = () => {
  const isConfigured = Boolean(
    config.twilioAccountSid &&
    config.twilioAuthToken &&
    config.twilioWhatsappFrom
  );

  const fromNumber = config.twilioWhatsappFrom
    ? (config.twilioWhatsappFrom.startsWith('whatsapp:') ? config.twilioWhatsappFrom : `whatsapp:${config.twilioWhatsappFrom}`)
    : null;

  return {
    isConfigured,
    accountSidSet: Boolean(config.twilioAccountSid),
    fromWhatsappAddress: fromNumber,
    isSandbox: Boolean(fromNumber && fromNumber.includes('+14155238886'))
  };
};

/**
 * Health check for Twilio WhatsApp provider (never exposes secret keys).
 */
const checkHealth = async () => {
  const { isConfigured, fromWhatsappAddress, isSandbox } = validateConfiguration();
  if (!isConfigured) {
    return {
      configured: false,
      connected: false,
      provider: 'Twilio WhatsApp',
      status: 'NOT_CONFIGURED',
      notice: 'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM not set'
    };
  }

  try {
    if (config.twilioAccountSid.startsWith('AC')) {
      return {
        configured: true,
        connected: true,
        provider: 'Twilio WhatsApp',
        status: 'CONNECTED',
        from: fromWhatsappAddress,
        isSandbox
      };
    }
    return {
      configured: true,
      connected: false,
      provider: 'Twilio WhatsApp',
      status: 'CONFIGURATION_ERROR',
      notice: 'Invalid Twilio Account SID format'
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      provider: 'Twilio WhatsApp',
      status: 'ERROR',
      error: 'Twilio WhatsApp health check failed'
    };
  }
};

/**
 * Dispatches a WhatsApp announcement with bounded exponential retry.
 */
const sendWhatsapp = async ({ recipient, announcement, clubName, isDryRun = false, maxRetries = 2 }) => {
  const toWhatsapp = formatWhatsappAddress(recipient.phone);

  // 1. WhatsApp destination validation
  if (!toWhatsapp) {
    return {
      status: 'skipped',
      provider: 'Twilio WhatsApp',
      destinationType: 'whatsapp',
      errorCode: 'INVALID_PHONE_NUMBER',
      errorMessage: 'Recipient has missing or non-E.164 phone number',
      sentAt: null
    };
  }

  // 2. Dry run execution
  if (isDryRun) {
    return {
      status: 'simulated',
      provider: 'Twilio WhatsApp',
      destinationType: 'whatsapp',
      providerMessageId: `sim_wa_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sentAt: new Date(),
      metadata: {
        to: toWhatsapp,
        mode: 'dry_run'
      }
    };
  }

  // 3. Provider configuration check
  const { isConfigured, fromWhatsappAddress } = validateConfiguration();
  if (!isConfigured) {
    return {
      status: 'not_configured',
      provider: 'Twilio WhatsApp',
      destinationType: 'whatsapp',
      errorCode: 'PROVIDER_NOT_CONFIGURED',
      errorMessage: 'Twilio credentials or WhatsApp sender address is not configured in server environment',
      sentAt: null
    };
  }

  const client = twilio(config.twilioAccountSid, config.twilioAuthToken);
  const whatsappBody = `📢 *[${clubName || 'ClubOps'}] ${announcement.title}*\n\n${announcement.content}\n\n_Delivered via ClubOps AI_`;

  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    attempt++;
    try {
      const message = await client.messages.create({
        body: whatsappBody,
        from: fromWhatsappAddress,
        to: toWhatsapp
      });

      const messageStatus = message.status === 'queued' || message.status === 'accepted' ? 'accepted' : 'sent';

      return {
        status: messageStatus,
        provider: 'Twilio WhatsApp',
        destinationType: 'whatsapp',
        providerMessageId: message.sid,
        attemptCount: attempt,
        lastAttemptAt: new Date(),
        sentAt: new Date()
      };
    } catch (err) {
      lastError = err;
      const errorCode = err.code ? `TWILIO_${err.code}` : 'TWILIO_WHATSAPP_ERROR';

      // Permanent 4xx / WhatsApp session / validation errors should not be retried
      // 63016: Outside 24-hr session window, 21211: Invalid number, 21608: Unjoined sandbox
      if (err.status >= 400 && err.status < 500 && err.status !== 429) {
        return {
          status: 'failed',
          provider: 'Twilio WhatsApp',
          destinationType: 'whatsapp',
          errorCode,
          errorMessage: err.message || 'Twilio WhatsApp dispatch rejected',
          attemptCount: attempt,
          lastAttemptAt: new Date(),
          sentAt: null
        };
      }

      // Transient error: wait before bounded retry
      if (attempt <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 200));
      }
    }
  }

  return {
    status: 'failed',
    provider: 'Twilio WhatsApp',
    destinationType: 'whatsapp',
    errorCode: 'TWILIO_WHATSAPP_TIMEOUT',
    errorMessage: lastError?.message || 'Twilio WhatsApp dispatch failed after retries',
    attemptCount: attempt,
    lastAttemptAt: new Date(),
    sentAt: null
  };
};

module.exports = {
  formatWhatsappAddress,
  validateConfiguration,
  checkHealth,
  sendWhatsapp
};
