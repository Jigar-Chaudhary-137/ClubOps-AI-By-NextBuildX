const Document = require('../models/Document');
const Event = require('../models/Event');
const config = require('../config/env');
const { AppError } = require('../utils/errors');
const { parsePagination, formatPagination, validateObjectId, escapeRegex } = require('../utils/pagination');
const { extractDocumentText } = require('../ai/rag/parser');
const { chunkDocument } = require('../ai/rag/chunker');
const { generateEmbeddingsBatch } = require('../ai/rag/embeddings');

/**
 * Uploads a physical file, parses content, chunks, generates embeddings, and saves.
 */
const uploadDocument = async (clubId, userId, file, data = {}) => {
  if (!file || !file.buffer) {
    throw new AppError('No file uploaded or file buffer is empty', 400);
  }

  const title = (data.title && data.title.trim()) || file.originalname || 'Untitled Document';

  let eventId = null;
  if (data.event) {
    validateObjectId(data.event, 'event ID');
    const event = await Event.findOne({ _id: data.event, club: clubId });
    if (!event) {
      throw new AppError('Event not found or does not belong to your club', 404);
    }
    eventId = data.event;
  }

  // 1. Extract text and page boundaries
  const extracted = await extractDocumentText(file.buffer, file.originalname, file.mimetype);

  const isKnowledgeBase = data.isKnowledgeBase !== undefined ? (data.isKnowledgeBase === 'true' || data.isKnowledgeBase === true) : true;

  const doc = new Document({
    title,
    description: data.description ? data.description.trim() : '',
    fileUrl: data.fileUrl || '',
    fileType: extracted.fileType || 'other',
    category: data.category || 'general',
    club: clubId,
    event: eventId,
    uploadedBy: userId,
    isKnowledgeBase,
    contentSummary: data.contentSummary || (extracted.fullText.substring(0, 300) + '...'),
    sourceFileName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size || file.buffer.length,
    extractedCharacterCount: extracted.fullText.length,
    ingestionStatus: isKnowledgeBase ? 'processing' : 'processed',
    embeddingModel: config.geminiEmbeddingModel || 'text-embedding-004',
    embeddingVersion: '1.0'
  });

  // If knowledge base document, perform chunking and embedding generation
  if (isKnowledgeBase) {
    try {
      // 2. Chunk document with page boundary preservation
      const chunks = chunkDocument(extracted.fullText, extracted.pages);

      // 3. Batch generate embeddings for chunks
      const chunkTexts = chunks.map((c) => c.text);
      const embeddings = await generateEmbeddingsBatch(chunkTexts);

      // 4. Attach embeddings to chunks
      doc.chunks = chunks.map((chunk, idx) => ({
        ...chunk,
        embedding: embeddings[idx] || []
      }));

      doc.chunkCount = doc.chunks.length;
      doc.ingestionStatus = 'processed';
      doc.processedAt = new Date();
      doc.ingestionError = null;
    } catch (err) {
      doc.ingestionStatus = 'failed';
      doc.ingestionError = err.message;
      doc.chunks = [];
      doc.chunkCount = 0;
    }
  }

  await doc.save();

  return doc.populate([
    { path: 'uploadedBy', select: 'name email avatarUrl' },
    { path: 'event', select: 'title status' }
  ]);
};

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

  const isKnowledgeBase = Boolean(data.isKnowledgeBase);
  const doc = new Document({
    title: data.title.trim(),
    description: data.description ? data.description.trim() : '',
    fileUrl: data.fileUrl || '',
    fileType: data.fileType || 'other',
    category: data.category || 'general',
    club: clubId,
    event: eventId,
    uploadedBy: userId,
    isKnowledgeBase,
    contentSummary: data.contentSummary || '',
    ingestionStatus: isKnowledgeBase ? 'pending' : 'processed',
    embeddingModel: config.geminiEmbeddingModel || 'text-embedding-004',
    embeddingVersion: '1.0'
  });

  // If textContent is passed directly in body (e.g. for markdown/text knowledge docs)
  if (data.textContent && data.textContent.trim() && isKnowledgeBase) {
    try {
      const extracted = await extractDocumentText(Buffer.from(data.textContent, 'utf8'), `${data.title}.txt`, 'text/plain');
      const chunks = chunkDocument(extracted.fullText, []);
      const embeddings = await generateEmbeddingsBatch(chunks.map((c) => c.text));

      doc.chunks = chunks.map((chunk, idx) => ({
        ...chunk,
        embedding: embeddings[idx] || []
      }));
      doc.chunkCount = doc.chunks.length;
      doc.extractedCharacterCount = extracted.fullText.length;
      doc.ingestionStatus = 'processed';
      doc.processedAt = new Date();
    } catch (err) {
      doc.ingestionStatus = 'failed';
      doc.ingestionError = err.message;
    }
  }

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

  if (query.ingestionStatus) {
    filter.ingestionStatus = query.ingestionStatus;
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
      .select('-chunks.embedding') // Omit large embedding vectors from default listing for performance
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
    .select('-chunks.embedding')
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
 * Deletes a document record and all its associated chunks.
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
  uploadDocument,
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
};

