const announcementService = require('../services/announcement.service');
const announcementDeliveryService = require('../services/announcements/announcementDeliveryService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { AppError } = require('../utils/errors');
const User = require('../models/User');

const createAnnouncement = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const announcement = await announcementService.createAnnouncement(clubId, req.user._id, req.body);
    return successResponse(res, {
      status: 201,
      message: 'Announcement created successfully',
      data: { announcement }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getAnnouncements = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await announcementService.getAnnouncements(clubId, req.query);
    return successResponse(res, {
      status: 200,
      message: 'Announcements retrieved successfully',
      data: result.announcements,
      pagination: result.pagination
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const announcement = await announcementService.getAnnouncementById(clubId, req.params.id);
    return successResponse(res, {
      status: 200,
      message: 'Announcement retrieved successfully',
      data: { announcement }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const announcement = await announcementService.updateAnnouncement(clubId, req.params.id, req.body);
    return successResponse(res, {
      status: 200,
      message: 'Announcement updated successfully',
      data: { announcement }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await announcementService.deleteAnnouncement(clubId, req.params.id);
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

const previewRecipients = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const { targetAudiences, audiences, targetAudience, eventId, event, customUserIds, customRecipients, channels } = req.body;

    const preview = await announcementDeliveryService.getAudiencePreview(clubId, {
      audiences: targetAudiences || audiences || (targetAudience ? [targetAudience] : ['Entire Club']),
      eventId: eventId || event || null,
      customUserIds: customUserIds || customRecipients || [],
      channels: channels || ['in_app']
    });

    return successResponse(res, {
      status: 200,
      message: 'Recipient preview resolved successfully',
      data: preview
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getClubMembers = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const members = await User.find({ club: clubId, isActive: true })
      .select('_id name email role avatarUrl phone deviceTokens')
      .sort({ name: 1 })
      .lean();

    const safeMembers = members.map(m => ({
      _id: m._id,
      name: m.name,
      email: m.email,
      role: m.role,
      avatarUrl: m.avatarUrl || '',
      hasPhone: Boolean(m.phone && m.phone.trim().length >= 7),
      hasPush: Boolean(Array.isArray(m.deviceTokens) && m.deviceTokens.length > 0)
    }));

    return successResponse(res, {
      status: 200,
      message: 'Club members retrieved successfully',
      data: safeMembers
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const broadcastAnnouncement = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const { channels, deliveryMode } = req.body;

    const result = await announcementDeliveryService.broadcastAnnouncement(
      clubId,
      req.user._id,
      req.params.id,
      channels,
      { deliveryMode }
    );

    return successResponse(res, {
      status: 200,
      message: `Announcement broadcast processed in ${result.summary.deliveryMode.toUpperCase()} mode`,
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
 * Returns safe provider health status and active delivery mode.
 */
const getProviderStatus = async (req, res, next) => {
  try {
    const status = await announcementDeliveryService.getProviderStatus();
    return successResponse(res, {
      status: 200,
      message: 'Provider health status retrieved successfully',
      data: status
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

/**
 * Executes a controlled test delivery to a single isolated recipient.
 */
const sendControlledTest = async (req, res, next) => {
  try {
    const { channel, testTarget, customContent, isDryRun } = req.body;
    if (!channel || !testTarget) {
      throw new AppError('Channel and test target destination are required', 400);
    }

    const result = await announcementDeliveryService.sendControlledTest({
      channel,
      testTarget,
      customContent,
      isDryRun: isDryRun !== undefined ? isDryRun : false
    });

    return successResponse(res, {
      status: 200,
      message: `Controlled test to ${channel} executed`,
      data: result
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  broadcastAnnouncement,
  previewRecipients,
  getClubMembers,
  getProviderStatus,
  sendControlledTest
};
