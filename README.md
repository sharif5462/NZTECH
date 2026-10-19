# HirePulse — AI-Powered ATS & Candidate Evaluation Pipeline
> **NZ Tech Innovation | Full Stack Developer Practical Assessment**  
> **Repository:** `sharif5462/NZTECH` | **Active Branch:** `Dev_Sharif`

HirePulse is an enterprise-grade Applicant Tracking System (ATS) and recruitment intelligence platform built to solve candidate screening bottlenecks and streamline multi-stage hiring workflows.

---

## 🏗️ Full-Stack Monorepo Architecture

The repository is organized as a clean, decoupled **Full-Stack Monorepo**:

```
NZTECH/
├── frontend/                     # Next.js 14 App Router, TypeScript & Tailwind CSS (Port 3000)
│   ├── src/app/                  # Pages: Dashboard, Jobs, Applications, Candidate Views, Auth
│   ├── src/components/           # UI Components, Modals, Pipeline Table, Role Switcher
│   ├── next.config.mjs           # Next.js reverse-proxy rewrites /api/* to http://localhost:5000
│   ├── package.json
│   └── tsconfig.json
├── backend/                      # Standalone Express.js & TypeScript REST API (Port 5000)
│   ├── src/controllers/          # Auth, Jobs, Applications, Reviews, Analytics Controllers
│   ├── src/routes/               # Express Router Endpoints (/api/auth, /api/jobs, etc.)
│   ├── src/services/             # Workflow State Machine, AI Matcher, Weighted Scoring
│   ├── src/middlewares/          # JWT Verification, RBAC Guards, Zod Validation
│   ├── prisma/schema.prisma      # PostgreSQL 18 Relational Database Schema
│   ├── package.json
│   └── tsconfig.json
├── README.md                     # Complete System & Evaluation Documentation
├── AI_FEATURE_DOC.md             # In-depth AI Matching Algorithm Documentation (10 Marks)
├── LIVE_DEMO_GUIDE.md            # Live Demonstration Script & Rubric Walkthrough (10 Marks)
├── run-all.bat                   # 🚀 One-Click Launcher (PostgreSQL + Backend + Frontend)
├── run-backend.bat               # Starts REST API on Port 5000
├── run-frontend.bat              # Starts Next.js Frontend on Port 3000
├── start-postgres.bat            # Starts PostgreSQL 18 Daemon on Port 5432
└── .gitignore
```

---

## 🌟 Rubric Coverage & Feature Matrix (100 Marks)

| Category & Marks | Assessment Requirement | Implementation in HirePulse |
| :--- | :--- | :--- |
| **Problem Solving & Planning (10)** | Clear architecture, recruitment problem identification, ERD, and workflow design. | Solves resume bottleneck with a 6-stage hiring state machine and composite score calculator. Layered architecture separating client, REST API, and DB. |
| **Frontend & UX (15)** | Responsive UI, clear navigation, candidate pipeline, loading/error states. | Built with Next.js 14 App Router & Tailwind CSS. Features candidate pipeline Kanban/table, quick role switcher, skeleton loaders, and interactive modals. |
| **Backend & Business Logic (20)** | Robust REST API, state transitions, validation, clean modular code. | Standalone Express & TypeScript REST API on port 5000. Workflow service enforces status transitions (`APPLIED` → `SCREENING` → `AI_ANALYZED` → `INTERVIEW_SCHEDULED` → `OFFER_EXTENDED` → `HIRED`/`REJECTED`). |
| **Database & Data Handling (15)** | Relational DB, foreign keys, migrations, indexing, pgAdmin 4 support. | **PostgreSQL 18** managed via **Prisma ORM**. Tables: `users`, `jobs`, `applications`, `reviews`, `audit_logs`. Full pgAdmin 4 connectivity. |
| **Security & Validation (10)** | Authentication, authorization, input validation, secure credential storage. | JWT bearer authentication, role-based access control (`ADMIN`, `RECRUITER`, `REVIEWER`, `APPLICANT`), Zod schema validation, and salted `bcryptjs` password hashing. |
| **AI/ML Feature & Explanation (10)** | Practical AI matching, clear documentation of inputs/outputs/limitations. | Dual-mode AI evaluator: Offline NLP heuristic keyword & experience matcher with confidence scores, plus optional Gemini LLM integration. Detailed in [`AI_FEATURE_DOC.md`](./AI_FEATURE_DOC.md). |
| **Code Quality, Testing & Git (10)** | Readable TypeScript, automated unit/integration tests, clean Git history. | Strict TypeScript type safety, Vitest unit test suite covering state machine, score weighting, and NLP matcher. Git branching model (`Dev_Sharif`). |
| **Live Demonstration & Review (10)** | Polished live demo walkthrough, technical explanations, live coding readiness. | Comprehensive step-by-step interview guide provided in [`LIVE_DEMO_GUIDE.md`](./LIVE_DEMO_GUIDE.md). |

---

## 📡 REST API Reference (Port 5000)

| Endpoint | Method | Role Guard | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new user account with hashed password |
| `/api/auth/login` | `POST` | Public | Authenticate user & return signed JWT Bearer token |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current authenticated user profile |
| `/api/auth/users` | `GET` | Authenticated | List all active users and their assigned roles |
| `/api/jobs` | `GET` | Public | Query open job listings with department & skill filters |
| `/api/jobs` | `POST` | `ADMIN`, `RECRUITER` | Create a new job requisition |
| `/api/jobs/departments` | `GET` | Public | List all unique active company departments dynamically |
| `/api/applications` | `GET` | Authenticated | Fetch candidate applications with status filters |
| `/api/applications` | `POST` | Public | Submit candidate application with resume text |
| `/api/applications/:id` | `GET` | Authenticated | Fetch detailed application, reviews, and audit logs |
| `/api/applications/:id/status` | `PATCH` | `ADMIN`, `RECRUITER` | Advance candidate stage through state machine |
| `/api/applications/:id/ai-match`| `POST`| `ADMIN`, `RECRUITER` | Execute AI resume evaluation & generate question suggestions |
| `/api/reviews` | `POST` | `REVIEWER`, `ADMIN` | Submit structured technical/culture review scores |
| `/api/analytics` | `GET` | Authenticated | Fetch hiring funnel metrics and stage conversion rates |

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch (Windows)
Double-click [`run-all.bat`](./run-all.bat) at the root of the repository. It will launch:
1. PostgreSQL 18 Daemon on Port 5432
2. Express REST API on Port 5000
3. Next.js Frontend on Port 3000

---

### Option 2: Manual Terminal Execution

#### 1. Start PostgreSQL (Port 5432)
```powershell
& "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "D:\My Project\NZTech\postgres_data"
```

#### 2. Start Backend REST API (Port 5000)
```powershell
cd backend
npm install
npm run dev
```

#### 3. Start Frontend UI (Port 3000)
```powershell
cd frontend
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Seeded Assessment Test Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hirepulse.nz` | `Password123!` | System administration, user management, stage overrides |
| **Recruiter** | `recruiter@hirepulse.nz` | `Password123!` | Job postings, pipeline management, trigger AI resume matching |
| **Reviewer / Tech Lead**| `lead.dev@hirepulse.nz` | `Password123!` | View candidate resumes, record technical and culture interview scores |
| **Candidate** | `s@gmail.com` | `Shuvo5462` | Candidate self-service, application tracking |

---

## 🐘 pgAdmin 4 Database Connection

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `hirepulse_db`
- **Username:** `postgres`
- **Password:** `Shuvo5462`
- **Registered Server Name:** `HirePulse NZTech (Port 5432)`

---

## 🧪 Running Automated Tests

Run the test suite inside the `backend` or `frontend` directories:

```powershell
cd backend
npm test
```

All unit and integration tests verify the state machine workflow transitions, composite score weighting formula, and AI heuristic token matching.

---

## 🌿 Git Branching & Workflow

- **Repository:** `https://github.com/sharif5462/NZTECH.git`
- **Active Development Branch:** `Dev_Sharif`
- **Future Workflow:**
  ```powershell
  # Check status
  git status

  # Stage & Commit changes
  git add .
  git commit -m "feat: description of update"

  # Push to GitHub
  git push origin Dev_Sharif

  # Pull latest updates
  git pull origin Dev_Sharif
  ```
