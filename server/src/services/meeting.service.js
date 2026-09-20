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
  if (data.event && data.event !== 'none' && data.event !== '') {
    validateObjectId(data.event, 'event ID');
    const event = await Event.findOne({ _id: data.event, club: clubId });
    if (!event) {
      throw new AppError('Event not found or does not belong to your club', 404);
    }
    eventId = event._id;
  }

  // Parse Date & Time
  let scheduledAt = new Date();
  if (data.scheduledAt) {
    scheduledAt = new Date(data.scheduledAt);
  } else if (data.date) {
    let dateStr = data.date.trim();
    // Handle DD-MM-YYYY vs YYYY-MM-DD
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('-');
      dateStr = `${y}-${m}-${d}`;
    }
    const timeStr = data.startTime && data.startTime.trim() ? data.startTime.trim() : '10:00';
    scheduledAt = new Date(`${dateStr}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}`);
    if (isNaN(scheduledAt.getTime())) {
      scheduledAt = new Date();
    }
  }

  // Calculate Duration
  let durationMinutes = Number(data.durationMinutes) || 60;
  if (data.startTime && data.endTime) {
    try {
      const [sh, sm] = data.startTime.split(':').map(Number);
      const [eh, em] = data.endTime.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0) {
        durationMinutes = diff;
      }
    } catch (e) {
      // Keep default
    }
  }

  // Resolve Participants (handles ObjectIds, emails, or user objects)
  let rawParticipants = Array.isArray(data.participants)
    ? data.participants
    : (Array.isArray(data.attendees) ? data.attendees : []);

  let validatedParticipants = [];
  if (rawParticipants.length > 0) {
    for (const p of rawParticipants) {
      if (!p) continue;
      const pStr = typeof p === 'object' ? (p._id || p.id || p.email) : String(p).trim();
      if (!pStr) continue;

      if (/^[0-9a-fA-F]{24}$/.test(pStr)) {
        const user = await User.findOne({ _id: pStr, club: clubId });
        if (user && !validatedParticipants.includes(user._id.toString())) {
          validatedParticipants.push(user._id);
        }
      } else if (pStr.includes('@')) {
        // Resolve email to user in the club
        const user = await User.findOne({ email: pStr.toLowerCase(), club: clubId });
        if (user && !validatedParticipants.includes(user._id.toString())) {
          validatedParticipants.push(user._id);
        }
      }
    }
  }

  // Parse Agenda
  let agendaList = [];
  if (Array.isArray(data.agenda)) {
    agendaList = data.agenda.map(a => String(a).trim()).filter(Boolean);
  } else if (typeof data.agenda === 'string' && data.agenda.trim()) {
    agendaList = data.agenda.split('\n').map(a => a.trim().replace(/^[-*•\d.]+\s*/, '')).filter(Boolean);
  }

  const meeting = new Meeting({
    title: data.title.trim(),
    description: data.description ? data.description.trim() : (data.notes ? data.notes.trim() : ''),
    type: data.type || 'Planning',
    event: eventId,
    club: clubId,
    scheduledAt,
    durationMinutes,
    location: data.location ? data.location.trim() : 'Online',
    participants: validatedParticipants,
    agenda: agendaList,
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
