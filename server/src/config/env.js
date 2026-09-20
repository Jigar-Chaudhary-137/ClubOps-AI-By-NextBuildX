const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

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
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
  geminiEmbeddingDimension: parseInt(process.env.GEMINI_EMBEDDING_DIMENSION, 10) || 768,
  ragChunkSize: parseInt(process.env.RAG_CHUNK_SIZE, 10) || 800,
  ragChunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP, 10) || 100,
  ragTopK: parseInt(process.env.RAG_TOP_K, 10) || 5,
  ragSimilarityThreshold: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD) || 0.3,
  maxDocumentSizeMb: parseInt(process.env.MAX_DOCUMENT_SIZE_MB, 10) || 10,
  maxExtractedTextLength: parseInt(process.env.MAX_EXTRACTED_TEXT_LENGTH, 10) || 100000,
  maxChunksPerDocument: parseInt(process.env.MAX_CHUNKS_PER_DOCUMENT, 10) || 200,
  // Multi-Channel Announcement Providers
  announcementDeliveryMode: process.env.ANNOUNCEMENT_DELIVERY_MODE || 'dry_run',
  sendgridApiKey: process.env.SENDGRID_API_KEY || null,
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || null,
  sendgridFromName: process.env.SENDGRID_FROM_NAME || 'ClubOps AI',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || null,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || null,
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM || null,
  twilioSmsFrom: process.env.TWILIO_SMS_FROM || null,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || null,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || null,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
  // WhatsApp Provider & Simulator Configuration
  whatsappProvider: process.env.WHATSAPP_PROVIDER || (process.env.WHATSAPP_API_TOKEN ? 'cloud_api' : 'simulator'),
  whatsappApiToken: process.env.WHATSAPP_API_TOKEN || null,
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || null,
  whatsappBusinessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || null,
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'clubops_verify_token_2026',
  whatsappAppSecret: process.env.WHATSAPP_APP_SECRET || null,
  whatsappDefaultCountryCode: process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '91',
  whatsappSimulatedSentDelayMs: parseInt(process.env.WHATSAPP_SIMULATED_SENT_DELAY_MS, 10) || 300,
  whatsappSimulatedDeliveredDelayMs: parseInt(process.env.WHATSAPP_SIMULATED_DELIVERED_DELAY_MS, 10) || 700,
  whatsappSimulatedReadDelayMs: parseInt(process.env.WHATSAPP_SIMULATED_READ_DELAY_MS, 10) || 1200,
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
