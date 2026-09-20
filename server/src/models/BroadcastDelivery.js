const mongoose = require('mongoose');

const broadcastDeliverySchema = new mongoose.Schema(
  {
    announcement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Announcement',
      required: [true, 'Associated announcement is required'],
      index: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Associated club is required'],
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
      index: true
    },
    channel: {
      type: String,
      enum: {
        values: ['in_app', 'email', 'whatsapp', 'sms', 'push'],
        message: '{VALUE} is not a valid delivery channel'
      },
      required: [true, 'Delivery channel is required'],
      index: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user is required'],
      index: true
    },
    phone: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['queued', 'sent', 'delivered', 'read', 'failed', 'pending', 'accepted', 'skipped', 'not_configured', 'simulated'],
        message: '{VALUE} is not a valid broadcast delivery status'
      },
      default: 'queued',
      index: true
    },
    provider: {
      type: String,
      default: null
    },
    destinationType: {
      type: String,
      default: null
    },
    providerMessageId: {
      type: String,
      default: null,
      index: true
    },
    errorCode: {
      type: String,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    },
    failureReason: {
      type: String,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    attemptCount: {
      type: Number,
      default: 1
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    queuedAt: {
      type: Date,
      default: Date.now
    },
    sentAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    readAt: {
      type: Date,
      default: null
    },
    failedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index for broadcast idempotency (preventing duplicate dispatch per channel per recipient)
broadcastDeliverySchema.index(
  { announcement: 1, channel: 1, recipient: 1 },
  { unique: true }
);

broadcastDeliverySchema.index({ club: 1, announcement: 1 });
broadcastDeliverySchema.index({ club: 1, providerMessageId: 1 });
broadcastDeliverySchema.index({ club: 1, status: 1 });
broadcastDeliverySchema.index({ club: 1, createdAt: -1 });
broadcastDeliverySchema.index({ event: 1, createdAt: -1 });

const BroadcastDelivery =
  mongoose.models.BroadcastDelivery ||
  mongoose.model('BroadcastDelivery', broadcastDeliverySchema);

module.exports = BroadcastDelivery;
