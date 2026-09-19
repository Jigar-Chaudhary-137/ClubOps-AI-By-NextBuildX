const documentService = require('../services/document.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { AppError } = require('../utils/errors');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const document = await documentService.uploadDocument(clubId, req.user._id, req.file, req.body);
    return successResponse(res, {
      status: 201,
      message: 'Document uploaded and processed successfully',
      data: { document }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const createDocument = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const document = await documentService.createDocument(clubId, req.user._id, req.body);
    return successResponse(res, {
      status: 201,
      message: 'Document metadata registered successfully',
      data: { document }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await documentService.getDocuments(clubId, req.query);
    return successResponse(res, {
      status: 200,
      message: 'Documents retrieved successfully',
      data: result.documents,
      pagination: result.pagination
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const document = await documentService.getDocumentById(clubId, req.params.id);
    return successResponse(res, {
      status: 200,
      message: 'Document retrieved successfully',
      data: { document }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const document = await documentService.updateDocument(clubId, req.params.id, req.body);
    return successResponse(res, {
      status: 200,
      message: 'Document updated successfully',
      data: { document }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, { status: error.statusCode, message: error.message });
    }
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    if (!req.user.club) {
      throw new AppError('User is not associated with any club', 400);
    }
    const clubId = req.user.club._id || req.user.club;
    const result = await documentService.deleteDocument(clubId, req.params.id);
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
  uploadDocument,
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
};
