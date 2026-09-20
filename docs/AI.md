# ClubOps AI — AI Subsystem & Agent Architecture

## Overview

ClubOps AI leverages **Google Gemini AI** (`@google/generative-ai`) and Retrieval-Augmented Generation (RAG) to provide grounded operational intelligence for college clubs.

Rather than relying on unconstrained chatbots, all AI capabilities operate within strict **operational guardrails** with multi-tenant club isolation and human-in-the-loop confirmation for application-changing actions.

---

## 1. AI Operations Agent

The Operations Agent (`server/src/ai/agents/operationsAgent.js`) is an autonomous, multi-turn assistant powered by Gemini function calling.

### Architecture & Safety Flow

```
User Query
    ↓
Operations Agent (gemini-3.6-flash)
    ↓
Tool Selection (from 10 Registered Tools)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Safety Check                                            │
│ If dryRun=true (Mutation tool):                         │
│   → Returns proposed action details for user review     │
│ If dryRun=false (After explicit user confirmation):     │
│   → toolExecutors.js performs real MongoDB mutation     │
└─────────────────────────────────────────────────────────┘
    ↓
Grounded Conversational Summary returned to User
```

### Registered Agent Tools

| Tool Name | Operation Type | Arguments | Description |
|---|---|---|---|
| `create_task` | Mutation | `title`, `eventId`, `priority`, `assigneeName`, `dueDate` | Creates a new task in the event board |
| `update_task_status` | Mutation | `taskId`, `status` | Updates workflow status (`todo` → `completed`) |
| `assign_task` | Mutation | `taskId`, `assigneeName` / `userId` | Assigns task to a club member |
| `create_risk` | Mutation | `eventId`, `title`, `severity`, `mitigationPlan` | Logs an operational risk |
| `create_announcement` | Mutation | `title`, `content`, `targetAudience` | Drafts a club announcement |
| `get_event_status` | Read | `eventId` | Returns real-time task completion & volunteer stats |
| `list_unassigned_tasks`| Read | `eventId` | Lists tasks requiring volunteer assignment |
| `list_available_volunteers` | Read | `department` | Lists available volunteers matching criteria |
| `search_club_knowledge` | Read (RAG) | `query` | Queries RAG vector store for club rules and policies |
| `send_broadcast_alert` | Mutation | `title`, `message`, `channels` | Dispatches multi-channel alerts |

---

## 2. Meeting Intelligence Engine

The Meeting Processor (`server/src/ai/extraction/meetingProcessor.js`) extracts structured operational intelligence from raw meeting notes or transcripts.

### Extraction Pipeline

1. **Transcript Ingestion:** Reads raw conversational notes or meeting minutes.
2. **LLM Extraction:** Gemini extracts:
   - Concise executive summary
   - Key decisions agreed upon
   - Discrete, actionable tasks with inferred deadlines
   - Potential operational risks mentioned
3. **Fuzzy Entity Resolution:** Matches attendee names (e.g., "Rahul") to actual registered club members in MongoDB.
4. **1-Click Task Creation:** Organizers review the extracted action items and convert them into live Kanban tasks with one click.

---

## 3. Risk Intelligence Engine

The Risk Engine (`server/src/ai/risk/riskEngine.js`) uses a hybrid heuristic + LLM strategy:

### Phase 1: Deterministic Heuristic Detection (Always Active)
- Scans for overdue milestones.
- Identifies critical-priority tasks with no assignees.
- Flags low volunteer-to-task ratios (< 0.5).
- Detects events scheduled within 72 hours with incomplete setup tasks.

### Phase 2: Gemini Causality & Mitigation Planning
- Explains the underlying causality in plain language (*"Why is this a risk?"*).
- Generates actionable, practical mitigation steps.
- Suggests likelihood and severity ratings.

---

## 4. Grounded RAG Knowledge Base

The RAG Engine (`server/src/ai/rag/ragEngine.js`) provides verified answers from club documents:

- **Chunking:** 800 characters with 100-character overlap.
- **Embeddings:** Google Gemini `gemini-embedding-001` (768-dimensional vectors).
- **Tenant Scoping:** Searches are strictly scoped to `club: clubId`.
- **Anti-Hallucination:** Prompt guardrails force Gemini to answer strictly using retrieved document context.
- **Citations:** Returns document titles, page numbers, and similarity scores.

---

## 5. AI Announcement Generator

Drafts contextually relevant, targeted announcements for club audiences (Entire Club, Volunteers, Organizers, Members) and adapts tone (Professional, Energetic, Urgent).

---

## 6. Offline Fallbacks & Reliability

All AI modules include deterministic fallbacks to ensure development and automated testing function reliably even when an external API key is not configured:
- RAG uses a deterministic 768-dim DJB2 + trigram vector generator.
- Risk engine returns rule-based heuristic evaluations.
- Meeting processor returns structured templates.
