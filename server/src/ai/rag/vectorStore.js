const Document = require('../../models/Document');
const config = require('../../config/env');
const { validateObjectId } = require('../../utils/pagination');

/**
 * Calculates cosine similarity between two numeric vectors.
 * Returns float between -1.0 and 1.0 (or 0.0 on invalid input).
 * @param {Array<number>} vecA 
 * @param {Array<number>} vecB 
 * @returns {number}
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  if (vecA.length === 0 || vecB.length === 0) return 0;
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];

    if (isNaN(a) || !isFinite(a) || isNaN(b) || !isFinite(b)) {
      return 0;
    }

    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0 || isNaN(denominator)) return 0;

  const score = dotProduct / denominator;
  return Number(score.toFixed(4));
};

/**
 * Multi-tenant club-scoped candidate search in MongoDB.
 * Retrieves processed knowledge base documents belonging strictly to the authenticated club.
 * @param {Object} params
 * @param {string|ObjectId} params.clubId - Authenticated club ID (MANDATORY)
 * @param {Array<number>} params.queryVector - Numeric embedding of the query
 * @param {string} [params.eventId] - Optional event filter
 * @param {number} [params.topK] - Max results to return
 * @param {number} [params.threshold] - Minimum similarity threshold
 * @param {string} [params.category] - Optional document category filter
 * @returns {Promise<Array<Object>>}
 */
const searchSimilarChunks = async ({
  clubId,
  queryVector,
  eventId = null,
  topK = null,
  threshold = null,
  category = null
}) => {
  if (!clubId) {
    throw new Error('Club ID is required for vector retrieval');
  }

  const effectiveTopK = Math.min(topK || config.ragTopK || 5, 20);
  const effectiveThreshold = threshold !== null && threshold !== undefined ? threshold : (config.ragSimilarityThreshold || 0.4);

  // Mandatory multi-tenant pre-filter
  const filter = {
    club: clubId,
    isKnowledgeBase: true,
    ingestionStatus: 'processed'
  };

  if (category) {
    filter.category = category;
  }

  // Event scoping policy: if eventId is provided, include documents linked to this event OR global club-wide documents (event: null)
  if (eventId) {
    validateObjectId(eventId, 'event ID');
    filter.$or = [
      { event: eventId },
      { event: null }
    ];
  }

  // Retrieve candidate documents with their embedded chunks
  const candidateDocs = await Document.find(filter)
    .select('_id title category event chunks uploadedBy createdAt')
    .lean();

  if (!candidateDocs || candidateDocs.length === 0) {
    return [];
  }

  const scoredChunks = [];

  for (const doc of candidateDocs) {
    if (!Array.isArray(doc.chunks) || doc.chunks.length === 0) continue;

    for (const chunk of doc.chunks) {
      if (!Array.isArray(chunk.embedding) || chunk.embedding.length === 0) continue;

      const similarity = cosineSimilarity(queryVector, chunk.embedding);

      if (similarity >= effectiveThreshold) {
        scoredChunks.push({
          documentId: doc._id.toString(),
          title: doc.title,
          category: doc.category,
          eventId: doc.event ? doc.event.toString() : null,
          isGlobalClubDoc: !doc.event,
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber || null,
          tokenCount: chunk.tokenCount || 0,
          similarity,
          text: chunk.text,
          snippet: chunk.text.length > 200 ? `${chunk.text.substring(0, 200)}...` : chunk.text
        });
      }
    }
  }

  // Sort descending by similarity score
  scoredChunks.sort((a, b) => b.similarity - a.similarity);

  // Return top-K candidate chunks
  return scoredChunks.slice(0, effectiveTopK);
};

module.exports = {
  cosineSimilarity,
  searchSimilarChunks
};
