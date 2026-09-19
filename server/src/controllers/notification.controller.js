const notificationService = require('../services/notification.service');
const { addConnection } = require('../utils/realtime');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { AppError } = require('../utils/errors');
const Event = require('../models/Event');
const { validateObjectId } = require('../utils/pagination');

/**
 * Lists notifications for the authenticated user.
 */
const listNotifications = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await notificationService.getUserNotifications(clubId, req.user._id, req.query);

    return successResponse(res, {
      status: 200,
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      pagination: result.pagination
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

/**
 * Returns the unread notification count for the authenticated user.
 */
const getUnreadCount = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await notificationService.getUnreadCount(clubId, req.user._id);

    return successResponse(res, {
      status: 200,
      message: 'Unread count retrieved successfully',
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
 * Marks a single notification as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const notification = await notificationService.markAsRead(clubId, req.user._id, req.params.id);

    return successResponse(res, {
      status: 200,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

/**
 * Marks all notifications as read for the authenticated user.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await notificationService.markAllAsRead(clubId, req.user._id);

    return successResponse(res, {
      status: 200,
      message: 'All notifications marked as read',
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
 * Opens a real-time SSE stream for the authenticated user.
 */
const streamNotifications = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;

    let eventId = null;
    if (req.query.eventId) {
      validateObjectId(req.query.eventId, 'event ID');
      const event = await Event.findOne({ _id: req.query.eventId, club: clubId });
      if (!event) {
        throw new AppError('Event not found or does not belong to your club', 404);
      }
      eventId = event._id;
    }

    addConnection({
      userId: req.user._id,
      clubId,
      eventId,
      req,
      res
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  streamNotifications
};
