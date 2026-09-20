const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [200, 'Announcement title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
      trim: true
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
    priority: {
      type: String,
      enum: {
        values: ['low', 'normal', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority level'
      },
      default: 'normal'
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'archived'],
        message: '{VALUE} is not a valid status'
      },
      default: 'published',
      index: true
    },
    targetAudience: {
      type: String,
      default: 'all'
    },
    targetAudiences: {
      type: [String],
      default: ['Entire Club']
    },
    customRecipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    channels: {
      type: [String],
      default: ['in_app']
    },
    deliveryStats: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    scheduledFor: {
      type: Date,
      default: null
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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

// Multi-tenant query index
announcementSchema.index({ club: 1, event: 1, status: 1, publishedAt: -1 });

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
