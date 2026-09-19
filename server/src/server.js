const config = require('./config/env');
const app = require('./app');
const { connectDB, disconnectDB } = require('./db/connection');

let server;

/**
 * Graceful shutdown sequence
 */
const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed');
      try {
        await disconnectDB();
        console.log('[Server] Graceful shutdown complete. Exiting.');
        process.exit(0);
      } catch (err) {
        console.error('[Server] Error during database disconnect:', err.message);
        process.exit(1);
      }
    });
  } else {
    try {
      await disconnectDB();
    } catch (err) {
      console.error('[Server] Error closing database:', err.message);
    }
    process.exit(0);
  }
};

/**
 * Handles fatal unhandled rejections and exceptions
 */
const handleFatalError = async (err, origin) => {
  console.error(`[Fatal] ${origin}:`, err);
  if (server) {
    server.close(async () => {
      await disconnectDB().catch(() => {});
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

// Process-level error listeners
process.on('uncaughtException', (err) => handleFatalError(err, 'uncaughtException'));
process.on('unhandledRejection', (reason) => handleFatalError(reason, 'unhandledRejection'));

// Signal listeners
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

/**
 * Initializes database connection and starts HTTP server
 */
const startServer = async () => {
  try {
    // 1. Connect to MongoDB first
    await connectDB();

    // 2. Start HTTP server only after database is connected
    server = app.listen(config.port, () => {
      console.log(`[Server] ClubOps AI Server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`[Server] Base URL: http://localhost:${config.port}`);
      console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error(`[Fatal] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
