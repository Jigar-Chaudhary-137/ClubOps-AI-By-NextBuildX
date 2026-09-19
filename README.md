# ClubOps AI

> **AI-Powered Event Operations Platform for College Clubs**  
> Google Developer Groups Hackathon — Problem Statement 3 (PS-3)

---

> [!NOTE]
> **Initial Project Scaffold**: This repository currently houses the baseline architectural structure designed for parallel two-member development. Business features, database schemas, and AI models will be progressively integrated in upcoming phases.

---

## 1. Problem Statement

College clubs often coordinate events using a fragmented set of tools: WhatsApp groups, scattered spreadsheets, unorganized meeting notes, personal task lists, and shared drives. As events grow in scale, tracking responsibilities, deadlines, task dependencies, volunteer allocations, documents, and operational risks becomes error-prone and chaotic.

**ClubOps AI** is a centralized, AI-powered event operations platform that unifies club operations under one roof. Going beyond simple chatbots, ClubOps AI integrates deep operational intelligence capable of extracting action items, identifying risks, querying club knowledge, and executing concrete actions within the application.

---

## 2. Technology Stack

* **Frontend**: React, Vite, Tailwind CSS, React Router, Axios, Lucide React icons, Recharts
* **Backend**: Node.js, Express.js (REST API Architecture)
* **Database**: PostgreSQL (Relational schema)
* **AI Provider**: Google Gemini API (Planning, action extraction, risk intelligence, RAG, tool calling)
* **Real-time (targeted)**: Socket.IO (where live updates provide critical value)

---

## 3. Repository Structure

```text
ClubOps-AI-By-NextBuildX/
├── client/                     # Frontend application (React + Vite + Tailwind CSS)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images, fonts, media
│   │   ├── components/         # UI components (common, layout, ui, forms, ai)
│   │   ├── pages/              # Route pages (auth, dashboard, events, tasks, etc.)
│   │   ├── layouts/            # Page layouts
│   │   ├── routes/             # App routing configuration
│   │   ├── services/           # API and AI client services
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # React context providers
│   │   ├── store/              # State management
│   │   ├── utils/              # Client utility functions
│   │   ├── constants/          # Application constants
│   │   ├── types/              # Type definitions / prop contracts
│   │   ├── App.jsx             # Root React component
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Design tokens & Tailwind CSS
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── server/                     # Backend API server (Node.js + Express)
│   ├── src/
│   │   ├── config/             # App & database configurations
│   │   ├── controllers/        # Request handlers partitioned by domain
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Core domain business logic
│   │   ├── models/             # Data models
│   │   ├── repositories/       # Database access layer
│   │   ├── middleware/         # Express middlewares (auth, error handler, etc.)
│   │   ├── validators/         # Request validation schemas
│   │   ├── utils/              # Utility helpers and loggers
│   │   ├── db/                 # Migrations, seeds, queries
│   │   ├── ai/                 # Gemini integrations, prompts, RAG, agents, tools
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server bootstrap & listener
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── docs/                       # Technical specifications & documentation
│   ├── architecture/           # System architecture diagrams & notes
│   ├── api/                    # API contract specifications
│   ├── database/               # Relational schemas & ER diagrams
│   ├── ai/                     # AI prompting and agent specifications
│   ├── rag/                    # Knowledge base and retrieval docs
│   ├── workflows/              # End-to-end user journeys
│   └── hackathon/              # Demo flow & PS-3 requirements tracking
│
├── .env.example                # Root environment variables reference
├── .gitignore                  # Git ignore rules
└── README.md                   # Project overview and setup instructions
```

---

## 4. Two-Member Development Structure

To maximize productivity during the 48-hour hackathon, code ownership is split into decoupled layers:

### Member 1 — Product & Frontend
* **Primary Scope**: `client/src/` (components, pages, layouts, routes, API clients, hooks, state)
* **Module Ownership**: Dashboard, Events, Tasks, Volunteers, Meetings UI, Documents UI, Risks UI, Announcements UI, shared UI system.

### Member 2 — Backend & AI Intelligence
* **Primary Scope**: `server/src/` (controllers, routes, services, repositories, DB, AI pipelines)
* **Module Ownership**: Express API architecture, PostgreSQL data access, Gemini integration, action-item extraction, risk analysis, RAG pipeline, tool calling, operational agent.

### Shared Interfaces
* `docs/api/`, `docs/database/`, `README.md`, and shared environment definitions are managed with cross-team communication to keep integration contracts stable.

---

## 5. Getting Started & Running Locally

### Prerequisites
* **Node.js**: v18+ (tested with v24+)
* **npm**: v9+ (tested with v11+)
* **PostgreSQL** (for subsequent phases)

---

### Step 1: Environment Configuration

Copy the example environment files:

```bash
# In the root directory (or server directory)
cp .env.example server/.env
```

Ensure environment variables are configured with your development values:
- `PORT` (default: 5000)
- `CLIENT_URL` (default: http://localhost:5173)
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (Authentication signing secret)
- `GEMINI_API_KEY` (Google Gemini API key)

---

### Step 2: Install Dependencies

#### Client
```bash
cd client
npm install
```

#### Server
```bash
cd ../server
npm install
```

---

### Step 3: Run the Development Servers

#### Start Frontend (Vite)
```bash
cd client
npm run dev
```
Client starts on `http://localhost:5173`.

#### Start Backend (Express)
```bash
cd server
npm run dev
```
Server starts on `http://localhost:5000`. Health check endpoint available at:  
`http://localhost:5000/health`
