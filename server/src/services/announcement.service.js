const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const { AppError } = require('../utils/errors');
const { parsePagination, formatPagination, validateObjectId, escapeRegex } = require('../utils/pagination');

/**
 * Creates a club/event announcement.
 */
const createAnnouncement = async (clubId, userId, data) => {
  if (!data.title || !data.title.trim()) {
    throw new AppError('Announcement title is required', 400);
  }

  if (!data.content || !data.content.trim()) {
    throw new AppError('Announcement content is required', 400);
  }

  let eventId = null;
  if (data.event) {
    validateObjectId(data.event, 'event ID');
    const event = await Event.findOne({ _id: data.event, club: clubId });
    if (!event) {
      throw new AppError('Event not found or does not belong to your club', 404);
    }
    eventId = data.event;
  }

  const targetAudiences = Array.isArray(data.targetAudiences) && data.targetAudiences.length > 0
    ? data.targetAudiences
    : (data.targetAudience ? [data.targetAudience] : ['Entire Club']);

  const channels = Array.isArray(data.channels) && data.channels.length > 0
    ? data.channels
    : ['in_app'];

  const customRecipients = Array.isArray(data.customRecipients) ? data.customRecipients : [];

  const announcement = new Announcement({
    title: data.title.trim(),
    content: data.content.trim(),
    club: clubId,
    event: eventId,
    priority: data.priority || 'normal',
    status: data.status || 'published',
    targetAudience: data.targetAudience || targetAudiences[0] || 'all',
    targetAudiences,
    customRecipients,
    channels,
    scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
    publishedAt: data.publishedAt || new Date(),
    createdBy: userId
  });

  await announcement.save();
  return announcement.populate([
    { path: 'createdBy', select: 'name email avatarUrl role' },
    { path: 'event', select: 'title status' },
    { path: 'customRecipients', select: 'name email role avatarUrl' }
  ]);
};

/**
 * Lists announcements with audience/priority/event filters, search, and pagination.
 */
const getAnnouncements = async (clubId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = { club: clubId };

  if (query.event) {
    validateObjectId(query.event, 'event ID');
    filter.event = query.event;
  }

  if (query.targetAudience) {
    filter.targetAudience = query.targetAudience;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.search) {
    const searchPattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: searchPattern }, { content: searchPattern }];
  }

  const [announcements, total] = await Promise.all([
    Announcement.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email avatarUrl role')
      .populate('event', 'title status'),
    Announcement.countDocuments(filter)
  ]);

  return {
    announcements,
    pagination: formatPagination(total, page, limit)
  };
};

/**
 * Retrieves a single announcement by ID.
 */
const getAnnouncementById = async (clubId, announcementId) => {
  validateObjectId(announcementId, 'announcement ID');

  const announcement = await Announcement.findOne({ _id: announcementId, club: clubId })
    .populate('createdBy', 'name email avatarUrl role')
    .populate('event', 'title status startDate endDate')
    .populate('customRecipients', 'name email role avatarUrl');

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  return announcement;
};

/**
 * Updates an announcement.
 */
const updateAnnouncement = async (clubId, announcementId, data) => {
  validateObjectId(announcementId, 'announcement ID');

  const announcement = await Announcement.findOne({ _id: announcementId, club: clubId });
  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  if (data.event !== undefined) {
    if (data.event) {
      validateObjectId(data.event, 'event ID');
      const event = await Event.findOne({ _id: data.event, club: clubId });
      if (!event) {
        throw new AppError('Event not found or does not belong to your club', 404);
      }
      announcement.event = data.event;
    } else {
      announcement.event = null;
    }
  }

  if (data.title !== undefined) announcement.title = data.title.trim();
  if (data.content !== undefined) announcement.content = data.content.trim();
  if (data.priority !== undefined) announcement.priority = data.priority;
  if (data.status !== undefined) announcement.status = data.status;
  if (data.targetAudience !== undefined) announcement.targetAudience = data.targetAudience;
  if (data.targetAudiences !== undefined && Array.isArray(data.targetAudiences)) {
    announcement.targetAudiences = data.targetAudiences;
  }
  if (data.customRecipients !== undefined && Array.isArray(data.customRecipients)) {
    announcement.customRecipients = data.customRecipients;
  }
  if (data.channels !== undefined && Array.isArray(data.channels)) {
    announcement.channels = data.channels;
  }
  if (data.scheduledFor !== undefined) {
    announcement.scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;
  }

  await announcement.save();
  return announcement.populate([
    { path: 'createdBy', select: 'name email avatarUrl role' },
    { path: 'event', select: 'title status' },
    { path: 'customRecipients', select: 'name email role avatarUrl' }
  ]);
};

/**
 * Deletes an announcement.
 */
const deleteAnnouncement = async (clubId, announcementId) => {
  validateObjectId(announcementId, 'announcement ID');

  const announcement = await Announcement.findOneAndDelete({ _id: announcementId, club: clubId });
  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  return { id: announcementId, message: 'Announcement deleted successfully' };
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
};
