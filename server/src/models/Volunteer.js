const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Club reference is required'],
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
      index: true
    },
    skills: {
      type: [String],
      default: []
    },
    department: {
      type: String,
      default: 'General',
      trim: true
    },
    availability: {
      type: String,
      enum: {
        values: ['available', 'assigned', 'busy', 'unavailable'],
        message: '{VALUE} is not a valid availability status'
      },
      default: 'available',
      index: true
    },
    assignedTasksCount: {
      type: Number,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    notes: {
      type: String,
      default: '',
      trim: true
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

const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer;
