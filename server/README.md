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
