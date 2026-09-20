/**
 * Twilio WhatsApp Adapter Provider (Optional)
 * Handles safe dynamic loading if twilio package is present.
 */

const config = require('../../config/env');

const getTwilioClient = () => {
  try {
    const twilio = require('twilio');
    if (config.twilioAccountSid && config.twilioAuthToken) {
      return twilio(config.twilioAccountSid, config.twilioAuthToken);
    }
    return null;
  } catch {
    return null;
  }
};

const sendMessage = async ({ toPhone, messageBody, metadata = {} }) => {
  if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioWhatsappFrom) {
    return {
      success: false,
      mode: 'twilio',
      provider: 'twilio',
      status: 'failed',
      errorCode: 'PROVIDER_NOT_CONFIGURED',
      errorMessage: 'Twilio WhatsApp credentials are not configured in environment',
      recipient: toPhone
    };
  }

  const client = getTwilioClient();
  if (!client) {
    return {
      success: false,
      mode: 'twilio',
      provider: 'twilio',
      status: 'failed',
      errorCode: 'TWILIO_NOT_AVAILABLE',
      errorMessage: 'Twilio SDK is not installed or failed to initialize',
      recipient: toPhone
    };
  }

  const fromNumber = config.twilioWhatsappFrom.startsWith('whatsapp:')
    ? config.twilioWhatsappFrom
    : `whatsapp:${config.twilioWhatsappFrom}`;
  const toNumber = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`;

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: toNumber
    });

    return {
      success: true,
      mode: 'twilio',
      provider: 'twilio',
      providerMessageId: message.sid,
      status: message.status === 'queued' || message.status === 'accepted' ? 'queued' : 'sent',
      recipient: toPhone
    };
  } catch (err) {
    return {
      success: false,
      mode: 'twilio',
      provider: 'twilio',
      status: 'failed',
      errorCode: err.code ? `TWILIO_${err.code}` : 'TWILIO_ERROR',
      errorMessage: err.message,
      recipient: toPhone
    };
  }
};

const checkHealth = async () => {
  const isConfigured = Boolean(config.twilioAccountSid && config.twilioAuthToken && config.twilioWhatsappFrom);
  return {
    configured: isConfigured,
    connected: isConfigured,
    provider: 'Twilio WhatsApp',
    status: isConfigured ? 'READY' : 'NOT_CONFIGURED'
  };
};

module.exports = {
  sendMessage,
  checkHealth
};
