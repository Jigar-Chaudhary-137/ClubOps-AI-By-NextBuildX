const config = require('../../config/env');

/**
 * Splits text into overlapping sliding-window chunks.
 * @param {string} text 
 * @param {Object} options 
 * @param {number} options.chunkSize 
 * @param {number} options.chunkOverlap 
 * @param {number} [options.pageNumber] 
 * @param {number} [options.startIndexOffset] 
 * @returns {Array<{ chunkIndex: number, text: string, pageNumber: number|null, tokenCount: number, startOffset: number, endOffset: number }>}
 */
const createSlidingWindowChunks = (text, options = {}) => {
  const chunkSize = options.chunkSize || config.ragChunkSize || 800;
  const chunkOverlap = options.chunkOverlap !== undefined ? options.chunkOverlap : (config.ragChunkOverlap || 100);
  const pageNumber = options.pageNumber || null;
  const startIndexOffset = options.startIndexOffset || 0;

  if (chunkOverlap >= chunkSize) {
    throw new Error(`Chunk overlap (${chunkOverlap}) must be smaller than chunk size (${chunkSize})`);
  }

  const cleanText = text.trim();
  if (!cleanText) return [];

  const chunks = [];
  const step = chunkSize - chunkOverlap;
  let start = 0;
  let index = 0;

  while (start < cleanText.length) {
    let end = Math.min(start + chunkSize, cleanText.length);
    let chunkText = cleanText.substring(start, end).trim();

    if (chunkText.length > 0) {
      chunks.push({
        chunkIndex: startIndexOffset + index,
        text: chunkText,
        pageNumber,
        tokenCount: Math.ceil(chunkText.length / 4),
        startOffset: start,
        endOffset: end
      });
      index++;
    }

    if (end >= cleanText.length) break;
    start += step;
  }

  return chunks;
};

/**
 * Chunks a complete document, respecting page boundaries if available.
 * @param {string} fullText 
 * @param {Array<{ pageNumber: number, text: string }>} pages 
 * @param {Object} options 
 * @returns {Array<Object>}
 */
const chunkDocument = (fullText, pages = [], options = {}) => {
  const maxChunks = config.maxChunksPerDocument || 200;
  let allChunks = [];

  if (Array.isArray(pages) && pages.length > 0) {
    let globalIndex = 0;
    for (const page of pages) {
      if (!page.text || !page.text.trim()) continue;
      const pageChunks = createSlidingWindowChunks(page.text, {
        ...options,
        pageNumber: page.pageNumber,
        startIndexOffset: globalIndex
      });
      allChunks.push(...pageChunks);
      globalIndex += pageChunks.length;
    }
  }

  // If no per-page text or per-page chunks produced 0 chunks, chunk the full text directly
  if (allChunks.length === 0 && fullText && fullText.trim()) {
    allChunks = createSlidingWindowChunks(fullText, options);
  }

  // Enforce max chunks limit
  if (allChunks.length > maxChunks) {
    allChunks = allChunks.slice(0, maxChunks);
  }

  // Re-index cleanly
  return allChunks.map((chunk, idx) => ({
    ...chunk,
    chunkIndex: idx
  }));
};

module.exports = {
  createSlidingWindowChunks,
  chunkDocument
};
