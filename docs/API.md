# ClubOps AI — API Reference

All endpoints are prefixed with `/api`. Authentication is via `Authorization: Bearer <JWT>` unless marked **Public**.

---

## Authentication

### POST /api/auth/register (Public)
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@club.edu",
  "password": "Password123!",
  "role": "organizer",
  "clubCode": "TECH2026"
}
```

**Response 201:**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "id": "...", "name": "John Doe", "email": "...", "role": "organizer" }
}
```

---

### POST /api/auth/login (Public)
Login with email and password.

**Request:**
```json
{ "email": "lead@club.edu", "password": "Password123!" }
```

**Response 200:**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "id": "...", "name": "...", "role": "organizer", "club": "..." }
}
```

---

### GET /api/auth/me
Returns the authenticated user profile.

---

## Events

### GET /api/events
List all events for the authenticated club.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Tech Fest 2026",
      "status": "planning",
      "startDate": "2026-03-15T00:00:00.000Z",
      "endDate": "2026-03-16T00:00:00.000Z",
      "venue": { "name": "Main Auditorium", "capacity": 500 },
      "club": "..."
    }
  ],
  "count": 1
}
```

---

### POST /api/events
Create a new event.

**Request:**
```json
{
  "title": "Annual Hackathon",
  "description": "24-hour coding event",
  "startDate": "2026-04-10T09:00:00.000Z",
  "endDate": "2026-04-11T09:00:00.000Z",
  "venue": { "name": "Lab Block A", "address": "Campus", "capacity": 200 },
  "expectedAttendees": 150,
  "status": "planning"
}
```

**Response 201:** Created event object.

---

### GET /api/events/:id
Get detailed event information.

---

### PATCH /api/events/:id
Update event fields. Same schema as POST.

---

## Tasks

### GET /api/tasks
List tasks. Optionally filter: `?eventId=<id>&status=todo&assignedTo=<userId>`.

### POST /api/tasks
Create a task.

**Request:**
```json
{
  "title": "Set up registration desk",
  "description": "Arrange tables and badges",
  "eventId": "...",
  "assignedTo": "...",
  "priority": "high",
  "dueDate": "2026-04-09T18:00:00.000Z",
  "status": "todo"
}
```

### PATCH /api/tasks/:id/status
Update task status.

**Request:** `{ "status": "completed" }`

**Status values:** `todo` · `in_progress` · `review` · `completed` · `cancelled`

---

## Volunteers

### GET /api/volunteers
List volunteers. Filter: `?department=Logistics&availability=available`.

### POST /api/volunteers
Register a volunteer.

**Request:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@club.edu",
  "phone": "+91 9876543210",
  "department": "Technical",
  "skills": ["Audio/Visual", "Stage Setup"],
  "availability": "available"
}
```

### PATCH /api/volunteers/:id/availability
Update volunteer availability state: `available` · `on-duty` · `unavailable`.

---

## Meetings

### GET /api/meetings
List meetings for the club.

### POST /api/meetings
Create a meeting record with optional transcript.

**Request:**
```json
{
  "title": "Venue Coordination Meeting",
  "date": "2026-03-20T14:00:00.000Z",
  "attendees": ["Alice", "Bob", "Rahul"],
  "transcript": "Alice: We need to confirm catering by Friday...",
  "notes": "..."
}
```

---

## Risks

### GET /api/risks
List risks. Filter: `?eventId=<id>&severity=high`.

### POST /api/risks
Create a risk entry.

**Request:**
```json
{
  "eventId": "...",
  "title": "AV Equipment Failure",
  "description": "Primary projector may fail during keynote",
  "severity": "high",
  "probability": "medium",
  "mitigationPlan": "Reserve backup projector from AV department"
}
```

**Severity values:** `low` · `medium` · `high` · `critical`
**Probability values:** `low` · `medium` · `high`

---

## Documents

### GET /api/documents
List documents. Filter: `?isKnowledgeBase=true&category=budget`.

### POST /api/documents (multipart/form-data)
Upload a document for RAG indexing.

**Form fields:**
- `file` — PDF, DOCX, or TXT file
- `title` — Document title
- `category` — `guidelines` · `report` · `rules` · `sponsorship` · `budget` · `minutes` · `general`
- `isKnowledgeBase` — `true` to index for RAG
- `eventId` — Optional, scopes to an event

---

## Announcements

### POST /api/announcements
Create an announcement.

**Request:**
```json
{
  "title": "Schedule Update — Tech Fest 2026",
  "content": "The opening ceremony has been moved to 10 AM.",
  "targetAudience": "all",
  "priority": "high",
  "eventId": "..."
}
```

**Audience values:** `all` · `organizers` · `volunteers` · `members`
**Priority values:** `low` · `normal` · `high` · `urgent`

### POST /api/announcements/:id/broadcast
Dispatch a multi-channel broadcast.

**Request:**
```json
{ "channels": ["in_app", "email", "whatsapp"] }
```

---

## AI Endpoints

### POST /api/ai/agent/chat
Invoke the AI Operations Agent.

**Request:**
```json
{
  "message": "Create a high priority task for stage sound testing and assign to Rahul",
  "dryRun": true,
  "eventId": "...",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "response": "I'll create a high priority task 'Stage Sound Testing' assigned to Rahul. Shall I proceed?",
  "plannedActions": [{ "tool": "create_task", "args": {...} }],
  "requiresConfirmation": true
}
```

---

### POST /api/ai/process-meeting/:id
Process a meeting transcript to extract structured data.

---

### POST /api/ai/extract-actions
Extract action items from a meeting transcript.

**Request:**
```json
{
  "meetingId": "...",
  "transcript": "Bob: I'll handle venue booking by Monday..."
}
```

**Response:**
```json
{
  "success": true,
  "actionItems": [
    {
      "title": "Handle venue booking",
      "assignee": "Bob",
      "deadline": "2026-03-24",
      "confidence": 0.92
    }
  ]
}
```

---

### POST /api/ai/analyze-risks/:eventId
Run AI risk analysis on an event.

**Response:**
```json
{
  "success": true,
  "risks": [
    {
      "title": "Low Volunteer Coverage",
      "severity": "high",
      "probability": "medium",
      "explanation": "Event has 8 tasks but only 3 available volunteers.",
      "mitigationPlan": "Recruit 5 additional volunteers from the general pool."
    }
  ]
}
```

---

### POST /api/ai/knowledge/query
Query the RAG knowledge base with a natural language question.

**Request:**
```json
{ "query": "What is our reimbursement policy for meals?", "topK": 3 }
```

**Response:**
```json
{
  "success": true,
  "answer": "Meal reimbursements are capped at ₹500 per person per day...",
  "sources": [
    { "title": "Expense Policy 2026", "category": "guidelines", "pageNumber": 3 }
  ]
}
```

---

### POST /api/ai/knowledge/search
Raw semantic chunk search (without LLM synthesis).

**Request:**
```json
{ "query": "venue deposit payment", "topK": 5, "threshold": 0.7 }
```

---

### POST /api/ai/generate-announcement
AI-assisted announcement drafting.

**Request:**
```json
{
  "context": "Opening ceremony moved from 9 AM to 10 AM due to AV setup delay",
  "audience": "all",
  "priority": "high"
}
```

---

## Health

### GET /api/health
Basic health check. Returns `{ status: "ok" }`.

### GET /api/health/full
Full subsystem diagnostics including MongoDB connection, Gemini API reachability, and SSE client count.
