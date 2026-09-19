const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      trim: true,
      maxlength: [120, 'Club name cannot exceed 120 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    code: {
      type: String,
      required: [true, 'Club code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Club code must be at least 3 characters'],
      maxlength: [20, 'Club code cannot exceed 20 characters']
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    leadOrganizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead organizer is required']
    },
    membersCount: {
      type: Number,
      default: 1,
      min: 0
    },
    logoUrl: {
      type: String,
      default: ''
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

const Club = mongoose.models.Club || mongoose.model('Club', clubSchema);

module.exports = Club;
