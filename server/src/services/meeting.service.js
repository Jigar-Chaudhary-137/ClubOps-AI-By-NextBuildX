const Meeting = require('../models/Meeting');
const Event = require('../models/Event');
const User = require('../models/User');
const { AppError } = require('../utils/errors');
const { parsePagination, formatPagination, validateObjectId, escapeRegex } = require('../utils/pagination');

/**
 * Schedules a new meeting for a club/event.
 */
const createMeeting = async (clubId, userId, data) => {
  if (!data.title || !data.title.trim()) {
    throw new AppError('Meeting title is required', 400);
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

  let validatedParticipants = [];
  if (data.participants && Array.isArray(data.participants)) {
    for (const pId of data.participants) {
      validateObjectId(pId, 'participant user ID');
      const user = await User.findOne({ _id: pId, club: clubId });
      if (!user) {
        throw new AppError(`Participant user ${pId} not found in your club`, 400);
      }
      validatedParticipants.push(pId);
    }
  }

  const meeting = new Meeting({
    title: data.title.trim(),
    description: data.description ? data.description.trim() : '',
    event: eventId,
    club: clubId,
    scheduledAt: data.scheduledAt || new Date(),
    durationMinutes: data.durationMinutes || 60,
    location: data.location || 'Online',
    participants: validatedParticipants,
    agenda: Array.isArray(data.agenda) ? data.agenda : [],
    notes: data.notes || '',
    transcript: data.transcript || '',
    createdBy: userId
  });

  await meeting.save();
  return meeting.populate([
    { path: 'participants', select: 'name email avatarUrl role' },
    { path: 'event', select: 'title status startDate endDate' },
    { path: 'createdBy', select: 'name email' }
  ]);
};

/**
 * Retrieves meetings with club scoping, event filter, search, and pagination.
 */
const getMeetings = async (clubId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = { club: clubId };

  if (query.event) {
    validateObjectId(query.event, 'event ID');
    filter.event = query.event;
  }

  if (query.search) {
    const searchPattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: searchPattern }, { description: searchPattern }, { notes: searchPattern }];
  }

  const [meetings, total] = await Promise.all([
    Meeting.find(filter)
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'name email avatarUrl role')
      .populate('event', 'title status')
      .populate('createdBy', 'name email'),
    Meeting.countDocuments(filter)
  ]);

  return {
    meetings,
    pagination: formatPagination(total, page, limit)
  };
};

/**
 * Retrieves a single meeting by ID.
 */
const getMeetingById = async (clubId, meetingId) => {
  validateObjectId(meetingId, 'meeting ID');

  const meeting = await Meeting.findOne({ _id: meetingId, club: clubId })
    .populate('participants', 'name email avatarUrl role')
    .populate('event', 'title status startDate endDate')
    .populate('createdBy', 'name email');

  if (!meeting) {
    throw new AppError('Meeting not found', 404);
  }

  return meeting;
};

/**
 * Updates an existing meeting (notes, agenda, transcript, schedule).
 */
const updateMeeting = async (clubId, meetingId, data) => {
  validateObjectId(meetingId, 'meeting ID');

  const meeting = await Meeting.findOne({ _id: meetingId, club: clubId });
  if (!meeting) {
    throw new AppError('Meeting not found', 404);
  }

  if (data.event !== undefined) {
    if (data.event) {
      validateObjectId(data.event, 'event ID');
      const event = await Event.findOne({ _id: data.event, club: clubId });
      if (!event) {
        throw new AppError('Event not found or does not belong to your club', 404);
      }
      meeting.event = data.event;
    } else {
      meeting.event = null;
    }
  }

  if (data.participants !== undefined && Array.isArray(data.participants)) {
    const validated = [];
    for (const pId of data.participants) {
      validateObjectId(pId, 'participant user ID');
      const user = await User.findOne({ _id: pId, club: clubId });
      if (!user) {
        throw new AppError(`Participant ${pId} not found in your club`, 400);
      }
      validated.push(pId);
    }
    meeting.participants = validated;
  }

  if (data.title !== undefined) meeting.title = data.title.trim();
  if (data.description !== undefined) meeting.description = data.description.trim();
  if (data.scheduledAt !== undefined) meeting.scheduledAt = data.scheduledAt;
  if (data.durationMinutes !== undefined) meeting.durationMinutes = data.durationMinutes;
  if (data.location !== undefined) meeting.location = data.location.trim();
  if (data.agenda !== undefined && Array.isArray(data.agenda)) meeting.agenda = data.agenda;
  if (data.notes !== undefined) meeting.notes = data.notes;
  if (data.transcript !== undefined) meeting.transcript = data.transcript;

  await meeting.save();
  return meeting.populate([
    { path: 'participants', select: 'name email avatarUrl role' },
    { path: 'event', select: 'title status startDate endDate' },
    { path: 'createdBy', select: 'name email' }
  ]);
};

/**
 * Deletes a meeting.
 */
const deleteMeeting = async (clubId, meetingId) => {
  validateObjectId(meetingId, 'meeting ID');

  const meeting = await Meeting.findOneAndDelete({ _id: meetingId, club: clubId });
  if (!meeting) {
    throw new AppError('Meeting not found', 404);
  }

  return { id: meetingId, message: 'Meeting deleted successfully' };
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting
};
