const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Risk title is required'],
      trim: true,
      maxlength: [200, 'Risk title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid severity level'
      },
      default: 'medium',
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['identified', 'mitigated', 'accepted', 'resolved'],
        message: '{VALUE} is not a valid risk status'
      },
      default: 'identified',
      index: true
    },
    probability: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid probability level'
      },
      default: 'medium'
    },
    mitigationPlan: {
      type: String,
      default: ''
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Associated event is required'],
      index: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Associated club is required'],
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    aiDetected: {
      type: Boolean,
      default: false
    },
    aiReasoning: {
      type: String,
      default: ''
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
riskSchema.index({ club: 1, event: 1, severity: 1, status: 1 });

const Risk = mongoose.models.Risk || mongoose.model('Risk', riskSchema);

module.exports = Risk;
