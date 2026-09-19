const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const config = require('../../config/env');
const { AppError } = require('../../utils/errors');

/**
 * Parses raw file buffer and extracts text and page metadata.
 * @param {Buffer} buffer 
 * @param {string} originalName 
 * @param {string} mimeType 
 * @returns {Promise<{ fullText: string, pages: Array<{ pageNumber: number, text: string }>, fileType: string }>}
 */
const extractDocumentText = async (buffer, originalName = '', mimeType = '') => {
  if (!buffer || buffer.length === 0) {
    throw new AppError('Cannot parse empty file', 400);
  }

  const ext = path.extname(originalName).toLowerCase();
  const maxChars = config.maxExtractedTextLength || 100000;

  let fullText = '';
  const pages = [];
  let fileType = 'other';

  try {
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      fileType = 'pdf';
      const pdfData = await pdfParse(buffer, {
        // Custom pager renderer to capture per-page text if possible
        pagerender: function (pageData) {
          return pageData.getTextContent().then(function (textContent) {
            let lastY, text = '';
            for (const item of textContent.items) {
              if (lastY === item.transform[5] || !lastY) {
                text += item.str;
              } else {
                text += '\n' + item.str;
              }
              lastY = item.transform[5];
            }
            pages.push({
              pageNumber: pageData.pageIndex + 1,
              text: text.trim()
            });
            return text;
          });
        }
      });
      fullText = pdfData.text || '';
    } else if (
      ext === '.docx' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      fileType = 'docx';
      const result = await mammoth.extractRawText({ buffer });
      fullText = result.value || '';
    } else if (ext === '.json' || mimeType === 'application/json') {
      fileType = 'txt';
      const raw = buffer.toString('utf8');
      try {
        const parsed = JSON.parse(raw);
        fullText = typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(parsed);
      } catch {
        fullText = raw;
      }
    } else if (ext === '.md' || ext === '.txt' || mimeType.startsWith('text/')) {
      fileType = ext === '.md' ? 'txt' : (ext === '.txt' ? 'txt' : 'other');
      fullText = buffer.toString('utf8');
    } else {
      // Fallback
      fileType = 'other';
      fullText = buffer.toString('utf8');
    }
  } catch (err) {
    throw new AppError(`Failed to parse file: ${err.message}`, 400);
  }

  // Normalize text (trim, unify line endings)
  fullText = fullText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  if (!fullText) {
    throw new AppError('File contains no extractable text content', 400);
  }

  // Enforce maximum extracted text length
  if (fullText.length > maxChars) {
    fullText = fullText.substring(0, maxChars);
  }

  return {
    fullText,
    pages,
    fileType
  };
};

module.exports = {
  extractDocumentText
};
