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
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'sent', 'delivered', 'failed', 'skipped', 'not_configured', 'simulated', 'queued'],
        message: '{VALUE} is not a valid broadcast delivery status'
      },
      default: 'pending',
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
      default: null
    },
    errorCode: {
      type: String,
      default: null
    },
    errorMessage: {
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
    sentAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
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

broadcastDeliverySchema.index({ club: 1, createdAt: -1 });
broadcastDeliverySchema.index({ event: 1, createdAt: -1 });

const BroadcastDelivery =
  mongoose.models.BroadcastDelivery ||
  mongoose.model('BroadcastDelivery', broadcastDeliverySchema);

module.exports = BroadcastDelivery;
