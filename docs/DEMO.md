# ClubOps AI — Hackathon Demonstration Guide

This guide provides a structured, step-by-step walkthrough for evaluating the live **ClubOps AI** platform during judge demonstrations.

---

## 🎯 Demo Overview

| Property | Value |
|---|---|
| **Platform** | ClubOps AI |
| **Team** | NextBuildX |
| **Problem Statement** | PS-3 — ClubOps AI (BIT N BUILD’26 Gujarat Round) |
| **Frontend URL** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:5000](http://localhost:5000) |
| **Primary Test User** | `lead@club.edu` / `Password123!` (Lead Organizer, NextBuild Tech) |

---

## 🎬 Step-by-Step 16-Step Demonstration Narrative

### 1. Authenticate & Access Workspace
1. Open **[http://localhost:5173/login](http://localhost:5173/login)**.
2. Sign in with:
   - **Email:** `lead@club.edu`
   - **Password:** `Password123!`
3. Verify JWT authentication completes and redirects to the main dashboard.

---

### 2. Operations Dashboard Overview
1. Observe the live KPI overview: active events, open tasks, volunteer allocation ratios, and risk counters.
2. Review the upcoming event timeline and urgent task widgets.
3. Note how the dashboard updates live using native Server-Sent Events (SSE).

---

### 3. Event Management
1. Navigate to **Events** (`/events`).
2. Click **Create Event** and input:
   - **Title:** `AI Innovators Hackathon 2026`
   - **Dates:** Select upcoming weekend dates
   - **Venue:** `Main Campus Auditorium` (Capacity: 300)
   - **Description:** `24-hour collegiate hackathon and workshop series.`
3. Save the event and open the Event Details view to verify milestone progress tracking.

---

### 4. Task Board & Volunteer Management
1. Navigate to **Tasks** (`/tasks`) to observe the interactive Kanban board.
2. Create or move a task from `To Do` → `In Progress` → `Review` → `Completed`.
3. Navigate to **Volunteers** (`/volunteers`).
4. Inspect the volunteer roster: notice verified skill tags, availability statuses (`available`, `assigned`, `busy`, `unavailable`), and normalized WhatsApp contact badges (`WhatsApp: +91...` or `WhatsApp: Not added`).

---

### 5. Meeting Creation
1. Navigate to **Meetings** (`/meetings`).
2. Click **Create Meeting**:
   - **Title:** `Core Team Hackathon Kickoff`
   - **Event:** Link to `AI Innovators Hackathon 2026`
   - **Date & Time:** Scheduled time
   - **Attendees:** Select team organizers and leads

---

### 6. Provide Meeting Notes / Transcript
1. Open the created meeting.
2. In the Transcript / Notes tab, paste raw meeting conversation notes, for example:
   ```text
   Alice: We need to finalize the catering vendor by Thursday. Rahul, please call Green Leaf catering and confirm 200 meal boxes.
   Bob: I will test the auditorium audio-visual equipment and backup projector by Friday 5 PM.
   Alice: Also, we haven't received confirmation for the Chief Guest airport pickup. Someone needs to coordinate transport by Wednesday.
   ```

---

### 7. Run AI Meeting Intelligence
1. Click **Extract Intelligence with Gemini AI**.
2. Watch the AI NLP parser process the transcript.
3. Observe the extracted output:
   - Executive meeting summary
   - Key decisions recorded
   - Operational risks flagged

---

### 8. Review & Convert Action Items to Tasks
1. Inspect the extracted action items:
   - `Call Green Leaf catering and confirm headcount` → Assignee: `Rahul Patel`, Deadline: `Thursday`
   - `Test auditorium AV equipment and backup projector` → Assignee: `Bob`, Deadline: `Friday 5 PM`
2. Click **1-Click Apply Actions / Convert to Tasks**.
3. Navigate to **Tasks** (`/tasks`) to verify the tasks are now live on the Kanban board with assignees and deadlines pre-populated.

---

### 9. Upload Club Knowledge Documents (RAG)
1. Navigate to **Documents** (`/documents`).
2. Upload a club document (PDF, Word document, or plain text), such as `Sponsorship_Guidelines_2026.pdf` or `Club_Reimbursement_Policy.txt`.
3. Verify the document ingestion pipeline:
   - Text parsing & page normalization
   - Sliding-window chunking (800 chars / 100 overlap)
   - Vector embedding generation (768-dim)
   - Ingestion status updates to `Processed`

---

### 10. Query Club Knowledge with Grounded Citations
1. In the Knowledge Base Q&A bar on `/documents`, ask a natural-language question:
   > *"What is the maximum reimbursement allowed for volunteer meals?"*
2. Gemini AI answers strictly using the retrieved document context.
3. Observe the interactive citation cards displaying the exact document title, page number, and similarity score.

---

### 11. Open AI Command Center
1. Click **AI Command Center** in the top navigation (`/command-center` or floating copilot).
2. The interactive Operations Agent session opens with live club context loaded.

---

### 12. Ask a Workspace Status Query
1. Ask the AI agent:
   > *"Summarize my upcoming events and list all unassigned high-priority tasks."*
2. The agent executes workspace read tools (`get_event_status`, `list_unassigned_tasks`) and answers with real MongoDB data.

---

### 13. Demonstrate AI Action Proposal
1. Prompt the agent to perform an operational mutation:
   > *"Create a high-priority task for 'Backup Projector Setup' assigned to Rahul for the hackathon."*
2. Notice the **Human-in-the-Loop Safety Boundary**:
   - The agent does NOT silently mutate the database.
   - It generates a structured **Action Proposal & Dry-Run Preview** showing target task title, priority, linked event, and assignee.

---

### 14. Confirm the Action
1. Review the proposed change in the confirmation modal.
2. Click **Confirm & Execute Action**.
3. The AI agent executes the tool, commits the record to MongoDB, and returns confirmation.

---

### 15. Verify Live Application Update
1. Open **Tasks** (`/tasks`) in another tab.
2. Verify that the task `Backup Projector Setup` is live, assigned to `Rahul`, and prioritized as `High`.

---

### 16. Multi-Channel Announcement with WhatsApp Recipient Preview
1. Navigate to **Announcements** (`/announcements`).
2. Click **Compose Announcement**:
   - **Audience:** Select `Volunteers`
   - **Channels:** Check `In-App` and `WhatsApp`
   - **AI Assist:** Click **Generate Draft with AI** to auto-compose the message copy.
3. Observe the **WhatsApp Recipient Intelligence Summary**:
   - Total recipients found (e.g. 8 volunteers)
   - Number of recipients with valid profile WhatsApp numbers (e.g. 6 ready)
   - Number of recipients missing contact numbers (e.g. 2 missing)
   - Expand **View Recipients** to inspect profile-resolved numbers with status indicators.
4. Publish the announcement and observe live delivery tracking.

---

## 🛡 Verification of Multi-Tenant Isolation

To demonstrate strict club tenant isolation:
1. Log out and sign in with the Isolation Lead account:
   - **Email:** `robo.lead@club.edu`
   - **Password:** `Password123!`
   - **Club Workspace:** Robotics Club (`ROBO2026`)
2. Verify that none of NextBuild Tech's events, tasks, documents, or announcements are visible.
3. Ask the RAG knowledge base a question about NextBuild Tech's documents — verify the system returns zero results, proving strict club data isolation.
