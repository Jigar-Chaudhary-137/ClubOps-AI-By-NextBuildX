const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [200, 'Meeting title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
      index: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Associated club is required'],
      index: true
    },
    scheduledAt: {
      type: Date,
      default: Date.now
    },
    durationMinutes: {
      type: Number,
      default: 60
    },
    location: {
      type: String,
      default: 'Online',
      trim: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    agenda: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      default: ''
    },
    transcript: {
      type: String,
      default: ''
    },
    actionItemsExtracted: {
      type: Boolean,
      default: false
    },
    aiProcessed: {
      type: Boolean,
      default: false
    },
    extractedItems: [
      {
        title: { type: String },
        assignedTo: { type: String },
        deadline: { type: String },
        priority: { type: String }
      }
    ],
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

const Meeting = mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
