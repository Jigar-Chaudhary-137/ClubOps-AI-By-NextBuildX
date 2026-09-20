const config = require('../../config/env');

const defaultModel = config.geminiModel || 'gemini-3.6-flash';

const AI_MODELS = {
  default: defaultModel,
  flash: defaultModel,
  pro: defaultModel
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
