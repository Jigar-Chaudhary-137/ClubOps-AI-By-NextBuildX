const mongoose = require('mongoose');

// Minimal placeholder schema - full domain schema will be defined in future stage
const eventSchema = new mongoose.Schema(
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

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

module.exports = Event;
