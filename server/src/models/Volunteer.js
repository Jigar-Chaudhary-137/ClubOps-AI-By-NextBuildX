const mongoose = require('mongoose');

// Minimal placeholder schema - full domain schema will be defined in future stage
const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer;
