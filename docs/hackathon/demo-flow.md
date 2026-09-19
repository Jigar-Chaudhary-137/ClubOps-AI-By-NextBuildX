# ClubOps AI — Hackathon Demo Flow

This document details the primary end-to-end demonstration narrative for ClubOps AI.

## Target User Story

1. **Event Initialization**:
   - Organizer initializes a new club event (e.g., "Google Cloud Hackathon 2026").
   - AI assistant helps structure the initial event milestones and core operational phases.

2. **Meeting Notes & Transcript Processing**:
   - Organizer pastes raw meeting notes / minutes from the core team kickoff call.
   - AI parses the transcript, extracting:
     - Specific actionable tasks
     - Identified task owners / leads
     - Target deadlines and dependencies

3. **Task & Volunteer Assignment**:
   - Organizer reviews and approves the extracted action items with 1-click.
   - Tasks are automatically instantiated and assigned to volunteers.

4. **Risk Intelligence**:
   - AI continuously evaluates the event state (unassigned critical tasks, impending deadlines, venue dependencies).
   - System highlights potential risks with plain-English rationales and severity ratings.

5. **Club Knowledge Retrieval (RAG)**:
   - Organizer queries club policies regarding sponsorship invoicing, venue booking rules, and equipment safety checklists.
   - AI answers using grounded retrieval from club documentation.

6. **Agentic Action Execution**:
   - Organizer instructs the AI agent: *"Create a high-priority task for venue confirmation and assign it to Rahul with deadline by Friday"*.
   - AI parses the command, calls the internal application tool, and commits the action live in the workspace.
