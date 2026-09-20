/**
 * Meta WhatsApp Cloud API Provider
 * Dispatches messages via the official Meta Graph API v19.0 / v20.0 endpoints.
 */

const https = require('https');
const config = require('../../config/env');
const { AppError } = require('../../utils/errors');

/**
 * Sends a text message via Meta WhatsApp Cloud API.
 * 
 * @param {Object} params
 * @param {string} params.toPhone - Normalized E.164 phone number without leading '+'
 * @param {string} params.messageBody - Formatted text message
 * @param {Object} [params.metadata]
 * @returns {Promise<{ success: boolean, providerMessageId: string, status: string, provider: string }>}
 */
const sendMessage = async ({ toPhone, messageBody, metadata = {} }) => {
  const token = config.whatsappApiToken;
  const phoneId = config.whatsappPhoneNumberId;

  if (!token || !phoneId) {
    throw new AppError('WhatsApp Cloud API is not configured (missing WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID)', 500);
  }

  // Remove any '+' prefix for Meta Cloud API
  const cleanRecipient = toPhone.replace(/^\+/, '');

  const payload = JSON.stringify({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanRecipient,
    type: 'text',
    text: {
      preview_url: false,
      body: messageBody
    }
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v19.0/${phoneId}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const responseJson = JSON.parse(data);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            const messageId = responseJson.messages?.[0]?.id || `wamid.${Date.now()}`;
            return resolve({
              success: true,
              mode: 'cloud_api',
              provider: 'cloud_api',
              providerMessageId: messageId,
              status: 'sent',
              recipient: `+${cleanRecipient}`
            });
          }

          const errorMessage = responseJson.error?.message || `WhatsApp Cloud API error (${res.statusCode})`;
          const errorCode = responseJson.error?.code ? `META_${responseJson.error.code}` : 'META_API_ERROR';

          resolve({
            success: false,
            mode: 'cloud_api',
            provider: 'cloud_api',
            status: 'failed',
            errorCode,
            errorMessage,
            recipient: `+${cleanRecipient}`
          });
        } catch (parseErr) {
          resolve({
            success: false,
            mode: 'cloud_api',
            provider: 'cloud_api',
            status: 'failed',
            errorCode: 'MALFORMED_RESPONSE',
            errorMessage: 'Failed to parse Meta Cloud API response',
            recipient: `+${cleanRecipient}`
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        mode: 'cloud_api',
        provider: 'cloud_api',
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: err.message || 'Network error communicating with WhatsApp Cloud API',
        recipient: `+${cleanRecipient}`
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        mode: 'cloud_api',
        provider: 'cloud_api',
        status: 'failed',
        errorCode: 'TIMEOUT',
        errorMessage: 'WhatsApp Cloud API request timed out after 10000ms',
        recipient: `+${cleanRecipient}`
      });
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Checks connectivity and configuration status.
 */
const checkHealth = async () => {
  const token = config.whatsappApiToken;
  const phoneId = config.whatsappPhoneNumberId;
  const isConfigured = Boolean(token && phoneId);

  return {
    configured: isConfigured,
    connected: isConfigured,
    provider: 'Meta WhatsApp Cloud API',
    phoneId: phoneId ? `${phoneId.substring(0, 4)}****` : null,
    status: isConfigured ? 'READY' : 'NOT_CONFIGURED'
  };
};

module.exports = {
  sendMessage,
  checkHealth
};
