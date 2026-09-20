const crypto = require('crypto');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const Event = require('../models/Event');
const Task = require('../models/Task');
const whatsappService = require('./whatsapp.service');
const { AppError } = require('../utils/errors');
const { parsePagination, formatPagination, validateObjectId } = require('../utils/pagination');

/**
 * Creates or registers a volunteer profile in the club.
 * Single source of truth for contact details is the User document.
 */
const createVolunteer = async (clubId, currentUser, data) => {
  validateObjectId(clubId, 'club ID');

  let targetUserId = null;
  let userRecord = null;

  // Case 1: Direct user ObjectId provided
  if (data.user) {
    validateObjectId(data.user, 'target user ID');
    userRecord = await User.findOne({ _id: data.user, club: clubId });
    if (!userRecord) {
      throw new AppError('User not found or does not belong to your club workspace', 404);
    }
    targetUserId = userRecord._id;
  } 
  // Case 2: Email provided
  else if (data.email && typeof data.email === 'string' && data.email.trim()) {
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check if user already exists within this club
    userRecord = await User.findOne({ email: normalizedEmail, club: clubId });

    if (userRecord) {
      // User exists in this club
      targetUserId = userRecord._id;

      // Update name/phone/whatsapp if provided
      let modified = false;
      if (data.name && data.name.trim() && userRecord.name !== data.name.trim()) {
        userRecord.name = data.name.trim();
        modified = true;
      }
      const rawPhone = data.whatsappNumber || data.phone;
      if (rawPhone) {
        const normalizedPhone = whatsappService.normalizePhoneNumber(rawPhone) || rawPhone.trim();
        if (normalizedPhone && userRecord.phone !== normalizedPhone) {
          userRecord.phone = normalizedPhone;
          userRecord.whatsappNumber = normalizedPhone;
          modified = true;
        }
      }
      if (data.role && ['volunteer', 'member', 'organizer', 'trainer'].includes(data.role.toLowerCase())) {
        userRecord.role = data.role.toLowerCase();
        modified = true;
      }
      if (modified) {
        await userRecord.save();
      }
    } else {
      // Safeguard: Check if email already belongs to a different club workspace
      const existingInOtherClub = await User.findOne({ email: normalizedEmail });
      if (existingInOtherClub && existingInOtherClub.club && existingInOtherClub.club.toString() !== clubId.toString()) {
        throw new AppError('A user with this email belongs to a different club workspace.', 409);
      }

      // Create new user in this club (secure internal temporary password, never exposed)
      const rawPhone = data.whatsappNumber || data.phone || '';
      const normalizedPhone = rawPhone ? (whatsappService.normalizePhoneNumber(rawPhone) || rawPhone.trim()) : '';
      const secureTempPassword = crypto.randomBytes(24).toString('hex') + 'A1!';

      userRecord = new User({
        name: (data.name || 'Club Volunteer').trim(),
        email: normalizedEmail,
        password: secureTempPassword,
        phone: normalizedPhone,
        whatsappNumber: normalizedPhone,
        role: data.role ? data.role.toLowerCase() : 'volunteer',
        club: clubId,
        isActive: true
      });
      await userRecord.save();
      targetUserId = userRecord._id;
    }
  } else {
    throw new AppError('Email address or user reference is required to register a volunteer', 400);
  }

  // Check if volunteer profile already exists for this user in this club
  const existingVolunteer = await Volunteer.findOne({ user: targetUserId, club: clubId });
  if (existingVolunteer) {
    throw new AppError('Volunteer already exists for this club.', 409);
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
  return volunteer.populate('user', 'name email avatarUrl phone whatsappNumber role');
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
      .populate('user', 'name email avatarUrl phone whatsappNumber role')
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
    .populate('user', 'name email avatarUrl phone whatsappNumber role')
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
 * Updates a volunteer profile and updates the source-of-truth User document for contact info.
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

  // 1. Update associated User record if user-level fields are supplied
  if (volunteer.user) {
    const userRecord = await User.findOne({ _id: volunteer.user, club: clubId });
    if (userRecord) {
      let userModified = false;

      if (data.name !== undefined && data.name.trim() && userRecord.name !== data.name.trim()) {
        userRecord.name = data.name.trim();
        userModified = true;
      }

      if (data.email !== undefined && data.email.trim()) {
        const newEmail = data.email.toLowerCase().trim();
        if (newEmail !== userRecord.email) {
          const emailConflict = await User.findOne({ email: newEmail, _id: { $ne: userRecord._id } });
          if (emailConflict) {
            throw new AppError('Email address is already in use by another user', 409);
          }
          userRecord.email = newEmail;
          userModified = true;
        }
      }

      if (data.phone !== undefined || data.whatsappNumber !== undefined) {
        const rawPhone = data.whatsappNumber !== undefined && data.whatsappNumber !== '' ? data.whatsappNumber : data.phone;
        const normalized = rawPhone ? (whatsappService.normalizePhoneNumber(rawPhone) || rawPhone.trim()) : '';
        userRecord.phone = normalized;
        userRecord.whatsappNumber = normalized;
        userModified = true;
      }

      if (isOrganizer && data.role !== undefined && ['volunteer', 'member', 'organizer', 'trainer'].includes(data.role.toLowerCase())) {
        userRecord.role = data.role.toLowerCase();
        userModified = true;
      }

      if (userModified) {
        await userRecord.save();
      }
    }
  }

  // 2. Update Volunteer record fields
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
  return volunteer.populate('user', 'name email avatarUrl phone whatsappNumber role');
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
