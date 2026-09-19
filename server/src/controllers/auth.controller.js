const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Handle user registration
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return successResponse(res, {
      status: 201,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return errorResponse(res, {
        status: error.statusCode,
        message: error.message
      });
    }
    // Handle Mongoose duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return errorResponse(res, {
        status: 409,
        message: `An account with this ${field} already exists`
      });
    }
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, {
        status: 400,
        message: messages.join(', ')
      });
    }
    next(error);
  }
};

/**
 * Handle user login
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    return successResponse(res, {
      status: 200,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return errorResponse(res, {
        status: error.statusCode,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return successResponse(res, {
      status: 200,
      message: 'Current user profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return errorResponse(res, {
        status: error.statusCode,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Handle club creation (Organizer/Admin only)
 */
const createClub = async (req, res, next) => {
  try {
    const club = await authService.createClub(req.user._id, req.body);
    return successResponse(res, {
      status: 201,
      message: 'Club created successfully',
      data: { club }
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return errorResponse(res, {
        status: error.statusCode,
        message: error.message
      });
    }
    if (error.code === 11000) {
      return errorResponse(res, {
        status: 409,
        message: 'Club code is already taken'
      });
    }
    next(error);
  }
};

/**
 * Handle joining an existing club via code
 */
const joinClub = async (req, res, next) => {
  try {
    const result = await authService.joinClub(req.user._id, req.body);
    return successResponse(res, {
      status: 200,
      message: 'Joined club successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return errorResponse(res, {
        status: error.statusCode,
        message: error.message
      });
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  createClub,
  joinClub
};
