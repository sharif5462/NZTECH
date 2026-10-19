# HirePulse

HirePulse is an Applicant Tracking System (ATS) and candidate evaluation pipeline designed to streamline multi-stage hiring workflows, enforce structured evaluation criteria, and automate candidate qualification matching.

Built as a decoupled full-stack application with **Next.js 14**, **Express.js**, **TypeScript**, and **PostgreSQL 18** via **Prisma ORM**.

---

## Architecture Overview

The system operates as a decoupled monorepo separating client-side rendering from the backend business logic and database persistence:

```mermaid
flowchart LR
    subgraph Client ["Frontend (Port 3000)"]
        NextApp["Next.js 14 App Router"]
        TailwindUI["Tailwind CSS + UI Components"]
        ClientState["Candidate Pipeline & Kanban"]
    end

    subgraph API ["REST API Service (Port 5000)"]
        Express["Express.js Server"]
        Routes["API Routes (/api/*)"]
        Workflow["Workflow State Machine"]
        ScoreEngine["Composite Score Engine"]
        AIEngine["Resume Matching Engine"]
        Middlewares["JWT Auth, RBAC & Zod"]
    end

    subgraph Persistence ["Data Layer (Port 5432)"]
        Prisma["Prisma ORM Client"]
        Postgres[("PostgreSQL 18: hirepulse_db")]
    end

    Client -->|HTTP / JSON via Next.js Proxy| API
    API --> Prisma
    Prisma --> Postgres
```

### Directory Structure

```
NZTECH/
├── frontend/               # Next.js 14 App Router, TypeScript & Tailwind CSS (Port 3000)
│   ├── src/app/            # Application pages (Dashboard, Jobs, Applications, Auth)
│   ├── src/components/     # Modular UI components (Navbar, Pipeline, ScoreGauge)
│   ├── next.config.mjs     # Reverse-proxy rewrites routing /api/* to Express server
│   ├── package.json
│   └── tsconfig.json
├── backend/                # Standalone Express.js REST API (Port 5000)
│   ├── src/controllers/    # HTTP controllers (Auth, Jobs, Applications, Reviews, Analytics)
│   ├── src/routes/         # Express router endpoints
│   ├── src/services/       # Business logic (Workflow state machine, Scoring, AI matching)
│   ├── src/middlewares/    # JWT verification, RBAC guards, and Zod request validation
│   ├── prisma/schema.prisma# PostgreSQL 18 schema definition
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── resume-matching-engine.md # In-depth technical specification of AI heuristics
├── run-all.bat             # Convenience launcher (Database + Backend + Frontend)
├── run-backend.bat         # Launch Express API server
├── run-frontend.bat        # Launch Next.js dev server
├── start-postgres.bat      # Launch PostgreSQL 18 daemon
├── README.md               # Main repository documentation
└── .gitignore
```

---

## Key Features

### 1. Governed Recruitment Pipeline State Machine
Candidate applications follow a deterministic, acyclic state machine rather than arbitrary status edits:
$$\text{APPLIED} \longrightarrow \text{SCREENING} \longrightarrow \text{AI\_ANALYZED} \longrightarrow \text{INTERVIEW\_SCHEDULED} \longrightarrow \text{OFFER\_EXTENDED} \longrightarrow \text{HIRED} \mid \text{REJECTED}$$

* **Prerequisite Enforcement**: Extending an offer requires at least one recorded interview review score.
* **Compliance Audit**: Rejections require an explicit rationale code logged to the audit trail.
* **Privileged Transitions**: Reopening rejected profiles requires administrative privileges.

### 2. Candidate Resume Parsing & Skill Alignment
A two-tier resume evaluation engine that extracts candidate competencies, compares them against required skills, and computes an alignment score (0–100%):
* **Deterministic NLP Heuristics (Default)**: Tokenization, technical synonym mapping, experience weighting, and keyword density. Executes entirely locally with zero external network dependencies.
* **Generative LLM Augmentation (Optional)**: Automatically activates when `GEMINI_API_KEY` is configured, producing qualitative summaries and tailored behavioral interview questions.
* Detailed design specification: [`docs/resume-matching-engine.md`](docs/resume-matching-engine.md).

### 3. Multi-Criteria Composite Scoring
Hiring decisions are calculated using a balanced weighted composite formula to prevent reliance on single subjective reviews or keyword stuffing:
$$\text{Composite Score} = (\text{AI Resume Score} \times 0.30) + (\text{Technical Interview} \times 0.45) + (\text{Culture Fit} \times 0.25)$$

### 4. Role-Based Access Control (RBAC)
Stateless JWT bearer authentication enforcing role boundaries across all API endpoints:
* **Admin**: Full system management, user role configuration, job deletion, and pipeline overrides.
* **Recruiter**: Requisition creation, candidate progression through state transitions, and evaluation triggers.
* **Reviewer**: Technical and soft-skill interview evaluation submission.
* **Applicant**: Public job browsing and self-service application submission.

### 5. Compliance & Audit Logging
Chronological audit logging capturing state transitions, actions, timestamps, and actor IDs across all candidate movements.

---

## Technical Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons | Responsive UI, SSR & client-side caching, dynamic pipeline views |
| **Backend** | Node.js 22, Express.js 4, TypeScript 5, Zod, bcryptjs, jsonwebtoken | Layered service architecture, schema validation, token authentication |
| **Database** | PostgreSQL 18, Prisma ORM 5 | ACID compliance, foreign-key cascade rules, migrations, connection pooling |
| **Testing** | Vitest | Fast unit and integration testing across business logic & calculations |
| **Tooling** | TSX, Morgan, CORS, Git | Hot-reloading development runner, HTTP logging, cross-origin security |

---

## Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **PostgreSQL**: 18.x running locally on port `5432`

---

### Quick Start (Windows)
Double-click [`run-all.bat`](./run-all.bat) at the root of the project to start PostgreSQL, the Express API (Port 5000), and the Next.js frontend (Port 3000) simultaneously.

---

### Manual Setup

#### 1. Configure Environment Variables
Copy the example environment configurations:
```bash
# In backend/
cp backend/.env.example backend/.env

# In frontend/
cp frontend/.env.example frontend/.env
```

Ensure `backend/.env` points to your PostgreSQL instance:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hirepulse_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
```

#### 2. Start Backend REST API (Port 5000)
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

#### 3. Start Frontend Client (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

Access the application in your browser at **`http://localhost:3000`**.

---

## REST API Reference

The backend runs on **`http://localhost:5000`**. The Next.js frontend transparently proxies `/api/*` to this service.

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Create new account with bcrypt password hashing |
| `/api/auth/login` | `POST` | Public | Authenticate user and issue signed JWT token |
| `/api/auth/me` | `GET` | Authenticated | Retrieve authenticated user profile |
| `/api/auth/users` | `GET` | Authenticated | List all active users and assigned roles |
| `/api/jobs` | `GET` | Public | List published jobs with department and query filters |
| `/api/jobs` | `POST` | `ADMIN`, `RECRUITER` | Create job requisition |
| `/api/jobs/departments` | `GET` | Public | Query unique active departments |
| `/api/applications` | `GET` | Authenticated | Query applications with status filters |
| `/api/applications` | `POST` | Public | Submit candidate application with resume |
| `/api/applications/:id` | `GET` | Authenticated | Retrieve application details, reviews, and audit logs |
| `/api/applications/:id/status` | `PATCH` | `ADMIN`, `RECRUITER` | Advance candidate through the workflow state machine |
| `/api/applications/:id/ai-match`| `POST` | `ADMIN`, `RECRUITER` | Execute resume parser and generate tailored interview questions |
| `/api/reviews` | `POST` | `REVIEWER`, `ADMIN` | Record multi-criteria interview score |
| `/api/analytics` | `GET` | Authenticated | Retrieve funnel counts and conversion metrics |

---

## Database Schema (PostgreSQL 18)

Managed via Prisma ORM with foreign keys and compound indexes:

* **`users`**: User identities, credentials (`passwordHash`), roles (`ADMIN`, `RECRUITER`, `REVIEWER`, `APPLICANT`).
* **`jobs`**: Job postings (`title`, `department`, `location`, `requiredSkills`, `status`, `minSalary`, `maxSalary`).
* **`applications`**: Candidate submissions (`jobId`, `fullName`, `email`, `resumeText`, `status`, `aiScore`, `compositeScore`).
* **`reviews`**: Interview evaluations (`applicationId`, `reviewerId`, `technicalScore`, `communicationScore`, `cultureScore`, `recommendation`).
* **`audit_logs`**: Chronological event logs (`applicationId`, `actorId`, `fromStatus`, `toStatus`, `action`, `createdAt`).

---

## Automated Testing

The project includes unit and integration test suites covering state machine transitions, score weighting algorithms, and NLP token matching:

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

---

## Demo Accounts

For demonstration and testing purposes, pre-configured database accounts are available:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hirepulse.nz` | `Password123!` | System administration, role assignment, stage overrides |
| **Recruiter** | `recruiter@hirepulse.nz` | `Password123!` | Job posting, candidate stage advancement, AI analysis |
| **Reviewer** | `lead.dev@hirepulse.nz` | `Password123!` | Technical and culture interview scoring |
| **Applicant** | `s@gmail.com` | `Shuvo5462` | Public job board view and application tracking |

---

## License

MIT
