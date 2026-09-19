const mongoose = require('mongoose');

// Minimal placeholder schema - full domain schema will be defined in future stage
const riskSchema = new mongoose.Schema(
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

const Risk = mongoose.models.Risk || mongoose.model('Risk', riskSchema);

module.exports = Risk;
