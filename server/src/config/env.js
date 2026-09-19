require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/clubops_ai',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || (isDevelopment ? 'dev_jwt_secret_key_change_in_prod' : null),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  isProduction,
  isDevelopment
};

// Validate required environment configuration
const validateConfig = () => {
  const missing = [];
  if (!config.mongodbUri) {
    missing.push('MONGODB_URI');
  }
  if (!config.port) {
    missing.push('PORT');
  }
  if (config.isProduction && !config.jwtSecret) {
    missing.push('JWT_SECRET (required in production)');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment configuration: ${missing.join(', ')}`);
  }
};

validateConfig();

module.exports = config;
