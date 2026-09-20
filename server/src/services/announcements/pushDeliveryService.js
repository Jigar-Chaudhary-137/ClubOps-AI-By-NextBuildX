/**
 * Firebase Cloud Messaging (FCM) Push Delivery Service
 * Dedicated integration for web and mobile push notifications using Firebase Admin SDK.
 */

const admin = require('firebase-admin');
const config = require('../../config/env');
const User = require('../../models/User');

let firebaseApp = null;

/**
 * Validates Firebase Admin configuration.
 */
const validateConfiguration = () => {
  const isConfigured = Boolean(
    config.firebaseProjectId &&
    config.firebaseClientEmail &&
    config.firebasePrivateKey
  );

  return {
    isConfigured,
    projectId: config.firebaseProjectId || null,
    clientEmail: config.firebaseClientEmail || null
  };
};

/**
 * Initializes Firebase Admin SDK singleton.
 */
const getFirebaseAdmin = () => {
  const { isConfigured } = validateConfiguration();
  if (!isConfigured) return null;

  if (!firebaseApp) {
    try {
      if (admin.apps.length > 0) {
        firebaseApp = admin.app();
      } else {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebaseProjectId,
            clientEmail: config.firebaseClientEmail,
            privateKey: config.firebasePrivateKey
          })
        });
      }
    } catch (err) {
      console.error('[Firebase] Failed to initialize Firebase Admin SDK:', err.message);
      return null;
    }
  }
  return firebaseApp;
};

/**
 * Health check for Firebase Cloud Messaging provider (never exposes secret keys).
 */
const checkHealth = async () => {
  const { isConfigured } = validateConfiguration();
  if (!isConfigured) {
    return {
      configured: false,
      connected: false,
      provider: 'Firebase Cloud Messaging',
      status: 'NOT_CONFIGURED',
      notice: 'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY not set'
    };
  }

  try {
    const app = getFirebaseAdmin();
    if (app) {
      return {
        configured: true,
        connected: true,
        provider: 'Firebase Cloud Messaging',
        status: 'CONNECTED',
        projectId: config.firebaseProjectId
      };
    }
    return {
      configured: true,
      connected: false,
      provider: 'Firebase Cloud Messaging',
      status: 'CONFIGURATION_ERROR',
      notice: 'Firebase Admin initialization failed'
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      provider: 'Firebase Cloud Messaging',
      status: 'ERROR',
      error: 'Firebase health check failed'
    };
  }
};

/**
 * Dispatches FCM push notification to a recipient's registered device tokens.
 */
const sendPush = async ({ recipient, announcement, clubName, isDryRun = false }) => {
  const tokens = Array.isArray(recipient.deviceTokens)
    ? recipient.deviceTokens.map(d => typeof d === 'string' ? d : d.token).filter(Boolean)
    : [];

  // 1. Device tokens check
  if (tokens.length === 0) {
    return {
      status: 'skipped',
      provider: 'Firebase Cloud Messaging',
      destinationType: 'device_token',
      errorCode: 'NO_DEVICE_TOKENS',
      errorMessage: 'Recipient has no registered FCM device tokens',
      sentAt: null
    };
  }

  // 2. Dry run execution
  if (isDryRun) {
    return {
      status: 'simulated',
      provider: 'Firebase Cloud Messaging',
      destinationType: 'device_token',
      providerMessageId: `sim_fcm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sentAt: new Date(),
      metadata: {
        tokenCount: tokens.length,
        mode: 'dry_run'
      }
    };
  }

  // 3. Provider configuration check
  const { isConfigured } = validateConfiguration();
  const app = getFirebaseAdmin();
  if (!isConfigured || !app) {
    return {
      status: 'not_configured',
      provider: 'Firebase Cloud Messaging',
      destinationType: 'device_token',
      errorCode: 'PROVIDER_NOT_CONFIGURED',
      errorMessage: 'Firebase credentials are not configured in server environment',
      sentAt: null
    };
  }

  const payload = {
    tokens,
    notification: {
      title: `[${clubName || 'ClubOps'}] ${announcement.title}`,
      body: announcement.content.substring(0, 200)
    },
    data: {
      announcementId: announcement._id ? announcement._id.toString() : '',
      clubId: announcement.club ? announcement.club.toString() : '',
      priority: announcement.priority || 'normal',
      click_action: '/announcements'
    }
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(payload);

    // Clean up expired or invalid device tokens
    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errCode = resp.error?.code;
        if (
          errCode === 'messaging/invalid-registration-token' ||
          errCode === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0 && recipient._id) {
      await User.updateOne(
        { _id: recipient._id },
        { $pull: { deviceTokens: { token: { $in: invalidTokens } } } }
      ).catch(() => {});
    }

    if (response.successCount > 0) {
      return {
        status: 'sent',
        provider: 'Firebase Cloud Messaging',
        destinationType: 'device_token',
        providerMessageId: `fcm_batch_${Date.now()}`,
        sentAt: new Date(),
        metadata: {
          successCount: response.successCount,
          failureCount: response.failureCount
        }
      };
    }

    return {
      status: 'failed',
      provider: 'Firebase Cloud Messaging',
      destinationType: 'device_token',
      errorCode: 'FCM_ALL_TOKENS_REJECTED',
      errorMessage: response.responses[0]?.error?.message || 'All device tokens failed dispatch',
      sentAt: null
    };
  } catch (err) {
    return {
      status: 'failed',
      provider: 'Firebase Cloud Messaging',
      destinationType: 'device_token',
      errorCode: 'FCM_DISPATCH_ERROR',
      errorMessage: err.message || 'Firebase push dispatch failed',
      sentAt: null
    };
  }
};

module.exports = {
  validateConfiguration,
  checkHealth,
  sendPush
};
