const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const Event = require('../models/Event');
const Task = require('../models/Task');
const { AppError } = require('../utils/errors');
const { parsePagination, formatPagination, validateObjectId } = require('../utils/pagination');

/**
 * Creates or registers a volunteer profile in the club.
 */
const createVolunteer = async (clubId, currentUser, data) => {
  const targetUserId = data.user || currentUser._id;
  validateObjectId(targetUserId, 'target user ID');

  const userRecord = await User.findOne({ _id: targetUserId, club: clubId });
  if (!userRecord) {
    throw new AppError('User not found or does not belong to your club', 404);
  }

  // Check if volunteer profile already exists for this user in this club
  const existing = await Volunteer.findOne({ user: targetUserId, club: clubId });
  if (existing) {
    throw new AppError('Volunteer profile already exists for this user', 409);
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

  const volunteer = new Volunteer({
    user: targetUserId,
    club: clubId,
    event: eventId,
    skills: Array.isArray(data.skills) ? data.skills : [],
    department: data.department ? data.department.trim() : 'General',
    availability: data.availability || 'available',
    notes: data.notes ? data.notes.trim() : ''
  });

  await volunteer.save();
  return volunteer.populate('user', 'name email avatarUrl phone role');
};

/**
 * Lists volunteers with department/availability/event filtering and pagination.
 */
const getVolunteers = async (clubId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = { club: clubId };

  if (query.event) {
    validateObjectId(query.event, 'event ID');
    filter.event = query.event;
  }

  if (query.department) {
    filter.department = query.department;
  }

  if (query.availability) {
    filter.availability = query.availability;
  }

  const [volunteers, total] = await Promise.all([
    Volunteer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email avatarUrl phone role')
      .populate('event', 'title status startDate endDate'),
    Volunteer.countDocuments(filter)
  ]);

  // Dynamically derive workload (active tasks count) for each volunteer
  if (volunteers.length > 0) {
    const volunteerIds = volunteers.map((v) => v._id);
    const userIds = volunteers.map((v) => v.user?._id || v.user).filter(Boolean);

    const activeTasks = await Task.find({
      club: clubId,
      status: { $nin: ['completed', 'cancelled'] },
      $or: [
        { volunteer: { $in: volunteerIds } },
        { assignedTo: { $in: userIds } }
      ]
    }).select('volunteer assignedTo').lean();

    const volCountMap = new Map();
    for (const t of activeTasks) {
      if (t.volunteer) {
        const vKey = t.volunteer.toString();
        volCountMap.set(vKey, (volCountMap.get(vKey) || 0) + 1);
      } else if (t.assignedTo) {
        const uKey = t.assignedTo.toString();
        const matchingVol = volunteers.find((v) => (v.user?._id || v.user)?.toString() === uKey);
        if (matchingVol) {
          const vKey = matchingVol._id.toString();
          volCountMap.set(vKey, (volCountMap.get(vKey) || 0) + 1);
        }
      }
    }

    volunteers.forEach((v) => {
      v.assignedTasksCount = volCountMap.get(v._id.toString()) || 0;
    });
  }

  return {
    volunteers,
    pagination: formatPagination(total, page, limit)
  };
};

/**
 * Retrieves a single volunteer profile by ID.
 */
const getVolunteerById = async (clubId, volunteerId) => {
  validateObjectId(volunteerId, 'volunteer ID');

  const volunteer = await Volunteer.findOne({ _id: volunteerId, club: clubId })
    .populate('user', 'name email avatarUrl phone role')
    .populate('event', 'title status startDate endDate');

  if (!volunteer) {
    throw new AppError('Volunteer profile not found', 404);
  }

  // Derive live active workload count
  const activeCount = await Task.countDocuments({
    club: clubId,
    status: { $nin: ['completed', 'cancelled'] },
    $or: [
      { volunteer: volunteer._id },
      { assignedTo: volunteer.user?._id || volunteer.user }
    ]
  });
  volunteer.assignedTasksCount = activeCount;

  return volunteer;
};

/**
 * Updates a volunteer profile.
 */
const updateVolunteer = async (clubId, currentUser, volunteerId, data) => {
  validateObjectId(volunteerId, 'volunteer ID');

  const volunteer = await Volunteer.findOne({ _id: volunteerId, club: clubId });
  if (!volunteer) {
    throw new AppError('Volunteer profile not found', 404);
  }

  const isOrganizer = ['admin', 'organizer'].includes(currentUser.role);
  const isSelf = volunteer.user.toString() === currentUser._id.toString();

  if (!isOrganizer && !isSelf) {
    throw new AppError('You do not have permission to modify this volunteer profile', 403);
  }

  if (data.event !== undefined) {
    if (data.event) {
      validateObjectId(data.event, 'event ID');
      const event = await Event.findOne({ _id: data.event, club: clubId });
      if (!event) {
        throw new AppError('Event not found or does not belong to your club', 404);
      }
      volunteer.event = data.event;
    } else {
      volunteer.event = null;
    }
  }

  if (data.skills !== undefined && Array.isArray(data.skills)) {
    volunteer.skills = data.skills;
  }

  if (data.department !== undefined) {
    volunteer.department = data.department.trim();
  }

  if (data.availability !== undefined) {
    volunteer.availability = data.availability;
  }

  if (data.notes !== undefined) {
    volunteer.notes = data.notes.trim();
  }

  if (isOrganizer && data.rating !== undefined) {
    volunteer.rating = data.rating;
  }

  await volunteer.save();
  return volunteer.populate('user', 'name email avatarUrl phone role');
};

/**
 * Removes a volunteer profile.
 */
const deleteVolunteer = async (clubId, volunteerId) => {
  validateObjectId(volunteerId, 'volunteer ID');

  const volunteer = await Volunteer.findOneAndDelete({ _id: volunteerId, club: clubId });
  if (!volunteer) {
    throw new AppError('Volunteer profile not found', 404);
  }

  return { id: volunteerId, message: 'Volunteer profile deleted successfully' };
};

module.exports = {
  createVolunteer,
  getVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer
};
