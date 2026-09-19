const Document = require('../models/Document');
const Event = require('../models/Event');
const { AppError } = require('../utils/errors');
const { parsePagination, formatPagination, validateObjectId, escapeRegex } = require('../utils/pagination');

/**
 * Registers document metadata scoped to the club.
 */
const createDocument = async (clubId, userId, data) => {
  if (!data.title || !data.title.trim()) {
    throw new AppError('Document title is required', 400);
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

  const doc = new Document({
    title: data.title.trim(),
    description: data.description ? data.description.trim() : '',
    fileUrl: data.fileUrl || '',
    fileType: data.fileType || 'other',
    category: data.category || 'general',
    club: clubId,
    event: eventId,
    uploadedBy: userId,
    isKnowledgeBase: Boolean(data.isKnowledgeBase),
    contentSummary: data.contentSummary || ''
  });

  await doc.save();
  return doc.populate([
    { path: 'uploadedBy', select: 'name email avatarUrl' },
    { path: 'event', select: 'title status' }
  ]);
};

/**
 * Lists documents with filtering by category, knowledge base, event, search, and pagination.
 */
const getDocuments = async (clubId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = { club: clubId };

  if (query.event) {
    validateObjectId(query.event, 'event ID');
    filter.event = query.event;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.isKnowledgeBase !== undefined) {
    filter.isKnowledgeBase = query.isKnowledgeBase === 'true' || query.isKnowledgeBase === true;
  }

  if (query.fileType) {
    filter.fileType = query.fileType;
  }

  if (query.search) {
    const searchPattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: searchPattern }, { description: searchPattern }, { contentSummary: searchPattern }];
  }

  const [documents, total] = await Promise.all([
    Document.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name email avatarUrl')
      .populate('event', 'title status'),
    Document.countDocuments(filter)
  ]);

  return {
    documents,
    pagination: formatPagination(total, page, limit)
  };
};

/**
 * Retrieves a single document by ID.
 */
const getDocumentById = async (clubId, docId) => {
  validateObjectId(docId, 'document ID');

  const doc = await Document.findOne({ _id: docId, club: clubId })
    .populate('uploadedBy', 'name email avatarUrl')
    .populate('event', 'title status startDate endDate');

  if (!doc) {
    throw new AppError('Document not found', 404);
  }

  return doc;
};

/**
 * Updates document metadata.
 */
const updateDocument = async (clubId, docId, data) => {
  validateObjectId(docId, 'document ID');

  const doc = await Document.findOne({ _id: docId, club: clubId });
  if (!doc) {
    throw new AppError('Document not found', 404);
  }

  if (data.event !== undefined) {
    if (data.event) {
      validateObjectId(data.event, 'event ID');
      const event = await Event.findOne({ _id: data.event, club: clubId });
      if (!event) {
        throw new AppError('Event not found or does not belong to your club', 404);
      }
      doc.event = data.event;
    } else {
      doc.event = null;
    }
  }

  if (data.title !== undefined) doc.title = data.title.trim();
  if (data.description !== undefined) doc.description = data.description.trim();
  if (data.fileUrl !== undefined) doc.fileUrl = data.fileUrl;
  if (data.fileType !== undefined) doc.fileType = data.fileType;
  if (data.category !== undefined) doc.category = data.category;
  if (data.isKnowledgeBase !== undefined) doc.isKnowledgeBase = Boolean(data.isKnowledgeBase);
  if (data.contentSummary !== undefined) doc.contentSummary = data.contentSummary;

  await doc.save();
  return doc.populate([
    { path: 'uploadedBy', select: 'name email avatarUrl' },
    { path: 'event', select: 'title status' }
  ]);
};

/**
 * Deletes a document record.
 */
const deleteDocument = async (clubId, docId) => {
  validateObjectId(docId, 'document ID');

  const doc = await Document.findOneAndDelete({ _id: docId, club: clubId });
  if (!doc) {
    throw new AppError('Document not found', 404);
  }

  return { id: docId, message: 'Document deleted successfully' };
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
};
