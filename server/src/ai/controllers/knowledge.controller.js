const { queryKnowledge, searchKnowledge } = require('../rag/ragEngine');
const Event = require('../../models/Event');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const { AppError } = require('../../utils/errors');
const { validateObjectId } = require('../../utils/pagination');

/**
 * Controller for RAG knowledge query synthesis (Question -> Grounded Answer + Citations).
 */
const queryKnowledgeBase = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const { query, eventId, topK, threshold } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new AppError('Query string is required', 400);
    }

    if (query.length > 500) {
      throw new AppError('Query exceeds maximum allowed length of 500 characters', 400);
    }

    if (eventId) {
      validateObjectId(eventId, 'event ID');
      const event = await Event.findOne({ _id: eventId, club: clubId });
      if (!event) {
        throw new AppError('Event not found or does not belong to your club', 404);
      }
    }

    const result = await queryKnowledge({
      clubId,
      query: query.trim(),
      eventId: eventId || null,
      topK: topK ? parseInt(topK, 10) : null,
      threshold: threshold !== undefined ? parseFloat(threshold) : null
    });

    return successResponse(res, {
      status: 200,
      message: 'Knowledge query completed successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

/**
 * Controller for pure knowledge chunk retrieval / semantic search.
 */
const searchKnowledgeBase = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const { query, eventId, topK, threshold, category } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new AppError('Query string is required', 400);
    }

    if (query.length > 500) {
      throw new AppError('Query exceeds maximum allowed length of 500 characters', 400);
    }

    if (eventId) {
      validateObjectId(eventId, 'event ID');
      const event = await Event.findOne({ _id: eventId, club: clubId });
      if (!event) {
        throw new AppError('Event not found or does not belong to your club', 404);
      }
    }

    const chunks = await searchKnowledge({
      clubId,
      query: query.trim(),
      eventId: eventId || null,
      topK: topK ? parseInt(topK, 10) : null,
      threshold: threshold !== undefined ? parseFloat(threshold) : null,
      category: category || null
    });

    return successResponse(res, {
      status: 200,
      message: 'Knowledge search completed successfully',
      data: {
        totalResults: chunks.length,
        results: chunks
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  queryKnowledgeBase,
  searchKnowledgeBase
};
