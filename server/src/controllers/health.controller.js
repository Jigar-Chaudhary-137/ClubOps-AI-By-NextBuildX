const mongoose = require('mongoose');
const { getDatabaseStatus } = require('../db/connection');
const config = require('../config/env');
const realtime = require('../utils/realtime');
const Document = require('../models/Document');

/**
 * Basic health check endpoint
 */
const getHealth = (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.readyState === 1;

  const responsePayload = {
    success: isHealthy,
    message: isHealthy ? 'ClubOps API is running' : 'ClubOps API is running but database is degraded/disconnected',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.status,
      readyState: dbStatus.readyState
    }
  };

  return res.status(isHealthy ? 200 : 503).json(responsePayload);
};

/**
 * Deep subsystem diagnostic health check
 */
const getFullHealth = async (req, res) => {
  const startTime = Date.now();
  const dbStatus = getDatabaseStatus();
  const isDbConnected = dbStatus.readyState === 1;

  // 1. MongoDB Diagnostics
  let mongoDiagnostics = {
    status: dbStatus.status,
    readyState: dbStatus.readyState,
    database: mongoose.connection.name || 'unknown',
    latencyMs: null
  };

  if (isDbConnected && mongoose.connection.db) {
    try {
      const pingStart = Date.now();
      await mongoose.connection.db.admin().ping();
      mongoDiagnostics.latencyMs = Date.now() - pingStart;
      mongoDiagnostics.status = 'healthy';
    } catch (dbErr) {
      mongoDiagnostics.status = 'degraded';
      mongoDiagnostics.error = dbErr.message;
    }
  }

  // 2. Gemini AI Diagnostics
  const geminiConfigured = Boolean(config.gemini && config.gemini.apiKey);
  const geminiDiagnostics = {
    status: geminiConfigured ? 'healthy' : 'degraded',
    configured: geminiConfigured,
    model: config.gemini?.model || 'gemini-1.5-flash',
    embeddingModel: config.gemini?.embeddingModel || 'text-embedding-004'
  };

  // 3. RAG Knowledge Base Diagnostics
  let ragDiagnostics = {
    status: 'healthy',
    embeddingDimension: 768,
    totalDocuments: 0,
    totalChunks: 0
  };

  if (isDbConnected) {
    try {
      const docCount = await Document.countDocuments({});
      const docsWithChunks = await Document.find({}, { 'chunks._id': 1 }).lean();
      const chunkCount = docsWithChunks.reduce((acc, doc) => acc + (doc.chunks?.length || 0), 0);

      ragDiagnostics.totalDocuments = docCount;
      ragDiagnostics.totalChunks = chunkCount;
    } catch (ragErr) {
      ragDiagnostics.status = 'degraded';
      ragDiagnostics.error = ragErr.message;
    }
  }

  // 4. Real-time SSE Stream Diagnostics
  const realtimeStats = typeof realtime.getStats === 'function'
    ? realtime.getStats()
    : { totalConnections: 0, uniqueUsers: 0, uniqueClubs: 0, uniqueEvents: 0 };

  const sseDiagnostics = {
    status: 'healthy',
    activeConnections: realtimeStats.totalConnections || 0,
    uniqueUsers: realtimeStats.uniqueUsers || 0,
    uniqueClubs: realtimeStats.uniqueClubs || 0,
    eventListeners: realtimeStats.uniqueEvents || 0
  };

  // 5. Node Process Metrics
  const memory = process.memoryUsage();
  const processMetrics = {
    nodeVersion: process.version,
    platform: process.platform,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryMb: {
      rss: Math.round((memory.rss / (1024 * 1024)) * 100) / 100,
      heapUsed: Math.round((memory.heapUsed / (1024 * 1024)) * 100) / 100,
      heapTotal: Math.round((memory.heapTotal / (1024 * 1024)) * 100) / 100
    }
  };

  // Overall system status determination
  const isOverallHealthy = isDbConnected && mongoDiagnostics.status === 'healthy';
  const isDegraded = !geminiConfigured || ragDiagnostics.status === 'degraded';
  const overallStatus = !isDbConnected ? 'unhealthy' : isDegraded ? 'degraded' : 'healthy';

  const statusCode = !isDbConnected ? 503 : 200;

  return res.status(statusCode).json({
    success: isOverallHealthy,
    data: {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      services: {
        mongodb: mongoDiagnostics,
        gemini: geminiDiagnostics,
        rag: ragDiagnostics,
        realtime: sseDiagnostics
      },
      process: processMetrics
    }
  });
};

module.exports = {
  getHealth,
  getFullHealth
};
