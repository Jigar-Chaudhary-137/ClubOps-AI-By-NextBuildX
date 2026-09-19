require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/clubops_ai',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || null,
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production'
};

// Validate Stage 1 required configuration
const validateConfig = () => {
  const missing = [];
  if (!config.mongodbUri) {
    missing.push('MONGODB_URI');
  }
  if (!config.port) {
    missing.push('PORT');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment configuration: ${missing.join(', ')}`);
  }
};

validateConfig();

module.exports = config;
