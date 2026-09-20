# Contributing to ClubOps AI

Thank you for your interest in contributing to **ClubOps AI**! This guide will help you set up your local development environment, understand our coding standards, and submit contributions.

---

## 🛠 Prerequisites

Ensure you have the following installed on your machine:

* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/clubops`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI
* **Google Gemini API Key** *(Optional for basic development; offline fallback works out-of-the-box)*: Obtain from [Google AI Studio](https://aistudio.google.com/)

---

## 🚀 Quick Setup

### 1. Clone the Repository
```bash
git clone https://github.com/NextBuildX/ClubOps-AI.git
cd ClubOps-AI
```

### 2. Install Dependencies
```bash
# Install root orchestration dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root directory
cd ..
```

### 3. Configure Environment Variables

Create `.env` in the `server/` directory:
```bash
cp server/.env.example server/.env
```

Configure `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clubops
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Optional)* Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Database with Realistic Demo Data
```bash
cd server
npm run seed
cd ..
```

This seeds 3 clubs, 11 users, 5 events, 8 tasks, 9 volunteers, 4 meetings, 5 documents with pre-computed vector embeddings, and 5 risks.

### 5. Start Development Servers
From the repository root:
```bash
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🧪 Automated Scripts & Testing

ClubOps AI includes built-in verification scripts in `server/`:

### End-to-End Walkthrough Demonstration
Simulates a full organizer workflow (auth, event creation, risk assessment, meeting processing, RAG, announcements):
```bash
cd server
npm run demo
```

### Performance & Latency Benchmark
Validates endpoint latencies, concurrent RAG throughput, multi-tenant isolation, and tool execution:
```bash
cd server
npm run benchmark
```

---

## 📂 Project Architecture

```text
ClubOps-AI/
├── client/                     # Frontend Application (React 18 + Vite + TailwindCSS)
│   └── src/
│       ├── components/         # Feature-specific UI components
│       │   ├── ai/             # AI Command Center & suggestions
│       │   ├── announcements/  # Announcement broadcast modal & feed
│       │   ├── documents/      # Document upload & RAG interface
│       │   ├── events/         # Event cards, calendar, modals
│       │   ├── meetings/       # Meeting transcript intelligence
│       │   ├── risks/          # Risk matrix & action items
│       │   ├── tasks/          # Kanban board & task modals
│       │   └── volunteers/     # Volunteer roster & assignment
│       ├── contexts/           # Auth & UI contexts
│       ├── pages/              # Routed view pages
│       └── services/           # Axios API client modules
│
├── server/                     # Backend API (Express + MongoDB + Gemini SDK)
│   └── src/
│       ├── ai/                 # AI Subsystems
│       │   ├── agent/          # Autonomous tool-calling agent
│       │   ├── gemini/         # Google Gen AI SDK client & wrappers
│       │   ├── prompts/        # System prompts & risk heuristics
│       │   └── rag/            # Vector store, chunker, embeddings, parser
│       ├── controllers/        # Route business logic controllers
│       ├── middleware/         # Auth, tenant isolation, error handling
│       ├── models/             # Mongoose schemas (12 data models)
│       ├── routes/             # Express route definitions
│       └── scripts/            # Seed, demo walkthrough, and benchmark
│
└── docs/                       # Project Documentation & Architecture Guides
```

---

## 📐 Coding Standards & Guidelines

### Backend Conventions
1. **Multi-Tenancy is Mandatory:** Every DB query modifying or reading tenant data MUST include `club: req.user.club._id` (or `req.user.club`).
2. **Error Handling:** Use `AppError(message, statusCode)` from `server/src/utils/errors.js` and wrap async controllers with `asyncHandler()`.
3. **Validation:** Validate all user inputs and ObjectIds with `validateObjectId()` before running queries.
4. **AI Safety:** All AI tool executions must run through `server/src/ai/agent/toolExecutor.js` with multi-tenant club validation and safety policies.

### Frontend Conventions
1. **Component Design:** Modular, clean React functional components with TailwindCSS.
2. **API Calls:** Route all HTTP requests through centralized service modules in `client/src/services/api/`.
3. **Feedback:** Provide instant loading states, error toasts, and optimistic updates where appropriate.
4. **Icons:** Use `lucide-react` for iconography.

---

## 🤝 Contribution Workflow

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following the coding standards above.
3. **Run local verification**:
   ```bash
   cd server
   npm run seed
   npm run benchmark
   ```
4. **Commit** your changes with a descriptive commit message:
   ```bash
   git commit -m "feat(rag): add semantic chunk similarity filtering"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** against the `main` branch with a clear summary of your changes.

---

## 📜 Code of Conduct

Please maintain a welcoming, respectful, and inclusive environment. All contributors are expected to uphold professional standards and collaborate constructively.
