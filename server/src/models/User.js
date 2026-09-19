const mongoose = require('mongoose');

// Minimal placeholder schema - full domain schema will be defined in future stage
const userSchema = new mongoose.Schema(
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

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
