const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const { AI_MODELS, GENERATION_CONFIG } = require('./models');
const { AppError } = require('../../utils/errors');

let genAIInstance = null;

/**
 * Returns or initializes the GoogleGenerativeAI client.
 */
const getClient = () => {
  if (!config.geminiApiKey || config.geminiApiKey.includes('replace_with_') || config.geminiApiKey === 'your_gemini_api_key_here') {
    throw new AppError('AI service is not configured. Please set a valid GEMINI_API_KEY in environment.', 503);
  }

  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(config.geminiApiKey);
  }

  return genAIInstance;
};

/**
 * Cleans markdown fences from JSON output if Gemini returns wrapped codeblocks.
 */
const cleanJsonString = (rawText) => {
  if (!rawText) return '{}';
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
};

/**
 * Sends a structured prompt to Google Gemini and returns parsed JSON.
 *
 * @param {string} prompt - Prompt string
 * @param {object} options
 * @param {string} [options.workflow='generic'] - Workflow name for observability
 * @param {string} [options.systemInstruction] - Optional system instruction
 * @param {string} [options.modelName] - Optional model override
 * @returns {Promise<object>} - Parsed JSON object
 */
const generateStructured = async (prompt, options = {}) => {
  const startTime = Date.now();
  const workflow = options.workflow || 'unspecified';

  try {
    const ai = getClient();
    const modelName = options.modelName || AI_MODELS.default;

    const modelParams = {
      model: modelName,
      generationConfig: {
        ...GENERATION_CONFIG,
        ...(options.generationConfig || {})
      }
    };

    if (options.systemInstruction) {
      modelParams.systemInstruction = options.systemInstruction;
    }

    const model = ai.getGenerativeModel(modelParams);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const durationMs = Date.now() - startTime;
    console.log(`[AI] Workflow="${workflow}" completed in ${durationMs}ms with model="${modelName}"`);

    const cleaned = cleanJsonString(text);
    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.error(`[AI Error] Workflow="${workflow}" returned non-JSON payload:`, cleaned.slice(0, 200));
      throw new AppError('AI engine produced an invalid structured JSON response. Please retry.', 502);
    }
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`[AI Error] Workflow="${workflow}" failed after ${durationMs}ms: ${error.message}`);

    if (error instanceof AppError) {
      throw error;
    }

    // Map upstream Gemini error statuses
    if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new AppError('AI rate limit reached. Please wait a moment and try again.', 429);
    }

    if (error.status === 400 || error.message?.includes('API key not valid')) {
      throw new AppError('Invalid Gemini API Key configuration. Please check your credentials.', 502);
    }

    throw new AppError(`AI service request failed: ${error.message || 'Upstream service error'}`, 502);
  }
};

module.exports = {
  getClient,
  generateStructured
};
