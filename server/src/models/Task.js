const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in_progress', 'review', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid task status'
      },
      default: 'todo',
      index: true
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid task priority'
      },
      default: 'medium',
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
      default: null
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
    dueDate: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    aiGenerated: {
      type: Boolean,
      default: false
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null
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

// Multi-tenant query indexes
taskSchema.index({ club: 1, event: 1, status: 1 });
taskSchema.index({ club: 1, assignedTo: 1, status: 1 });
taskSchema.index({ club: 1, dueDate: 1 });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

module.exports = Task;
