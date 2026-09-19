# ClubOps AI — System Architecture

## Overview

ClubOps AI is a multi-tenant, AI-native event operations platform. The system comprises a React 18 frontend (Vite), an Express 4.x REST API backend, MongoDB for persistence, and a fully self-contained AI subsystem powered by Google Gemini 1.5 Flash.

---

## Request Lifecycle

```
Browser → React (Vite:5173)
       → Axios API Client (/api/*)
       → Vite Proxy → Express (localhost:5000)
       → Helmet / CORS / Morgan
       → JWT Auth Middleware
       → RBAC Middleware
       → Club Isolation Middleware (injects {club: req.user.club})
       → Route Handler (Controller)
       → Service Layer
       → Mongoose / MongoDB
```

---

## Data Models (12 Collections)

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `User` | email, password, role, club | Auth & membership |
| `Club` | name, code, members | Multi-tenant root |
| `Event` | title, status, venue, dates | Event lifecycle |
| `Task` | title, status, priority, assignedTo | Task tracking |
| `Volunteer` | name, department, skills, availability | Volunteer registry |
| `Meeting` | title, transcript, actionItems | Meeting intelligence |
| `Risk` | title, severity, probability, mitigation | Risk register |
| `Document` | title, chunks[], embeddings[], ingestionStatus | RAG knowledge base |
| `Announcement` | title, content, audience, priority | Broadcast management |
| `Notification` | type, recipient, message, read | In-app notifications |
| `BroadcastDelivery` | announcement, channel, status | Delivery audit trail |

---

## Multi-Tenancy Isolation

Every authenticated request carries `req.user.club` (MongoDB ObjectId). The club isolation middleware automatically injects `{ club: req.user.club }` into every DB query.

- **Query isolation:** Cross-club data access is architecturally impossible
- **RAG isolation:** Vector searches are scoped per-club via `clubId` filter
- **Agent isolation:** The Operations Agent only accesses data within the authenticated club

---

## Authentication Flow

```
POST /api/auth/login
  → bcryptjs password compare
  → JWT signed (HS256, configurable expiry)
  → Token stored client-side

Protected routes:
  → Authorization: Bearer <JWT>
  → auth.middleware.js decodes token
  → req.user = { id, club, role }
  → rbac.middleware.js checks permissions
```

**Roles:** `admin` (full access) · `organizer` (full club access) · `volunteer` (read + own tasks)

---

## Real-Time SSE Architecture

Native Node.js Server-Sent Events without Socket.io:

```
GET /api/notifications/stream
  → SSE connection established per authenticated client
  → In-memory client registry (keyed by clubId)
  → 30s heartbeat ping keeps connections alive
  → Auto-cleanup on client disconnect

notification.service.js:
  → emit(clubId, type, payload)
  → Broadcasts to all SSE clients in that club
```

---

## Document Ingestion Pipeline

```
POST /api/documents (multipart/form-data)
  → Multer: stores file buffer in memory
  → parser.js: PDF (pdf-parse) or DOCX (mammoth) → plain text
  → chunker.js: sliding window 512 tokens / 50 token overlap
  → embeddings.js: Gemini text-embedding-004 (768-dim vectors)
                   OR deterministic DJB2+trigram fallback
  → vectorStore.js: chunks[] persisted in Document MongoDB doc
  → ingestionStatus: pending → processing → processed
```

---

## AI Operations Agent Flow

```
POST /api/ai/agent/chat { message, dryRun, eventId }
  → operationsAgent.js initializes Gemini session
  → Gemini 1.5 Flash function-calling mode
  → Agent selects from 10 registered tool declarations
  → dryRun=true: returns planned action for human review
  → dryRun=false: toolExecutors.js performs DB mutation
  → Multi-turn conversation with persisted history
```

---

## Security Layers

1. **Helmet.js** — HTTP security headers (XSS, clickjacking, HSTS)
2. **CORS** — Configurable origin allowlist
3. **JWT** — HS256 signed, expiry-checked on every request
4. **RBAC** — Role-checked per route handler
5. **Club Isolation** — Automatic query scoping, no bypass possible
6. **Agent Dry-Run** — All mutations preview before execution
7. **Schema Validation** — All 12 Mongoose models have strict validation
