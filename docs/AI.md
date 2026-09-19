# ClubOps AI — AI Features & Integration

## Overview

ClubOps AI uses **Google Gemini 1.5 Flash** as its primary AI model, integrated via the `@google/generative-ai` SDK (v0.24). All AI features have **deterministic offline fallbacks** — the platform operates fully without an API key.

---

## 1. AI Operations Agent

**File:** `server/src/ai/agents/operationsAgent.js`

The Operations Agent is an autonomous, multi-turn conversational agent powered by Gemini function calling. It can read live club data and perform mutations with human-in-the-loop confirmation.

### How It Works

```
User message
  → Gemini 1.5 Flash (functionCallingConfig: AUTO)
  → Model selects from 10 tool declarations
  → If dryRun=true: return planned actions for confirmation
  → If dryRun=false: toolExecutors.js executes DB mutations
  → Gemini generates human-readable response
  → Multi-turn history maintained per session
```

### Registered Tools

| Tool | Type | Required Args | Description |
|------|------|--------------|-------------|
| `create_task` | Mutation | title, eventId | Creates a task with optional priority, assignee, dueDate |
| `update_task_status` | Mutation | taskId, status | Updates task status |
| `assign_task` | Mutation | taskId | Assigns task by member name or userId |
| `create_risk` | Mutation | eventId, title, severity, mitigationPlan | Logs a risk |
| `create_announcement` | Mutation | title, content | Drafts an announcement |
| `get_event_status` | Read | eventId | Returns task counts, volunteer status, risks |
| `list_unassigned_tasks` | Read | eventId | Finds unassigned tasks |
| `list_available_volunteers` | Read | — | Lists available volunteers by department |
| `search_club_knowledge` | Read (RAG) | query | Semantic RAG search |
| `send_broadcast_alert` | Mutation | title, message | Multi-channel broadcast |

### Safety Design

- `dryRun: true` returns a plan without executing — enables human review
- Club isolation enforced in every tool executor (only accesses `req.user.club` data)
- Fuzzy name matching resolves member names to actual MongoDB ObjectIds before mutation

---

## 2. Meeting Transcript Processor

**File:** `server/src/ai/extraction/meetingProcessor.js`

Processes raw meeting transcripts to extract structured intelligence.

### Process Flow

```
POST /api/ai/process-meeting/:id
  → Load meeting transcript from MongoDB
  → Structured Gemini prompt with 3-shot examples
  → Extract: action items, assignees, deadlines, summary
  → Fuzzy entity resolution: names → registered User ObjectIds
  → Store back to Meeting model: actionItems[], summary, status=processed
```

### Action Item Schema

```json
{
  "title": "Confirm catering vendor",
  "description": "Call Green Leaf catering and confirm headcount",
  "assignee": "Alice",
  "resolvedUserId": "64abc123...",
  "deadline": "2026-03-22",
  "confidence": 0.91
}
```

### POST /api/ai/meetings/:id/apply-actions
Converts extracted action items into actual Task records in the database.

---

## 3. AI Risk Analysis Engine

**File:** `server/src/ai/risk/riskEngine.js`

Analyzes an event for operational risks using a hybrid heuristic + LLM approach.

### Detection Strategy

**Phase 1 — Heuristic Analysis (always runs, offline-safe):**
- Overdue milestones (tasks past due date)
- Critical tasks with no assignee
- Low volunteer-to-task ratio (<0.5)
- Events starting within 72h with incomplete preparation tasks
- Missing venue or AV confirmation

**Phase 2 — LLM Augmentation (when Gemini available):**
- Causality explanation ("Why is this a risk?")
- Impact assessment (what happens if unmitigated)
- Actionable mitigation steps

**Offline fallback:** Heuristic-detected risks are returned with pre-built explanation templates.

---

## 4. AI Announcement Generator

**File:** `server/src/ai/services/ai.service.js`

Drafts announcement copy from operational context.

```
POST /api/ai/generate-announcement
  → context: situation description
  → audience: all | organizers | volunteers | members
  → priority: low | normal | high | urgent
  → Gemini prompt: generate clear, targeted announcement
  → Returns title + formatted markdown content
```

---

## 5. AI Event Planner

**File:** `server/src/ai/prompts/`

Generates a structured event plan (milestones, tasks, volunteer allocation) from an event brief.

```
POST /api/ai/plan-event { title, description, date, expectedAttendees }
  → Gemini generates:
    - Key milestones with dates
    - Task list with suggested priorities
    - Volunteer department requirements
    - Risk pre-assessment
```

---

## Gemini Configuration

**Models Used:**
- **Generation:** `gemini-1.5-flash` (fast, cost-efficient, function calling support)
- **Embeddings:** `text-embedding-004` (768-dimensional output)

**Fallback Strategy:**
- If `GEMINI_API_KEY` is absent or API is unreachable, all AI functions return deterministic fallback responses
- RAG embeddings use the offline DJB2+trigram engine (see RAG.md)
- Risk analysis returns heuristic-only results
- Agent returns a graceful error message explaining degraded mode

---

## Prompt Architecture

All prompts are structured templates stored in `server/src/ai/prompts/`. They follow:

1. **Role assignment** — "You are an AI operations coordinator for college clubs..."
2. **Context injection** — Club name, event data, member roster
3. **Task specification** — Precise extraction/generation instruction
4. **Output format constraint** — JSON schema with examples
5. **Safety guardrails** — "Only use data from the provided context"
