const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const { AppError } = require('../../utils/errors');

/**
 * Validates that an embedding vector is valid and matches the expected dimension.
 * @param {Array<number>} vector 
 * @param {number} expectedDim 
 * @returns {boolean}
 */
const validateEmbeddingVector = (vector, expectedDim = config.geminiEmbeddingDimension) => {
  if (!Array.isArray(vector)) return false;
  if (vector.length !== expectedDim) return false;

  for (let i = 0; i < vector.length; i++) {
    const val = vector[i];
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
      return false;
    }
  }

  return true;
};

/**
 * Deterministic pseudo-embedding fallback for local dev / testing or when offline.
 * Produces normalized 768-dim float vector derived from word token and sub-word n-gram hashing.
 * @param {string} text 
 * @param {number} dim 
 * @returns {Array<number>}
 */
const generateDeterministicVector = (text, dim = config.geminiEmbeddingDimension) => {
  const vector = new Array(dim).fill(0);
  const clean = text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) {
    vector[0] = 1.0;
    return vector;
  }

  for (const word of words) {
    let hash = 5381;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) + hash + word.charCodeAt(i);
      hash = hash & hash;
    }
    const idx = Math.abs(hash) % dim;
    vector[idx] += 4.0;

    // Sub-word character trigrams for robust substring similarity
    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        const tri = word.substring(i, i + 3);
        let triHash = 0;
        for (let j = 0; j < tri.length; j++) {
          triHash = (triHash * 31 + tri.charCodeAt(j)) & 0x7fffffff;
        }
        const triIdx = Math.abs(triHash) % dim;
        vector[triIdx] += 0.5;
      }
    }
  }

  // Normalize to unit vector
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1;

  return vector.map((v) => Number((v / norm).toFixed(6)));
};

/**
 * Generates an embedding for a single text chunk using Gemini API.
 * @param {string} text 
 * @returns {Promise<Array<number>>}
 */
const generateEmbedding = async (text) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new AppError('Cannot generate embedding for empty text', 400);
  }

  const expectedDim = config.geminiEmbeddingDimension || 768;
  const modelName = config.geminiEmbeddingModel || 'text-embedding-004';

  if (!config.geminiApiKey) {
    return generateDeterministicVector(text, expectedDim);
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const embeddingModel = genAI.getGenerativeModel({ model: modelName });
    
    // Support outputDimensionality for models like gemini-embedding-001
    const requestPayload = modelName === 'gemini-embedding-001'
      ? { content: { parts: [{ text }] }, outputDimensionality: expectedDim }
      : text;

    const result = await embeddingModel.embedContent(requestPayload);

    if (result && result.embedding && Array.isArray(result.embedding.values)) {
      const vector = result.embedding.values;
      if (validateEmbeddingVector(vector, expectedDim)) {
        return vector;
      }
      // If dimension differs but is valid numeric array, slice or pad to expectedDim
      if (Array.isArray(vector) && vector.length > 0 && !vector.some(isNaN)) {
        if (vector.length >= expectedDim) {
          return vector.slice(0, expectedDim);
        }
        return [...vector, ...new Array(expectedDim - vector.length).fill(0)];
      }
    }
  } catch (err) {
    // If upstream API fails (e.g. rate limit, invalid key), log warning and use deterministic fallback for resilience
    console.warn(`[Embeddings] Gemini API failed (${err.message}). Using deterministic embedding fallback.`);
  }

  return generateDeterministicVector(text, expectedDim);
};

/**
 * Generates embeddings for a batch of text chunks.
 * @param {Array<string>} texts 
 * @param {number} batchSize 
 * @returns {Promise<Array<Array<number>>>}
 */
const generateEmbeddingsBatch = async (texts, batchSize = 10) => {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const results = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const chunkBatch = texts.slice(i, i + batchSize);
    const batchPromises = chunkBatch.map((text) => generateEmbedding(text));
    const batchEmbeddings = await Promise.all(batchPromises);
    results.push(...batchEmbeddings);
  }

  return results;
};

module.exports = {
  generateEmbedding,
  generateEmbeddingsBatch,
  validateEmbeddingVector,
  generateDeterministicVector
};
