# ClubOps AI — System Architecture

## Overview

ClubOps AI is a multi-tenant, AI-assisted operations platform built specifically for college clubs. The platform consists of a **React 18 + Vite** frontend, a **Node.js + Express.js** REST API backend, **MongoDB** for persistent storage, and an **AI Subsystem** powered by Google Gemini and Retrieval-Augmented Generation (RAG).

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       ClubOps AI Platform                        │
├──────────────────────────────┬──────────────────────────────────┤
│         Frontend             │           Backend                 │
│   React 18 + Vite            │   Node.js + Express.js            │
│   Tailwind CSS + Recharts    │   MongoDB (Mongoose ODM)          │
│   React Router v6            │   JWT Authentication + RBAC       │
│   Axios API Client Layer     │   Multer File Processing Layer    │
└──────────────────────────────┴──────────────────────────────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
 ┌──────┴──────┐         ┌──────┴──────┐          ┌──────┴──────┐
 │  AI Layer   │         │  RAG Engine │          │   Realtime  │
 │ Gemini AI   │         │ Chunker     │          │ Server-Sent │
 │ Function    │         │ Embeddings  │          │ Events (SSE)│
 │ Calling     │         │ VectorStore │          │ Broadcasts  │
 └─────────────┘         └─────────────┘          └─────────────┘
```

---

## Request Lifecycle

```
Browser / Client (Vite:5173)
       ↓
Axios API Client (`/api/*`)
       ↓
Express Server (localhost:5000)
       ↓
Helmet Security Headers & CORS
       ↓
JWT Authentication Middleware (`auth.middleware.js`)
       ↓
RBAC Authorization Middleware (`rbac.middleware.js`)
       ↓
Tenant Isolation (injects `{ club: req.user.club }`)
       ↓
Controller → Service Layer
       ↓
MongoDB (Mongoose Models) / Gemini AI Subsystem
       ↓
Standardized JSON Response (`{ success, message, data }`)
```

---

## Core Data Models

| Model | Source of Truth For | Description |
|---|---|---|
| `User` | Name, Email, Phone, WhatsApp, Role, Club | User identity and primary contact info |
| `Club` | Name, Code, Settings | Multi-tenant club root |
| `Event` | Title, Status, Dates, Venue, Attendees | Event lifecycle tracking |
| `Task` | Title, Priority, Status, Assignee, Due Date | Actionable work items |
| `Volunteer` | Availability, Skills, Department, Assigned Tasks | Volunteer registry referencing User |
| `Meeting` | Title, Date, Attendees, Transcript, Action Items | Meeting intelligence |
| `Risk` | Title, Severity, Probability, Mitigation Plan | Operational risk register |
| `Document` | File, Chunks, Embeddings, Ingestion Status | RAG knowledge base |
| `Announcement` | Title, Content, Target Audiences, Priority | Multi-channel broadcast |
| `BroadcastDelivery`| Channel, Recipient, Phone, Delivery Status | Multi-channel delivery audit trail |
| `Notification` | Recipient, Club, Type, Title, Read Status | In-app notification records |

---

## Security & Multi-Tenant Isolation

1. **Club-Level Data Scoping:** Every query executed in the application is strictly filtered by the authenticated user's `clubId`. Cross-tenant data leaks are structurally prevented.
2. **Contact Info Truth:** Contact numbers (`phone`, `whatsappNumber`) are stored securely on the `User` profile and normalized to E.164 (`+91...`).
3. **Backend-Only AI Secrets:** The Gemini API key and provider credentials remain exclusively on the server.
4. **Human-in-the-Loop Safety Boundary:** When the AI Operations Agent plans database modifications, it generates a dry-run proposal. The change is only committed after the organizer explicitly confirms it.
5. **Role-Based Access Control (RBAC):** Access tiers (`admin`, `organizer`, `volunteer`, `member`) dictate administrative privileges.
6. **Native Real-Time SSE:** Server-Sent Events deliver live notifications without introducing external socket dependencies.
