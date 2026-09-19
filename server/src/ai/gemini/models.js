const config = require('../../config/env');

const AI_MODELS = {
  default: config.geminiModel || 'gemini-1.5-flash',
  flash: 'gemini-1.5-flash',
  pro: 'gemini-1.5-pro'
};

const GENERATION_CONFIG = {
  temperature: 0.2,
  topP: 0.95,
  topK: 40,
  responseMimeType: 'application/json'
};

module.exports = {
  AI_MODELS,
  GENERATION_CONFIG
};
