/**
 * Twilio SendGrid Email Delivery Service
 * Dedicated integration for transactional club announcement emails.
 */

const config = require('../../config/env');

const getSgMail = () => {
  try {
    return require('@sendgrid/mail');
  } catch {
    return null;
  }
};

/**
 * Validates SendGrid configuration.
 */
const validateConfiguration = () => {
  const isConfigured = Boolean(config.sendgridApiKey && config.sendgridFromEmail);
  return {
    isConfigured,
    apiKeySet: Boolean(config.sendgridApiKey),
    fromEmail: config.sendgridFromEmail || null,
    fromName: config.sendgridFromName || 'ClubOps AI'
  };
};

/**
 * Health check for SendGrid provider (never exposes secret keys).
 */
const checkHealth = async () => {
  const { isConfigured } = validateConfiguration();
  if (!isConfigured) {
    return {
      configured: false,
      connected: false,
      provider: 'SendGrid',
      status: 'NOT_CONFIGURED',
      notice: 'SENDGRID_API_KEY and SENDGRID_FROM_EMAIL not set'
    };
  }

  // Basic configuration verification without exposing secret
  try {
    if (config.sendgridApiKey && config.sendgridApiKey.startsWith('SG.')) {
      return {
        configured: true,
        connected: true,
        provider: 'SendGrid',
        status: 'CONNECTED',
        fromEmail: config.sendgridFromEmail
      };
    }
    return {
      configured: true,
      connected: false,
      provider: 'SendGrid',
      status: 'CONFIGURATION_ERROR',
      notice: 'Invalid SendGrid API key format'
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      provider: 'SendGrid',
      status: 'ERROR',
      error: 'SendGrid health check failed'
    };
  }
};

/**
 * Constructs HTML email template for announcement.
 */
const generateEmailHtml = (announcement, recipientName, clubName = 'ClubOps') => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1020; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #111827; border: 1px solid #263247; border-radius: 16px; overflow: hidden; }
    .header { background-color: #151d2e; padding: 20px 24px; border-bottom: 1px solid #263247; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 12px; margin-bottom: 0; }
    .content { padding: 24px; font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; }
    .footer { background-color: #0d1322; padding: 16px 24px; border-top: 1px solid #263247; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">${clubName} Announcement</span>
      <h2 class="title">${announcement.title}</h2>
    </div>
    <div class="content">
Hello ${recipientName || 'Member'},

${announcement.content}
    </div>
    <div class="footer">
      Delivered via ClubOps AI Broadcast. To manage notification preferences, visit your club portal.
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Dispatches email to a single recipient with bounded exponential retry.
 */
const sendEmail = async ({ recipient, announcement, clubName, isDryRun = false, maxRetries = 2 }) => {
  const emailAddress = (recipient.email || '').trim().toLowerCase();

  // 1. Email format validation
  if (!emailAddress || !/^\S+@\S+\.\S+$/.test(emailAddress)) {
    return {
      status: 'skipped',
      provider: 'SendGrid',
      destinationType: 'email',
      errorCode: 'INVALID_EMAIL',
      errorMessage: 'Recipient has missing or invalid email format',
      sentAt: null
    };
  }

  // 2. Dry run execution
  if (isDryRun) {
    return {
      status: 'simulated',
      provider: 'SendGrid',
      destinationType: 'email',
      providerMessageId: `sim_sg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sentAt: new Date(),
      metadata: {
        to: emailAddress,
        subject: announcement.title,
        mode: 'dry_run'
      }
    };
  }

  // 3. Provider configuration check
  const { isConfigured, fromEmail, fromName } = validateConfiguration();
  if (!isConfigured) {
    return {
      status: 'not_configured',
      provider: 'SendGrid',
      destinationType: 'email',
      errorCode: 'PROVIDER_NOT_CONFIGURED',
      errorMessage: 'SendGrid API key or sender email is not configured in server environment',
      sentAt: null
    };
  }

  const sgMail = getSgMail();
  if (!sgMail) {
    return {
      status: 'failed',
      provider: 'SendGrid',
      destinationType: 'email',
      errorCode: 'SENDGRID_NOT_INSTALLED',
      errorMessage: '@sendgrid/mail package is not installed',
      sentAt: null
    };
  }

  sgMail.setApiKey(config.sendgridApiKey);

  const msg = {
    to: emailAddress,
    from: {
      email: fromEmail,
      name: fromName
    },
    subject: `[${clubName || 'ClubOps'}] ${announcement.title}`,
    text: `Announcement: ${announcement.title}\n\n${announcement.content}\n\n---\nDelivered via ClubOps AI`,
    html: generateEmailHtml(announcement, recipient.name, clubName)
  };

  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    attempt++;
    try {
      const [response] = await sgMail.send(msg);
      const messageId = response?.headers?.['x-message-id'] || `sg_${Date.now()}`;
      return {
        status: response.statusCode === 202 ? 'accepted' : 'sent',
        provider: 'SendGrid',
        destinationType: 'email',
        providerMessageId: messageId,
        attemptCount: attempt,
        lastAttemptAt: new Date(),
        sentAt: new Date()
      };
    } catch (err) {
      lastError = err;
      const statusCode = err.code || err.response?.status || err.response?.statusCode;

      // Permanent 4xx client/auth errors should NOT be retried
      if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
        return {
          status: 'failed',
          provider: 'SendGrid',
          destinationType: 'email',
          errorCode: `SENDGRID_${statusCode}`,
          errorMessage: err.response?.body?.errors?.[0]?.message || err.message || 'SendGrid client rejection',
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
    provider: 'SendGrid',
    destinationType: 'email',
    errorCode: 'SENDGRID_DISPATCH_TIMEOUT',
    errorMessage: lastError?.message || 'SendGrid dispatch failed after retries',
    attemptCount: attempt,
    lastAttemptAt: new Date(),
    sentAt: null
  };
};

module.exports = {
  validateConfiguration,
  checkHealth,
  sendEmail
};
