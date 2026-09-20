# Contributing to ClubOps AI

Thank you for your interest in contributing to **ClubOps AI**! This guide will help you set up your local development environment, understand our architecture, and submit contributions.

---

## 🛠 Prerequisites

* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/clubops_ai`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI
* **Google Gemini API Key** *(Optional for local development; deterministic offline fallback built-in)*: Obtain from [Google AI Studio](https://aistudio.google.com/)

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/NextBuildX/ClubOps-AI.git
cd ClubOps-AI-By-NextBuildX
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

**Backend** (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clubops_ai
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

**Frontend** (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Seed Database with Realistic Demo Data
```bash
cd server
npm run seed
cd ..
```

### 5. Start Development Servers
From the root directory:
```bash
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 📂 Code Organization

```text
ClubOps-AI-By-NextBuildX/
├── client/                     # Frontend Application (React 18 + Vite + Tailwind CSS)
│   └── src/
│       ├── components/         # Feature-specific UI components (ai, events, tasks, volunteers, etc.)
│       ├── contexts/           # Auth and UI contexts
│       ├── pages/              # Route view pages
│       └── services/api/       # Axios API client modules
│
├── server/                     # Backend API (Express.js + MongoDB + Gemini SDK)
│   └── src/
│       ├── ai/                 # AI Subsystems (agents, extraction, prompts, rag, risk, tools)
│       ├── config/             # App & database configuration
│       ├── controllers/        # Route business logic controllers
│       ├── middleware/         # Auth, tenant isolation, error handling
│       ├── models/             # Mongoose schemas (12 data models)
│       ├── routes/             # Express route definitions
│       ├── services/           # Core domain business logic
│       └── scripts/            # Seed & verification test scripts
│
└── docs/                       # Project Documentation & Architecture Guides
```

---

## 📐 Development & Coding Guidelines

1. **Multi-Tenancy is Mandatory:** Every DB query modifying or reading tenant data MUST include `club: req.user.club._id` (or `req.user.club`).
2. **Contact Truth in User Profile:** User contact info (`phone`, `whatsappNumber`, `email`, `name`) resides on the `User` document. Volunteer records reference the `User`.
3. **AI Safety Boundaries:** All AI tool executions must operate with multi-tenant club validation and human-in-the-loop confirmation before applying changes.
4. **Clean Error Handling:** Use `AppError(message, statusCode)` from `server/src/utils/errors.js`.
5. **No Secrets in Client or Docs:** Keep all credentials, tokens, and keys in backend environment configurations.

---

## 🤝 Contribution Workflow

1. Fork the repository and create your feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes adhering to the guidelines above.
3. Verify changes locally:
   - Backend: `cd server && npm test` (or run test scripts in `server/src/scripts/`)
   - Frontend: `npm --prefix client run build`
4. Commit your changes with clear, descriptive commit messages.
5. Push to your branch and open a Pull Request with a summary of the changes.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
