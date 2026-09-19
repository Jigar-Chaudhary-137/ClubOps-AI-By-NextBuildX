# ClubOps AI — Backend API Contracts & Integration Guide

This document is the authoritative API contract specification for **Member 1 (Frontend)** connecting to the Stage 1–8 backend.

---

## 1. General Principles

### Base URL & Proxy
- Development API Base URL: `/api` (Proxied by Vite dev server to `http://localhost:5000`)
- Production API Base URL: `/api`

### Authentication Header
All protected endpoints require a valid JWT passed in the HTTP Authorization header:
```http
Authorization: Bearer <JWT_TOKEN>
```
*Never pass tokens in query parameters.*

### Standard Response Envelope
All REST API endpoints return the unified JSON envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Standard Error Response Envelope
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" }
  ]
}
```

---

## 2. Seeded Demo Credentials

| Role | Email | Password | Club Code | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Lead Organizer** | `lead@club.edu` | `Password123!` | `TECH2026` | Full administrative & organizer rights |
| **Volunteer (Tech)** | `rahul@club.edu` | `Password123!` | `TECH2026` | Skills: React, Cloud, Python |
| **Volunteer (Design)** | `priya@club.edu` | `Password123!` | `TECH2026` | Skills: Figma, Sponsorship, Stage Setup |
| **Volunteer (Ops)** | `alex@club.edu` | `Password123!` | `TECH2026` | Skills: Logistics, Audio/Visual |
| **Club Member** | `member@club.edu` | `Password123!` | `TECH2026` | Read-only member access |
| **Isolation Lead (Club B)**| `robo.lead@club.edu` | `Password123!` | `ROBO2026` | Used for testing cross-club isolation |

---

## 3. System & Health APIs

### `GET /api/health`
- **Auth**: Public
- **Description**: Basic health check with MongoDB readyState.

### `GET /api/health/full`
- **Auth**: Public
- **Description**: Subsystem diagnostics across MongoDB (ping latency), Gemini AI configuration, RAG document index, SSE real-time stats, and process memory/uptime.
- **Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-09-19T07:49:00.000Z",
    "responseTimeMs": 5,
    "services": {
      "mongodb": { "status": "healthy", "readyState": 1, "database": "clubops_ai", "latencyMs": 2 },
      "gemini": { "status": "healthy", "configured": true, "model": "gemini-1.5-flash" },
      "rag": { "status": "healthy", "embeddingDimension": 768, "totalDocuments": 4, "totalChunks": 8 },
      "realtime": { "status": "healthy", "activeConnections": 1, "uniqueUsers": 1, "uniqueClubs": 1, "eventListeners": 1 }
    },
    "process": { "nodeVersion": "v20.x", "platform": "win32", "uptimeSeconds": 120, "memoryMb": { "rss": 85.4, "heapUsed": 45.2, "heapTotal": 60.1 } }
  }
}
```

---

## 4. Authentication APIs

### `POST /api/auth/register`
- **Auth**: Public
- **Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@club.edu",
  "password": "Password123!",
  "role": "organizer",
  "department": "Engineering"
}
```
- **Response**: `{ success: true, data: { user: {...}, token: "..." } }`

### `POST /api/auth/login`
- **Auth**: Public
- **Body**:
```json
{
  "email": "lead@club.edu",
  "password": "Password123!"
}
```
- **Response**: `{ success: true, data: { user: { id, name, email, role, department, club }, token: "..." } }`

### `GET /api/auth/me`
- **Auth**: `Bearer <token>`
- **Response**: `{ success: true, data: { user: {...} } }`

### `POST /api/auth/club`
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Body**: `{ "name": "AI Club", "description": "...", "code": "AICLUB" }`

### `POST /api/auth/join-club`
- **Auth**: `Bearer <token>`
- **Body**: `{ "inviteCode": "TECH2026" }`

---

## 5. Domain CRUD APIs

### Events (`/api/events`)
- `GET /api/events` (Query: `page`, `limit`, `search`, `status`, `category`)
- `POST /api/events` (Roles: `admin`, `organizer`)
  - Body: `{ "title": "...", "description": "...", "startDate": "...", "endDate": "...", "location": "...", "venue": { "name": "...", "capacity": 200, "booked": true }, "category": "Hackathon", "budget": { "allocated": 5000, "currency": "USD" } }`
- `GET /api/events/:id`
- `GET /api/events/:id/overview` (Aggregated metrics: tasks count by status, risks count, meetings count)
- `PUT /api/events/:id` (Roles: `admin`, `organizer`)
- `DELETE /api/events/:id` (Roles: `admin`, `organizer`)

### Tasks (`/api/tasks`)
- `GET /api/tasks` (Query: `page`, `limit`, `search`, `status`, `priority`, `event`, `assignedTo`)
- `POST /api/tasks` (Roles: `admin`, `organizer`)
  - Body: `{ "title": "...", "description": "...", "event": "eventId", "assignedTo": "userId", "priority": "high", "dueDate": "..." }`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id` (Roles: `admin`, `organizer`)
- `PATCH /api/tasks/:id/status` (Roles: `admin`, `organizer`, `volunteer` assigned to task)
  - Body: `{ "status": "in_progress" }`
- `DELETE /api/tasks/:id` (Roles: `admin`, `organizer`)

### Volunteers (`/api/volunteers`)
- `GET /api/volunteers` (Query: `page`, `limit`, `search`, `availability`, `department`)
- `POST /api/volunteers`
  - Body: `{ "user": "userId", "skills": ["React", "Python"], "department": "Engineering", "availability": "available" }`
- `GET /api/volunteers/:id`
- `PUT /api/volunteers/:id`
- `DELETE /api/volunteers/:id` (Roles: `admin`, `organizer`)

### Meetings (`/api/meetings`)
- `GET /api/meetings` (Query: `page`, `limit`, `search`, `event`)
- `POST /api/meetings` (Roles: `admin`, `organizer`)
  - Body: `{ "title": "...", "event": "eventId", "scheduledAt": "...", "durationMinutes": 60, "agenda": ["..."], "notes": "...", "transcript": "..." }`
- `GET /api/meetings/:id`
- `PUT /api/meetings/:id` (Roles: `admin`, `organizer`)
- `DELETE /api/meetings/:id` (Roles: `admin`, `organizer`)

### Documents & Knowledge Base (`/api/documents`)
- `GET /api/documents` (Query: `page`, `limit`, `search`, `category`, `isKnowledgeBase`)
- `POST /api/documents/upload` (Multipart form-data: `file`, `title`, `description`, `category`, `isKnowledgeBase`)
- `GET /api/documents/:id`
- `PUT /api/documents/:id` (Roles: `admin`, `organizer`)
- `DELETE /api/documents/:id` (Roles: `admin`, `organizer`)

### Risks (`/api/risks`)
- `GET /api/risks` (Query: `page`, `limit`, `search`, `severity`, `status`, `event`)
- `POST /api/risks` (Roles: `admin`, `organizer`)
  - Body: `{ "title": "...", "description": "...", "severity": "high", "probability": "medium", "status": "identified", "event": "eventId", "mitigationPlan": "..." }`
- `GET /api/risks/:id`
- `PUT /api/risks/:id` (Roles: `admin`, `organizer`)
- `DELETE /api/risks/:id` (Roles: `admin`, `organizer`)

### Announcements & Multi-Channel Broadcast (`/api/announcements`)
- `GET /api/announcements` (Query: `page`, `limit`, `search`, `status`, `priority`)
- `POST /api/announcements` (Roles: `admin`, `organizer`)
  - Body: `{ "title": "...", "content": "...", "targetAudience": "all", "priority": "high", "event": "eventId" }`
- `GET /api/announcements/:id`
- `PUT /api/announcements/:id` (Roles: `admin`, `organizer`)
- `DELETE /api/announcements/:id` (Roles: `admin`, `organizer`)
- `POST /api/announcements/:id/broadcast` (Roles: `admin`, `organizer`)
  - Body: `{ "channels": ["in_app", "email", "whatsapp"], "targetRoles": ["volunteer"] }`
  - Response:
```json
{
  "success": true,
  "message": "Broadcast completed across 3 channels",
  "data": {
    "announcementId": "...",
    "recipientCount": 3,
    "channels": {
      "in_app": { "dispatched": 3, "failed": 0 },
      "email": { "dispatched": 3, "failed": 0, "simulated": true },
      "whatsapp": { "dispatched": 3, "failed": 0, "simulated": true }
    }
  }
}
```

---

## 6. Real-Time SSE & Notifications APIs

### `GET /api/notifications/stream`
- **Auth**: `Authorization: Bearer <token>` in HTTP Header
- **Query (Optional)**: `?eventId=<eventId>`
- **Response Format**: `text/event-stream`
- **SSE Events Dispatched**:
  - `event: connected` -> `{ status: "connected", connectionId: "..." }`
  - `event: heartbeat` -> `{ timestamp: "..." }`
  - `event: notification` -> Full notification object for direct alerts
  - `event: task.updated` -> Real-time task board synchronization
  - `event: risk.critical` -> High-severity risk banner trigger
  - `event: announcement.broadcast` -> Broadcast announcement banner
  - `event: meeting.action` -> Meeting action extraction update

### `GET /api/notifications`
- **Auth**: `Bearer <token>`
- **Query**: `page`, `limit`, `read` (boolean)

### `GET /api/notifications/unread-count`
- **Auth**: `Bearer <token>`
- **Response**: `{ success: true, data: { unreadCount: 4 } }`

### `PATCH /api/notifications/:id/read`
- **Auth**: `Bearer <token>`

### `PATCH /api/notifications/read-all`
- **Auth**: `Bearer <token>`

---

## 7. AI Intelligence & Operations Agent APIs

### `POST /api/ai/plan-event`
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Body**: `{ "title": "Hackathon 2026", "category": "Tech", "targetDate": "2026-10-15", "budget": 5000, "venue": "Auditorium", "expectedAttendees": 250 }`
- **Response**: Structured milestones, task breakdowns, suggested owner roles, logistics.

### `POST /api/ai/events/:id/apply-plan`
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Body**: `{ "plan": { "milestones": [...], "tasks": [...] } }`
- **Description**: 1-click instantiation of AI plan into actual Task documents.

### `POST /api/ai/process-meeting/:id`
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Description**: Ingests meeting transcript, extracts structured action items, and persists on meeting document.

### `POST /api/ai/extract-actions`
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Body**: `{ "transcript": "...", "rawNotes": "..." }`

### `POST /api/ai/meetings/:id/apply-actions`
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Body**: `{ "actions": [ { "title": "Audio setup", "assignedTo": "Alex Chen", "deadline": "Friday", "priority": "high" } ] }`
- **Description**: 1-click conversion of reviewed action items into Tasks + volunteer assignment.

### `POST /api/ai/analyze-risks/:eventId`
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Description**: Analyzes overdue tasks, unassigned critical tasks, venue status, returning proactive risks & mitigations.

### `POST /api/ai/generate-announcement`
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Body**: `{ "topic": "...", "keyDetails": "...", "targetAudience": "all", "tone": "enthusiastic", "urgency": "normal", "channel": "all" }`

### `POST /api/ai/agent/chat` (Autonomous Operations Agent)
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Body**:
```json
{
  "message": "Create a high priority task for stage sound testing and assign to Rahul",
  "conversationHistory": [],
  "dryRun": false,
  "confirmedActions": []
}
```
- **Response**: Returns conversational text response, `toolCalls` executed, `actionReceipts` with created record IDs, and dry-run previews if `dryRun: true`.

### `POST /api/ai/knowledge/query` (Grounded RAG)
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Body**: `{ "query": "What is our reimbursement policy for meals?", "topK": 5 }`
- **Response**: Grounded natural language answer synthesized with citations:
```json
{
  "success": true,
  "data": {
    "query": "What is our reimbursement policy for meals?",
    "answer": "Meals outside scheduled volunteer shifts are ineligible for reimbursement...",
    "citations": [
      {
        "documentId": "...",
        "title": "Reimbursement Policy",
        "chunkIndex": 1,
        "similarity": 0.88,
        "textSnippet": "Ineligible Expenses: Personal dining expenses outside scheduled shifts..."
      }
    ]
  }
}
```

### `POST /api/ai/knowledge/search`
- **Auth**: `Bearer <token>` (Admin/Organizer)
- **Body**: `{ "query": "Sponsorship tiers", "limit": 5 }`

---

## 8. Authoritative Enum Values Reference

```javascript
// Task Model
Task.status = ['todo', 'in_progress', 'review', 'completed', 'cancelled']
Task.priority = ['low', 'medium', 'high', 'urgent']

// Event Model
Event.status = ['draft', 'planning', 'ready', 'active', 'completed', 'cancelled']

// Volunteer Model
Volunteer.availability = ['available', 'assigned', 'busy', 'unavailable']

// Document Model
Document.category = ['guidelines', 'report', 'rules', 'sponsorship', 'budget', 'minutes', 'general', 'other']
Document.ingestionStatus = ['pending', 'processing', 'processed', 'failed']

// Risk Model
Risk.severity = ['low', 'medium', 'high', 'critical']
Risk.status = ['identified', 'mitigated', 'accepted', 'resolved']
Risk.probability = ['low', 'medium', 'high']

// Announcement Model
Announcement.targetAudience = ['all', 'organizers', 'volunteers', 'members']
Announcement.priority = ['low', 'normal', 'high', 'urgent']
Announcement.status = ['draft', 'published', 'archived']

// Broadcast Model
BroadcastDelivery.channel = ['in_app', 'email', 'whatsapp']
BroadcastDelivery.status = ['pending', 'delivered', 'failed']

// Notification Model
Notification.type = ['task_assigned', 'task_updated', 'risk_critical', 'announcement_broadcast', 'meeting_action']
Notification.priority = ['low', 'normal', 'high', 'urgent']
```
