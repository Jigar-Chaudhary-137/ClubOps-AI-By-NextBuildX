const path = require('path');
const pdfParseModule = require('pdf-parse');
const mammoth = require('mammoth');
const config = require('../../config/env');
const { AppError } = require('../../utils/errors');
const { extractTextWithGeminiVision } = require('./ocrService');

/**
 * Checks if extracted digital text has sufficient substance to be considered a digital text PDF.
 * @param {string} text 
 * @returns {boolean}
 */
const hasSufficientDigitalText = (text) => {
  if (!text || typeof text !== 'string') return false;
  const stripped = text.replace(/\s+/g, '');
  return stripped.length >= (config.ocrDigitalTextThreshold || 30);
};

/**
 * Parses raw file buffer and extracts text and page metadata.
 * Automatically falls back to Gemini Vision OCR for scanned PDFs and image files.
 *
 * @param {Buffer} buffer 
 * @param {string} originalName 
 * @param {string} mimeType 
 * @returns {Promise<{ fullText: string, pages: Array<{ pageNumber: number, text: string }>, fileType: string, isOcrProcessed: boolean, ocrEngine: string|null }>}
 */
const extractDocumentText = async (buffer, originalName = '', mimeType = '') => {
  if (!buffer || buffer.length === 0) {
    throw new AppError('Cannot parse empty file', 400);
  }

  const ext = path.extname(originalName).toLowerCase();
  const maxChars = config.maxExtractedTextLength || 100000;
  const normalizedMime = (mimeType || '').toLowerCase().trim();

  let fullText = '';
  let pages = [];
  let fileType = 'other';
  let isOcrProcessed = false;
  let ocrEngine = null;

  const totalStartTime = Date.now();

  try {
    // -------------------------------------------------------------
    // CASE 1: Image Files (PNG, JPG, JPEG, WEBP) -> Direct Vision OCR
    // -------------------------------------------------------------
    if (
      ext === '.png' ||
      ext === '.jpg' ||
      ext === '.jpeg' ||
      ext === '.webp' ||
      normalizedMime.startsWith('image/')
    ) {
      fileType = 'image';
      console.log(`[OCR] Image file detected ("${originalName}", ${normalizedMime}). Routing to Gemini Vision OCR...`);
      
      const ocrResult = await extractTextWithGeminiVision(buffer, normalizedMime || 'image/png');
      fullText = ocrResult.fullText;
      pages = ocrResult.pages;
      isOcrProcessed = true;
      ocrEngine = ocrResult.ocrEngine;

      const duration = Date.now() - totalStartTime;
      console.log(`[OCR] Image OCR completed in ${duration}ms (Pages: ${pages.length}, Chars: ${fullText.length})`);
    }

    // -------------------------------------------------------------
    // CASE 2: PDF Files -> Fast Digital Extraction with Automatic OCR Fallback
    // -------------------------------------------------------------
    else if (ext === '.pdf' || normalizedMime === 'application/pdf') {
      fileType = 'pdf';
      const digitalStartTime = Date.now();
      let digitalExtractedText = '';
      const digitalPages = [];

      try {
        // Support pdf-parse v2 (PDFParse class) and v1 (function)
        if (pdfParseModule.PDFParse) {
          const parser = new pdfParseModule.PDFParse({ data: buffer });
          const textResult = await parser.getText();
          digitalExtractedText = textResult.text || '';
          if (Array.isArray(textResult.pages)) {
            textResult.pages.forEach((p, idx) => {
              digitalPages.push({
                pageNumber: p.num || idx + 1,
                text: (p.text || '').trim()
              });
            });
          }
          await parser.destroy();
        } else if (typeof pdfParseModule === 'function') {
          const pdfData = await pdfParseModule(buffer);
          digitalExtractedText = pdfData.text || '';
        }
      } catch (pdfErr) {
        console.warn(`[OCR] Fast digital PDF parse failed (${pdfErr.message}). Falling back to Vision OCR.`);
        digitalExtractedText = '';
      }

      const digitalDuration = Date.now() - digitalStartTime;
      console.log(`[OCR] Digital extraction: ${digitalDuration}ms (Chars found: ${digitalExtractedText.trim().length})`);

      // Determine if digital extraction produced sufficient text
      if (hasSufficientDigitalText(digitalExtractedText)) {
        console.log(`[OCR] Scan detected: false (Digital PDF text layer verified)`);
        fullText = digitalExtractedText;
        pages = digitalPages.filter(p => p.text && p.text.trim().length > 0);
        isOcrProcessed = false;
        ocrEngine = null;
      } else {
        // Scanned / Image-only PDF detected -> Trigger Gemini Vision OCR
        console.log(`[OCR] Scan detected: true (Scanned/image-only PDF detected). Invoking Gemini Vision OCR...`);
        const ocrStartTime = Date.now();

        const ocrResult = await extractTextWithGeminiVision(buffer, 'application/pdf');
        fullText = ocrResult.fullText;
        pages = ocrResult.pages;
        isOcrProcessed = true;
        ocrEngine = ocrResult.ocrEngine;

        const ocrDuration = Date.now() - ocrStartTime;
        console.log(`[OCR] Gemini Vision PDF OCR completed in ${ocrDuration}ms (Pages: ${pages.length}, Chars: ${fullText.length})`);
      }
    }

    // -------------------------------------------------------------
    // CASE 3: DOCX / Word Files
    // -------------------------------------------------------------
    else if (
      ext === '.docx' ||
      ext === '.doc' ||
      normalizedMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      normalizedMime === 'application/msword'
    ) {
      fileType = 'docx';
      const result = await mammoth.extractRawText({ buffer });
      fullText = result.value || '';
      isOcrProcessed = false;
      ocrEngine = null;
    }

    // -------------------------------------------------------------
    // CASE 4: JSON Structured Data
    // -------------------------------------------------------------
    else if (ext === '.json' || normalizedMime === 'application/json') {
      fileType = 'txt';
      const raw = buffer.toString('utf8');
      try {
        const parsed = JSON.parse(raw);
        fullText = typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(parsed);
      } catch {
        fullText = raw;
      }
      isOcrProcessed = false;
      ocrEngine = null;
    }

    // -------------------------------------------------------------
    // CASE 5: Plain Text & Markdown Files
    // -------------------------------------------------------------
    else if (ext === '.md' || ext === '.txt' || normalizedMime.startsWith('text/')) {
      fileType = ext === '.md' ? 'txt' : (ext === '.txt' ? 'txt' : 'other');
      fullText = buffer.toString('utf8');
      isOcrProcessed = false;
      ocrEngine = null;
    }

    // -------------------------------------------------------------
    // CASE 6: Other / Fallback
    // -------------------------------------------------------------
    else {
      fileType = 'other';
      fullText = buffer.toString('utf8');
      isOcrProcessed = false;
      ocrEngine = null;
    }
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(`Failed to parse file: ${err.message}`, 400);
  }

  // Normalize text
  fullText = fullText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  if (!fullText) {
    throw new AppError('File contains no extractable text content', 400);
  }

  // Enforce maximum extracted text length
  if (fullText.length > maxChars) {
    fullText = fullText.substring(0, maxChars);
  }

  const totalDuration = Date.now() - totalStartTime;
  console.log(`[OCR] Total extraction: ${totalDuration}ms (FileType: ${fileType}, OCR: ${isOcrProcessed})`);

  return {
    fullText,
    pages,
    fileType,
    isOcrProcessed,
    ocrEngine
  };
};

module.exports = {
  extractDocumentText,
  hasSufficientDigitalText
};
