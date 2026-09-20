# ClubOps AI — API Reference Documentation

All endpoints are mounted under `/api`. All protected endpoints require a valid JWT token in the `Authorization` header: `Bearer <token>`.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register` (Public)
Register a new user and associate with a club via `clubCode`.

**Request Body:**
```json
{
  "name": "Priya Shah",
  "email": "priya@club.edu",
  "password": "Password123!",
  "role": "volunteer",
  "clubCode": "TECH2026",
  "phone": "+919876543210"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "<JWT_TOKEN>",
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c001",
      "name": "Priya Shah",
      "email": "priya@club.edu",
      "role": "volunteer",
      "phone": "+919876543210",
      "whatsappNumber": "+919876543210",
      "club": "65f1a2b3c4d5e6f7a8b9c000"
    }
  }
}
```

### `POST /api/auth/login` (Public)
Authenticate with email and password to receive a JWT session token.

**Request Body:**
```json
{
  "email": "lead@club.edu",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT_TOKEN>",
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c002",
      "name": "Lead Organizer",
      "email": "lead@club.edu",
      "role": "organizer",
      "club": "65f1a2b3c4d5e6f7a8b9c000"
    }
  }
}
```

### `GET /api/auth/me`
Retrieve authenticated user profile and club metadata.

---

## 2. Events (`/api/events`)

### `GET /api/events`
List all events for the authenticated club. Supports pagination and status filters (`?status=planning&page=1&limit=20`).

### `POST /api/events`
Create a new club event.

**Request Body:**
```json
{
  "title": "AI Innovators Hackathon 2026",
  "description": "24-hour collegiate hackathon and technical workshops",
  "startDate": "2026-04-10T09:00:00.000Z",
  "endDate": "2026-04-11T18:00:00.000Z",
  "venue": {
    "name": "Main Campus Auditorium",
    "address": "Block C, Innovation Wing",
    "capacity": 300
  },
  "expectedAttendees": 250,
  "status": "planning"
}
```

### `GET /api/events/:id`
Retrieve detailed event info, linked milestones, and task counts.

### `PATCH /api/events/:id`
Update event details, dates, or status (`planning`, `active`, `completed`, `cancelled`).

---

## 3. Tasks (`/api/tasks`)

### `GET /api/tasks`
List tasks for the club. Filters: `?event=<id>&status=todo&priority=high&assignedTo=<userId>`.

### `POST /api/tasks`
Create a new tracked task.

**Request Body:**
```json
{
  "title": "Finalize Auditorium Audio System",
  "description": "Coordinate with campus AV team for 4 wireless mics and backup projector",
  "event": "65f1a2b3c4d5e6f7a8b9c010",
  "assignedTo": "65f1a2b3c4d5e6f7a8b9c001",
  "priority": "high",
  "dueDate": "2026-04-08T18:00:00.000Z",
  "status": "todo"
}
```

### `PATCH /api/tasks/:id/status`
Update task workflow status (`todo`, `in_progress`, `review`, `completed`, `cancelled`).

### `PATCH /api/tasks/:id/assign`
Reassign task to a specific club member.

---

## 4. Volunteers (`/api/volunteers`)

### `GET /api/volunteers`
List volunteers in the club. Filters: `?department=Logistics&availability=available`.

### `POST /api/volunteers`
Register a volunteer. Supports existing user email or creates a new user under the club.

**Request Body:**
```json
{
  "name": "Rahul Patel",
  "email": "rahul@club.edu",
  "phone": "+919812345678",
  "department": "Technical",
  "availability": "available",
  "skills": ["React", "Audio Setup", "Registration"],
  "notes": "Available Saturday mornings"
}
```

### `PATCH /api/volunteers/:id`
Update volunteer profile fields (updates both `User` document contact info and `Volunteer` document metadata).

---

## 5. Meetings (`/api/meetings`)

### `GET /api/meetings`
List meetings for the club.

### `POST /api/meetings`
Create a meeting record with optional agenda and transcript text.

**Request Body:**
```json
{
  "title": "Sponsorship & Logistics Review",
  "event": "65f1a2b3c4d5e6f7a8b9c010",
  "date": "2026-03-25T15:00:00.000Z",
  "attendees": ["Alice", "Bob", "Rahul"],
  "transcript": "Alice: We need to confirm catering numbers by Thursday...",
  "notes": "Discussed catering options and badge printing."
}
```

### `GET /api/meetings/:id`
Retrieve meeting details, stored summary, and extracted action items.

---

## 6. Risks (`/api/risks`)

### `GET /api/risks`
List risks for the club. Filter: `?event=<id>&severity=high`.

### `POST /api/risks`
Log an operational risk.

**Request Body:**
```json
{
  "event": "65f1a2b3c4d5e6f7a8b9c010",
  "title": "AV Equipment Bottleneck",
  "description": "Only one backup projector available for two concurrent tracks",
  "severity": "high",
  "probability": "medium",
  "mitigationPlan": "Reserve secondary projector from the Department of Computer Science"
}
```

---

## 7. Documents & RAG Knowledge Base (`/api/documents`)

### `GET /api/documents`
List uploaded documents. Filter: `?isKnowledgeBase=true`.

### `POST /api/documents` (multipart/form-data)
Upload a document (PDF, DOCX, TXT, MD) for text extraction, chunking, and 768-dim vector embedding.

**Form Fields:**
- `file` (File buffer)
- `title` (Document title)
- `category` (`guidelines`, `report`, `rules`, `sponsorship`, `budget`, `minutes`, `general`)
- `isKnowledgeBase` (`true`)
- `event` (Optional event ID)

### `POST /api/documents/rag-query`
Perform grounded RAG Q&A on club knowledge.

**Request Body:**
```json
{
  "query": "What is the maximum reimbursement for meals?",
  "topK": 5,
  "threshold": 0.4
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "answer": "According to the Expense Policy [Page 3], meal reimbursement is capped at ₹500 per person per day.",
    "sources": [
      {
        "documentId": "65f1a2b3c4d5e6f7a8b9c020",
        "title": "Club_Expense_Policy_2026.pdf",
        "pageNumber": 3,
        "similarity": 0.8842,
        "snippet": "Meal reimbursement is capped at ₹500 per person per day..."
      }
    ]
  }
}
```

### `POST /api/documents/search`
Perform raw semantic vector chunk retrieval without LLM synthesis.

---

## 8. Announcements (`/api/announcements`)

### `POST /api/announcements`
Create a new announcement draft or published broadcast.

**Request Body:**
```json
{
  "title": "Volunteer Briefing Relocation",
  "content": "Tomorrow's volunteer briefing will take place in Room 204.",
  "targetAudiences": ["Volunteers"],
  "channels": ["in_app", "whatsapp"],
  "priority": "high",
  "event": "65f1a2b3c4d5e6f7a8b9c010"
}
```

### `POST /api/announcements/preview-recipients`
Calculate live audience reach, valid WhatsApp profile numbers, and missing contact alerts.

**Request Body:**
```json
{
  "targetAudiences": ["Volunteers"],
  "eventId": "65f1a2b3c4d5e6f7a8b9c010",
  "channels": ["whatsapp"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "audiences": ["Volunteers"],
    "uniqueRecipients": 8,
    "whatsapp": {
      "channel": "whatsapp",
      "totalRecipients": 8,
      "validRecipients": 6,
      "missingContact": 2,
      "recipients": [
        { "userId": "...", "name": "Priya Shah", "phone": "+919876543210", "status": "ready" },
        { "userId": "...", "name": "Neha Mehta", "phone": null, "status": "missing_contact" }
      ]
    }
  }
}
```

### `POST /api/announcements/:id/broadcast`
Trigger multi-channel delivery across selected channels (`in_app`, `whatsapp`, `email`, `sms`, `push`).

---

## 9. AI Subsystem (`/api/ai`)

### `POST /api/ai/agent/chat`
Execute a multi-turn conversation with the AI Operations Agent.

**Request Body:**
```json
{
  "message": "Create a high-priority task for venue setup and assign to Rahul",
  "dryRun": true,
  "eventId": "65f1a2b3c4d5e6f7a8b9c010",
  "conversationHistory": []
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "response": "I have prepared the action to create 'Venue Setup' assigned to Rahul with High priority. Would you like me to execute this?",
  "plannedActions": [
    {
      "tool": "create_task",
      "args": {
        "title": "Venue Setup",
        "priority": "high",
        "assigneeName": "Rahul"
      }
    }
  ],
  "requiresConfirmation": true
}
```

### `POST /api/ai/process-meeting/:id`
Trigger AI transcript parsing, summary generation, decision tracking, and action item extraction.

### `POST /api/ai/extract-actions`
Extract structured action items from raw meeting text with fuzzy member name mapping.

### `POST /api/ai/meetings/:id/apply-actions`
Convert approved meeting action items into live tracked tasks.

### `POST /api/ai/analyze-risks/:eventId`
Run hybrid heuristic and LLM risk analysis on an event.

### `POST /api/ai/generate-announcement`
Draft announcement copy and adapt tone from operational notes.

### `POST /api/ai/plan-event`
Generate a structured initial event plan (milestones, tasks, volunteer roles) from an event brief.

---

## 10. Health & Diagnostics (`/api/health`)

### `GET /api/health`
Basic service liveness check (`{ "status": "ok" }`).

### `GET /api/health/full`
Complete subsystem diagnostics (MongoDB connectivity, Gemini API reachability, and active SSE client registry count).
