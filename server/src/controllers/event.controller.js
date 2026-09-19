const eventService = require('../services/event.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { AppError } = require('../utils/errors');

const createEvent = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const event = await eventService.createEvent(clubId, req.user._id, req.body);
    return successResponse(res, {
      status: 201,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await eventService.getEvents(clubId, req.query);
    return successResponse(res, {
      status: 200,
      message: 'Events retrieved successfully',
      data: result.events,
      pagination: result.pagination
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const event = await eventService.getEventById(clubId, req.params.id);
    return successResponse(res, {
      status: 200,
      message: 'Event retrieved successfully',
      data: { event }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const event = await eventService.updateEvent(clubId, req.params.id, req.body);
    return successResponse(res, {
      status: 200,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await eventService.deleteEvent(clubId, req.params.id);
    return successResponse(res, {
      status: 200,
      message: result.message,
      data: { id: result.id }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getEventOverview = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const overview = await eventService.getEventOverview(clubId, req.params.id);
    return successResponse(res, {
      status: 200,
      message: 'Event overview retrieved successfully',
      data: overview
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventOverview
};
