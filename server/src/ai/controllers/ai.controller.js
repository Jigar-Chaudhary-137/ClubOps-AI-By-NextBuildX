const aiService = require('../services/ai.service');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const { AppError } = require('../../utils/errors');

const planEvent = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const plan = await aiService.planEvent(clubId, req.body);
    return successResponse(res, {
      status: 200,
      message: 'AI event plan generated successfully',
      data: plan
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const processMeeting = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await aiService.processMeetingTranscript(clubId, req.params.id);
    return successResponse(res, {
      status: 200,
      message: 'Meeting processed and action items extracted successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const extractActions = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await aiService.extractActionsFromText(clubId, req.body);
    return successResponse(res, {
      status: 200,
      message: 'Action items extracted successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const analyzeRisks = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await aiService.analyzeEventRisks(clubId, req.params.eventId);
    return successResponse(res, {
      status: 200,
      message: 'Event operational risk analysis completed successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const generateAnnouncement = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await aiService.generateAnnouncement(clubId, req.body);
    return successResponse(res, {
      status: 200,
      message: 'AI announcement draft generated successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  planEvent,
  processMeeting,
  extractActions,
  analyzeRisks,
  generateAnnouncement
};
