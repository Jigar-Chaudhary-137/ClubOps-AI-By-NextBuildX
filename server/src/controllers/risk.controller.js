const riskService = require('../services/risk.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { AppError } = require('../utils/errors');

const createRisk = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const risk = await riskService.createRisk(clubId, req.user._id, req.body);
    return successResponse(res, {
      status: 201,
      message: 'Risk item created successfully',
      data: { risk }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getRisks = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await riskService.getRisks(clubId, req.query);
    return successResponse(res, {
      status: 200,
      message: 'Risks retrieved successfully',
      data: result.risks,
      pagination: result.pagination
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getRiskById = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const risk = await riskService.getRiskById(clubId, req.params.id);
    return successResponse(res, {
      status: 200,
      message: 'Risk item retrieved successfully',
      data: { risk }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const updateRisk = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const risk = await riskService.updateRisk(clubId, req.params.id, req.body);
    return successResponse(res, {
      status: 200,
      message: 'Risk item updated successfully',
      data: { risk }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const deleteRisk = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await riskService.deleteRisk(clubId, req.params.id);
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

module.exports = {
  createRisk,
  getRisks,
  getRiskById,
  updateRisk,
  deleteRisk
};
