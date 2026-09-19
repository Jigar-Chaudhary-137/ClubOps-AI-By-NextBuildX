const Notification = require('../models/Notification');
const User = require('../models/User');
const Event = require('../models/Event');
const { AppError } = require('../utils/errors');
const { parsePagination, formatPagination, validateObjectId } = require('../utils/pagination');
const { broadcastNotification } = require('../utils/realtime');

/**
 * Creates a validated notification and pushes to real-time SSE stream.
 */
const createNotification = async ({
  recipientId,
  clubId,
  eventId = null,
  type,
  title,
  message,
  priority = 'normal',
  actionUrl = null,
  metadata = {}
}) => {
  if (!recipientId) {
    throw new AppError('Notification recipient ID is required', 400);
  }

  if (!clubId) {
    throw new AppError('Club ID is required', 400);
  }

  validateObjectId(recipientId, 'recipient user ID');

  // Verify recipient belongs to the club
  const recipient = await User.findOne({ _id: recipientId, club: clubId, isActive: true });
  if (!recipient) {
    throw new AppError('Recipient user not found or does not belong to the club', 404);
  }

  let verifiedEventId = null;
  if (eventId) {
    validateObjectId(eventId, 'event ID');
    const event = await Event.findOne({ _id: eventId, club: clubId });
    if (!event) {
      throw new AppError('Event not found or does not belong to the club', 404);
    }
    verifiedEventId = event._id;
  }

  const notification = new Notification({
    recipient: recipient._id,
    club: clubId,
    event: verifiedEventId,
    type,
    title: title.trim(),
    message: message.trim(),
    priority,
    actionUrl,
    metadata
  });

  await notification.save();

  // Push to active SSE streams
  broadcastNotification(notification);

  return notification;
};

/**
 * Lists notifications strictly scoped to the authenticated user and club.
 */
const getUserNotifications = async (clubId, userId, query = {}) => {
  const { page, limit: reqLimit, skip } = parsePagination(query);
  const limit = Math.min(reqLimit || 20, 100); // Cap at 100

  const filter = {
    recipient: userId,
    club: clubId
  };

  if (query.read !== undefined) {
    filter.read = query.read === 'true' || query.read === true;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.event) {
    validateObjectId(query.event, 'event ID');
    filter.event = query.event;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('event', 'title status startDate')
      .lean(),
    Notification.countDocuments(filter)
  ]);

  return {
    notifications,
    pagination: formatPagination(total, page, limit)
  };
};

/**
 * Retrieves the count of unread notifications for the user.
 */
const getUnreadCount = async (clubId, userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    club: clubId,
    read: false
  });

  return { unreadCount: count };
};

/**
 * Marks a single notification as read (must belong to authenticated user).
 */
const markAsRead = async (clubId, userId, notificationId) => {
  validateObjectId(notificationId, 'notification ID');

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
    club: clubId
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  notification.read = true;
  await notification.save();

  return notification;
};

/**
 * Marks all notifications as read for the authenticated user and club.
 */
const markAllAsRead = async (clubId, userId) => {
  const result = await Notification.updateMany(
    {
      recipient: userId,
      club: clubId,
      read: false
    },
    {
      $set: { read: true }
    }
  );

  return {
    modifiedCount: result.modifiedCount
  };
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
