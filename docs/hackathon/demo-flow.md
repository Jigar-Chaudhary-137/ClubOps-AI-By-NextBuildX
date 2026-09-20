# ClubOps AI — Hackathon Demo Flow

This document outlines the core demonstration narrative for ClubOps AI. For the complete, detailed 16-step judge evaluation walkthrough, refer to [docs/DEMO.md](../DEMO.md).

## Target User Story

1. **Authentication & Multi-Tenant Login**:
   - Organizer logs in to the `NextBuild Tech` club workspace.
   - JWT authentication scopes all subsequent interactions strictly to this club.

2. **Event & Task Coordination**:
   - Organizer views active events and opens the Kanban task board.
   - Volunteers are listed with real-time availability and profile WhatsApp numbers.

3. **Meeting Notes & Transcript Processing**:
   - Organizer pastes raw meeting notes / minutes from the core team kickoff call.
   - AI parses the transcript, extracting:
     - Executive summary & decisions
     - Specific actionable tasks with deadlines
     - Identified task owners mapped to real member profiles
   - 1-click action conversion pushes tasks directly into the MongoDB task board.

4. **Risk Intelligence**:
   - System evaluates event state (unassigned critical tasks, impending deadlines, volunteer shortages).
   - System flags potential risks with clear causality rationales, severity levels, and mitigation plans.

5. **Club Knowledge Retrieval (RAG)**:
   - Organizer queries club policies regarding sponsorship invoicing, venue booking rules, and equipment safety checklists.
   - Gemini AI answers using grounded retrieval from club documentation with page-level citations.

6. **Agentic Action Execution (Human-in-the-Loop)**:
   - Organizer instructs the AI agent: *"Create a high-priority task for venue confirmation and assign it to Rahul with deadline by Friday"*.
   - AI parses the command, generates a structured dry-run action proposal for human review, and executes the mutation upon user confirmation.

7. **Multi-Channel Announcements & WhatsApp Delivery**:
   - Organizer drafts an announcement with AI assistance.
   - System resolves WhatsApp numbers directly from recipient User profiles and generates a readiness preview before broadcast.

See [docs/DEMO.md](../DEMO.md) for step-by-step judge demonstration instructions.
