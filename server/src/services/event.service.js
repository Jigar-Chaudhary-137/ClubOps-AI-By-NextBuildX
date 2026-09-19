const Event = require('../models/Event');
const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');
const Risk = require('../models/Risk');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const { AppError } = require('../utils/errors');
const { parsePagination, formatPagination, validateObjectId, escapeRegex } = require('../utils/pagination');

/**
 * Creates a new event scoped to the authenticated user's club.
 */
const createEvent = async (clubId, userId, data) => {
  if (!data.title || !data.title.trim()) {
    throw new AppError('Event title is required', 400);
  }

  // Date validation
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      throw new AppError('End date must be greater than or equal to start date', 400);
    }
  }

  let leadOrganizerId = userId;
  if (data.leadOrganizer) {
    validateObjectId(data.leadOrganizer, 'lead organizer ID');
    const organizer = await User.findOne({ _id: data.leadOrganizer, club: clubId });
    if (!organizer) {
      throw new AppError('Lead organizer must belong to your club', 400);
    }
    leadOrganizerId = data.leadOrganizer;
  }

  const event = new Event({
    title: data.title.trim(),
    description: data.description ? data.description.trim() : '',
    club: clubId,
    leadOrganizer: leadOrganizerId,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    location: data.location || '',
    venue: data.venue || { name: '', capacity: 0, booked: false },
    status: data.status || 'planning',
    category: data.category || 'General',
    budget: data.budget || { allocated: 0, spent: 0, currency: 'INR' },
    createdBy: userId
  });

  await event.save();
  return event;
};

/**
 * Lists events for a club with filtering and pagination.
 */
const getEvents = async (clubId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = { club: clubId };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search) {
    const searchPattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: searchPattern }, { description: searchPattern }, { location: searchPattern }];
  }

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('leadOrganizer', 'name email avatarUrl phone')
      .populate('createdBy', 'name email'),
    Event.countDocuments(filter)
  ]);

  return {
    events,
    pagination: formatPagination(total, page, limit)
  };
};

/**
 * Retrieves a single event by ID scoped to the club.
 */
const getEventById = async (clubId, eventId) => {
  validateObjectId(eventId, 'event ID');

  const event = await Event.findOne({ _id: eventId, club: clubId })
    .populate('leadOrganizer', 'name email avatarUrl phone')
    .populate('createdBy', 'name email');

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return event;
};

/**
 * Updates an existing event scoped to the club.
 */
const updateEvent = async (clubId, eventId, data) => {
  validateObjectId(eventId, 'event ID');

  const event = await Event.findOne({ _id: eventId, club: clubId });
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Validate dates if updated
  const startDate = data.startDate !== undefined ? data.startDate : event.startDate;
  const endDate = data.endDate !== undefined ? data.endDate : event.endDate;
  if (startDate && endDate) {
    if (new Date(endDate) < new Date(startDate)) {
      throw new AppError('End date must be greater than or equal to start date', 400);
    }
  }

  // Validate organizer if updated
  if (data.leadOrganizer && data.leadOrganizer.toString() !== event.leadOrganizer.toString()) {
    validateObjectId(data.leadOrganizer, 'lead organizer ID');
    const organizer = await User.findOne({ _id: data.leadOrganizer, club: clubId });
    if (!organizer) {
      throw new AppError('Lead organizer must belong to your club', 400);
    }
    event.leadOrganizer = data.leadOrganizer;
  }

  // Update allowed fields
  if (data.title !== undefined) event.title = data.title.trim();
  if (data.description !== undefined) event.description = data.description.trim();
  if (data.startDate !== undefined) event.startDate = data.startDate;
  if (data.endDate !== undefined) event.endDate = data.endDate;
  if (data.location !== undefined) event.location = data.location.trim();
  if (data.venue !== undefined) event.venue = { ...event.venue, ...data.venue };
  if (data.status !== undefined) event.status = data.status;
  if (data.category !== undefined) event.category = data.category.trim();
  if (data.budget !== undefined) event.budget = { ...event.budget, ...data.budget };

  await event.save();
  return event;
};

/**
 * Deletes an event scoped to the club.
 */
const deleteEvent = async (clubId, eventId) => {
  validateObjectId(eventId, 'event ID');

  const event = await Event.findOneAndDelete({ _id: eventId, club: clubId });
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return { id: eventId, message: 'Event deleted successfully' };
};

/**
 * Aggregates statistics for an event dashboard overview.
 */
const getEventOverview = async (clubId, eventId) => {
  validateObjectId(eventId, 'event ID');

  const event = await Event.findOne({ _id: eventId, club: clubId });
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    totalVolunteers,
    totalRisks,
    criticalRisks,
    totalMeetings
  ] = await Promise.all([
    Task.countDocuments({ event: eventId, club: clubId }),
    Task.countDocuments({ event: eventId, club: clubId, status: 'completed' }),
    Task.countDocuments({ event: eventId, club: clubId, status: { $ne: 'completed' } }),
    Volunteer.countDocuments({ event: eventId, club: clubId }),
    Risk.countDocuments({ event: eventId, club: clubId }),
    Risk.countDocuments({ event: eventId, club: clubId, severity: 'critical', status: { $ne: 'resolved' } }),
    Meeting.countDocuments({ event: eventId, club: clubId })
  ]);

  return {
    event: {
      id: event._id,
      title: event.title,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      budget: event.budget
    },
    metrics: {
      totalTasks,
      completedTasks,
      pendingTasks,
      totalVolunteers,
      totalRisks,
      criticalRisks,
      totalMeetings,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }
  };
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventOverview
};
