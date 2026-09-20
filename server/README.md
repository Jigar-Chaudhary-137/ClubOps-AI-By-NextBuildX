# ClubOps AI — Server

Backend REST API for ClubOps AI built with Node.js and Express.js.

## Ownership
* **Primary Owner**: Member 2 (Backend & AI Intelligence)
* **Scope**: Express architecture, PostgreSQL integration, authentication, business services, AI extraction, RAG, agent tool calling.

## Directory Layout
* `src/config/`: App and service environment configuration
* `src/controllers/`: Route controllers partitioned by domain
* `src/routes/`: Express endpoint route declarations
* `src/services/`: Core business logic layer
* `src/models/`: Domain entity models
* `src/repositories/`: Data access abstraction layer
* `src/middleware/`: Express middlewares (e.g. error handling, auth, validation)
* `src/validators/`: Input validation schemas
* `src/utils/`: Shared utilities and helpers
* `src/db/`: Database migrations, seed scripts, and raw queries
* `src/ai/`:
  * `gemini/`: Gemini client SDK initialization and adapters
  * `prompts/`: Structured system prompts
  * `extraction/`: Action-item, deadline, and owner extraction logic
  * `rag/`: Document chunking, embedding, and retrieval
  * `agents/`: AI event operations agent loop
  * `tools/`: Executable application action tools
  * `risk/`: Risk detection and rationale generation

## Development
```bash
npm install
npm run dev
```
Starts the server with nodemon on `http://localhost:5000`. Health check: `GET /health`.

## Document Ingestion & Vision OCR Pipeline
The backend ingestion engine automatically parses both digital files and scanned/image documents into structured RAG knowledge bases:

### Supported File Formats & MIME Types
* **PDF (`.pdf`, `application/pdf`)**: Digital text extraction via `pdf-parse` (fast path). If scanned or image-only ($<30$ extracted chars), automatically falls back to Gemini Multimodal Vision OCR.
* **Images (`.png`, `.jpg`, `.jpeg`, `.webp`)**: Direct Gemini Multimodal Vision OCR extraction with structure and page boundary preservation.
* **Word Documents (`.docx`, `.doc`)**: Structured text and table extraction via `mammoth`.
* **Structured Data (`.json`, `application/json`)**: Structured key-value text normalization.
* **Plain Text / Markdown (`.txt`, `.md`, `text/*`)**: UTF-8 text ingestion.

### Pipeline Flow
```
Upload (.pdf, .png, .jpg, .webp, .docx, .txt, .md, .json)
  ↓
Validation (Size, MIME, Extension, Club Scoping)
  ↓
Digital Extraction (pdf-parse / mammoth / text)
  ↓
Scan Detection (text < 30 chars or image format)
  ↓
Gemini Vision OCR (Prompt Injection Defense + Page Markers `--- PAGE N ---`)
  ↓
Page-Aware Chunking (chunker.js)
  ↓
Gemini Embeddings Generation (gemini-embedding-001)
  ↓
Multi-Tenant Vector Storage (MongoDB chunks with club isolation)
  ↓
Vector Semantic Search & RAG Synthesis with Verified Citations
```

### Document Metadata
* `isOcrProcessed` (Boolean): `true` if processed via Gemini Vision OCR, `false` for digital fast extraction.
* `ocrEngine` (String|null): Identifies the OCR engine used (`gemini-vision` or `null`).
* `extractedCharacterCount` (Number): Total characters extracted.
* `ingestionStatus` (String): `processing` | `processed` | `failed`.

### Environment Configuration
* `GEMINI_MODEL`: Gemini generative model (`gemini-3.6-flash`).
* `GEMINI_EMBEDDING_MODEL`: Gemini embedding model (`gemini-embedding-001`).
* `OCR_TIMEOUT_MS`: Timeout for multimodal vision requests (default: `30000ms`).
* `OCR_DIGITAL_TEXT_THRESHOLD`: Character threshold to classify PDFs as scanned (default: `30`).

