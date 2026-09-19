const Risk = require('../models/Risk');
const Event = require('../models/Event');
const User = require('../models/User');
const { AppError } = require('../utils/errors');
const { parsePagination, formatPagination, validateObjectId, escapeRegex } = require('../utils/pagination');

/**
 * Creates a risk entry for an event.
 */
const createRisk = async (clubId, userId, data) => {
  if (!data.title || !data.title.trim()) {
    throw new AppError('Risk title is required', 400);
  }

  if (!data.event) {
    throw new AppError('Associated event is required', 400);
  }

  validateObjectId(data.event, 'event ID');
  const event = await Event.findOne({ _id: data.event, club: clubId });
  if (!event) {
    throw new AppError('Event not found or does not belong to your club', 404);
  }

  let ownerId = null;
  if (data.owner) {
    validateObjectId(data.owner, 'owner user ID');
    const owner = await User.findOne({ _id: data.owner, club: clubId });
    if (!owner) {
      throw new AppError('Risk owner must belong to your club', 400);
    }
    ownerId = data.owner;
  }

  const risk = new Risk({
    title: data.title.trim(),
    description: data.description ? data.description.trim() : '',
    severity: data.severity || 'medium',
    status: data.status || 'identified',
    probability: data.probability || 'medium',
    mitigationPlan: data.mitigationPlan ? data.mitigationPlan.trim() : '',
    event: data.event,
    club: clubId,
    owner: ownerId,
    createdBy: userId
  });

  await risk.save();

  // Trigger critical risk notification to organizers if severity is critical
  if (risk.severity === 'critical') {
    await notifyClubOrganizersCriticalRisk(clubId, risk);
  }

  return risk.populate([
    { path: 'owner', select: 'name email avatarUrl role' },
    { path: 'event', select: 'title status' },
    { path: 'createdBy', select: 'name email' }
  ]);
};

/**
 * Notifies all organizers and admins of the club when a critical risk occurs.
 */
const notifyClubOrganizersCriticalRisk = async (clubId, risk) => {
  try {
    const organizers = await User.find({
      club: clubId,
      role: { $in: ['admin', 'organizer'] },
      isActive: true
    })
      .select('_id')
      .lean();

    const notificationService = require('./notification.service');
    const promises = organizers.map((org) =>
      notificationService
        .createNotification({
          recipientId: org._id,
          clubId,
          eventId: risk.event,
          type: 'risk_critical',
          title: 'Critical Event Risk Detected',
          message: `Critical risk: "${risk.title}" requires immediate attention.`,
          priority: 'urgent',
          metadata: {
            riskId: risk._id.toString(),
            severity: 'critical'
          }
        })
        .catch((err) => console.warn('[Risk Notification Error]', err.message))
    );

    await Promise.all(promises);
  } catch (err) {
    console.warn('[Risk Notification Dispatch Error]', err.message);
  }
};

/**
 * Lists risks with severity, status, event filters, search, and pagination.
 */
const getRisks = async (clubId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = { club: clubId };

  if (query.event) {
    validateObjectId(query.event, 'event ID');
    filter.event = query.event;
  }

  if (query.severity) {
    filter.severity = query.severity;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const searchPattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: searchPattern }, { description: searchPattern }, { mitigationPlan: searchPattern }];
  }

  const [risks, total] = await Promise.all([
    Risk.find(filter)
      .sort({ severity: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name email avatarUrl role')
      .populate('event', 'title status')
      .populate('createdBy', 'name email'),
    Risk.countDocuments(filter)
  ]);

  return {
    risks,
    pagination: formatPagination(total, page, limit)
  };
};

/**
 * Retrieves a single risk entry by ID.
 */
const getRiskById = async (clubId, riskId) => {
  validateObjectId(riskId, 'risk ID');

  const risk = await Risk.findOne({ _id: riskId, club: clubId })
    .populate('owner', 'name email avatarUrl role')
    .populate('event', 'title status startDate endDate')
    .populate('createdBy', 'name email');

  if (!risk) {
    throw new AppError('Risk entry not found', 404);
  }

  return risk;
};

/**
 * Updates a risk entry (severity, mitigation plan, status).
 */
const updateRisk = async (clubId, riskId, data) => {
  validateObjectId(riskId, 'risk ID');

  const risk = await Risk.findOne({ _id: riskId, club: clubId });
  if (!risk) {
    throw new AppError('Risk entry not found', 404);
  }

  const previousSeverity = risk.severity;

  if (data.event !== undefined && data.event.toString() !== risk.event.toString()) {
    validateObjectId(data.event, 'event ID');
    const event = await Event.findOne({ _id: data.event, club: clubId });
    if (!event) {
      throw new AppError('Event not found or does not belong to your club', 404);
    }
    risk.event = data.event;
  }

  if (data.owner !== undefined) {
    if (data.owner) {
      validateObjectId(data.owner, 'owner user ID');
      const owner = await User.findOne({ _id: data.owner, club: clubId });
      if (!owner) {
        throw new AppError('Risk owner must belong to your club', 400);
      }
      risk.owner = data.owner;
    } else {
      risk.owner = null;
    }
  }

  if (data.title !== undefined) risk.title = data.title.trim();
  if (data.description !== undefined) risk.description = data.description.trim();
  if (data.severity !== undefined) risk.severity = data.severity;
  if (data.status !== undefined) risk.status = data.status;
  if (data.probability !== undefined) risk.probability = data.probability;
  if (data.mitigationPlan !== undefined) risk.mitigationPlan = data.mitigationPlan.trim();

  await risk.save();

  // Trigger notification if severity newly escalated to critical
  if (risk.severity === 'critical' && previousSeverity !== 'critical') {
    await notifyClubOrganizersCriticalRisk(clubId, risk);
  }

  return risk.populate([
    { path: 'owner', select: 'name email avatarUrl role' },
    { path: 'event', select: 'title status' },
    { path: 'createdBy', select: 'name email' }
  ]);
};

/**
 * Deletes a risk entry.
 */
const deleteRisk = async (clubId, riskId) => {
  validateObjectId(riskId, 'risk ID');

  const risk = await Risk.findOneAndDelete({ _id: riskId, club: clubId });
  if (!risk) {
    throw new AppError('Risk entry not found', 404);
  }

  return { id: riskId, message: 'Risk entry deleted successfully' };
};

module.exports = {
  createRisk,
  getRisks,
  getRiskById,
  updateRisk,
  deleteRisk
};
