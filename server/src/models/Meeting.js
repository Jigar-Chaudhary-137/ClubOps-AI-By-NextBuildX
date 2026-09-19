const mongoose = require('mongoose');

// Minimal placeholder schema - full domain schema will be defined in future stage
const meetingSchema = new mongoose.Schema(
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

const Meeting = mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
