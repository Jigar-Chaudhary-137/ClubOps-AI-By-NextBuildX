const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Event title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Associated club is required'],
      index: true
    },
    leadOrganizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead organizer is required']
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    venue: {
      name: { type: String, default: '' },
      capacity: { type: Number, default: 0 },
      booked: { type: Boolean, default: false }
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'planning', 'ready', 'active', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid event status'
      },
      default: 'planning',
      index: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    budget: {
      allocated: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' }
    },
    aiPlanGenerated: {
      type: Boolean,
      default: false
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

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

module.exports = Event;
