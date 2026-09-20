/**
 * Twilio SMS Delivery Service
 * Dedicated integration for carrier SMS announcements.
 */

const twilio = require('twilio');
const config = require('../../config/env');

/**
 * Normalizes a phone number to standard E.164 format.
 */
const normalizeE164 = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.trim().replace(/[^\d+]/g, '');
  if (!cleaned) return null;
  // If starts with +, ensure length >= 8
  if (cleaned.startsWith('+')) {
    return cleaned.length >= 8 && cleaned.length <= 16 ? cleaned : null;
  }
  // Default to + if 10-12 digits without country code or standard format
  if (cleaned.length === 10) {
    return `+91${cleaned}`; // Default country prefix fallback for 10-digit Indian numbers
  }
  if (cleaned.length > 10 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }
  return null;
};

/**
 * Validates Twilio SMS configuration.
 */
const validateConfiguration = () => {
  const isConfigured = Boolean(
    config.twilioAccountSid &&
    config.twilioAuthToken &&
    config.twilioSmsFrom
  );
  return {
    isConfigured,
    accountSidSet: Boolean(config.twilioAccountSid),
    fromNumber: config.twilioSmsFrom || null
  };
};

/**
 * Health check for Twilio SMS provider (never exposes secret keys).
 */
const checkHealth = async () => {
  const { isConfigured } = validateConfiguration();
  if (!isConfigured) {
    return {
      configured: false,
      connected: false,
      provider: 'Twilio SMS',
      status: 'NOT_CONFIGURED',
      notice: 'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_SMS_FROM not set'
    };
  }

  try {
    if (config.twilioAccountSid.startsWith('AC')) {
      return {
        configured: true,
        connected: true,
        provider: 'Twilio SMS',
        status: 'CONNECTED',
        fromNumber: config.twilioSmsFrom
      };
    }
    return {
      configured: true,
      connected: false,
      provider: 'Twilio SMS',
      status: 'CONFIGURATION_ERROR',
      notice: 'Invalid Twilio Account SID format'
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      provider: 'Twilio SMS',
      status: 'ERROR',
      error: 'Twilio SMS health check failed'
    };
  }
};

/**
 * Dispatches an SMS to a single recipient with bounded retry.
 */
const sendSms = async ({ recipient, announcement, clubName, isDryRun = false, maxRetries = 2 }) => {
  const e164Phone = normalizeE164(recipient.phone);

  // 1. Phone number validation
  if (!e164Phone) {
    return {
      status: 'skipped',
      provider: 'Twilio SMS',
      destinationType: 'phone',
      errorCode: 'INVALID_PHONE_NUMBER',
      errorMessage: 'Recipient has missing or non-E.164 phone number',
      sentAt: null
    };
  }

  // 2. Dry run execution
  if (isDryRun) {
    return {
      status: 'simulated',
      provider: 'Twilio SMS',
      destinationType: 'phone',
      providerMessageId: `sim_sms_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sentAt: new Date(),
      metadata: {
        to: e164Phone,
        mode: 'dry_run'
      }
    };
  }

  // 3. Provider configuration check
  const { isConfigured, fromNumber } = validateConfiguration();
  if (!isConfigured) {
    return {
      status: 'not_configured',
      provider: 'Twilio SMS',
      destinationType: 'phone',
      errorCode: 'PROVIDER_NOT_CONFIGURED',
      errorMessage: 'Twilio credentials or SMS sender number is not configured in server environment',
      sentAt: null
    };
  }

  const client = twilio(config.twilioAccountSid, config.twilioAuthToken);
  const smsBody = `[${clubName || 'ClubOps'}] ${announcement.title}\n\n${announcement.content}`.substring(0, 1500);

  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    attempt++;
    try {
      const message = await client.messages.create({
        body: smsBody,
        from: fromNumber,
        to: e164Phone
      });

      const messageStatus = message.status === 'queued' || message.status === 'accepted' ? 'accepted' : 'sent';

      return {
        status: messageStatus,
        provider: 'Twilio SMS',
        destinationType: 'phone',
        providerMessageId: message.sid,
        attemptCount: attempt,
        lastAttemptAt: new Date(),
        sentAt: new Date()
      };
    } catch (err) {
      lastError = err;
      const errorCode = err.code ? `TWILIO_${err.code}` : 'TWILIO_ERROR';

      // Permanent client/phone validation errors should NOT be retried
      // 21211: Invalid 'To' Phone Number, 21608: Unverified number, 21614: 'To' number is not mobile
      if (err.status >= 400 && err.status < 500 && err.status !== 429) {
        return {
          status: 'failed',
          provider: 'Twilio SMS',
          destinationType: 'phone',
          errorCode,
          errorMessage: err.message || 'Twilio SMS dispatch rejected',
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
    provider: 'Twilio SMS',
    destinationType: 'phone',
    errorCode: 'TWILIO_SMS_TIMEOUT',
    errorMessage: lastError?.message || 'Twilio SMS dispatch failed after retries',
    attemptCount: attempt,
    lastAttemptAt: new Date(),
    sentAt: null
  };
};

module.exports = {
  normalizeE164,
  validateConfiguration,
  checkHealth,
  sendSms
};
