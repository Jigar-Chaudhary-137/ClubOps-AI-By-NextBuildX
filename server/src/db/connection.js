const mongoose = require('mongoose');
const config = require('../config/env');

// Register all Mongoose domain models
require('../models/Club');
require('../models/User');
require('../models/Event');
require('../models/Task');
require('../models/Volunteer');
require('../models/Meeting');
require('../models/Document');
require('../models/Risk');
require('../models/Announcement');
require('../models/Notification');
require('../models/BroadcastDelivery');

const readyStateMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

/**
 * Connects to MongoDB via Mongoose.
 * Returns a promise that resolves when connection succeeds.
 */
const connectDB = async () => {
  try {
    // Set mongoose connection event listeners once
    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Successfully connected to database: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection disconnected');
    });

    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    throw error;
  }
};

/**
 * Disconnects from MongoDB gracefully.
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed gracefully');
  }
};

/**
 * Retrieves the current safe database status for health checks.
 */
const getDatabaseStatus = () => {
  const readyState = mongoose.connection.readyState;
  const status = readyStateMap[readyState] || 'unknown';

  return {
    status,
    readyState,
    name: mongoose.connection.name || null
  };
};

module.exports = {
  connectDB,
  disconnectDB,
  getDatabaseStatus
};
