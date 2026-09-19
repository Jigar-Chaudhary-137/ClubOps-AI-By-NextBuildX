const taskService = require('../services/task.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { AppError } = require('../utils/errors');

const createTask = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const task = await taskService.createTask(clubId, req.user._id, req.body);
    return successResponse(res, {
      status: 201,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await taskService.getTasks(clubId, req.query);
    return successResponse(res, {
      status: 200,
      message: 'Tasks retrieved successfully',
      data: result.tasks,
      pagination: result.pagination
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const task = await taskService.getTaskById(clubId, req.params.id);
    return successResponse(res, {
      status: 200,
      message: 'Task retrieved successfully',
      data: { task }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const task = await taskService.updateTask(clubId, req.params.id, req.body);
    return successResponse(res, {
      status: 200,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const task = await taskService.updateTaskStatus(clubId, req.user, req.params.id, req.body.status);
    return successResponse(res, {
      status: 200,
      message: 'Task status updated successfully',
      data: { task }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await taskService.deleteTask(clubId, req.params.id);
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
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
};
