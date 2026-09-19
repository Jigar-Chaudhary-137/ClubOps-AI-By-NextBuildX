const mongoose = require('mongoose');

// Minimal placeholder schema - full domain schema will be defined in future stage
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

module.exports = Task;
