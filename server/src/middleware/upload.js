const multer = require('multer');
const path = require('path');
const config = require('../config/env');
const { AppError } = require('../utils/errors');

// Allowed extensions and MIME types
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.txt', '.md', '.docx', '.json']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/json',
  'application/octet-stream' // checked with extension
]);

// Memory storage for fast parsing and zero disk-leakage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new AppError(
        `Unsupported file extension "${ext}". Allowed types: .pdf, .txt, .md, .docx, .json`,
        400
      ),
      false
    );
  }

  if (mime && !ALLOWED_MIME_TYPES.has(mime) && !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new AppError(
        `Unsupported MIME type "${mime}". Allowed types: PDF, Text, Markdown, Word, JSON`,
        400
      ),
      false
    );
  }

  cb(null, true);
};

const maxSizeBytes = (config.maxDocumentSizeMb || 10) * 1024 * 1024;

const upload = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
    files: 1
  },
  fileFilter
});

/**
 * Middleware wrapper to catch Multer errors and convert to AppError.
 */
const handleDocumentUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError(`File exceeds maximum size limit of ${config.maxDocumentSizeMb || 10}MB`, 400)
        );
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = {
  upload,
  handleDocumentUpload,
  ALLOWED_EXTENSIONS
};
