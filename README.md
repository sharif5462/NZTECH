# HirePulse — AI-Powered ATS & Candidate Evaluation Pipeline
> **NZ Tech Innovation | Full Stack Developer Practical Assessment**

HirePulse is an enterprise-grade Applicant Tracking System (ATS) and recruitment intelligence platform built to solve candidate screening bottlenecks and streamline multi-stage hiring workflows.

---

## 🌟 Key Features & Implementation Highlights

| Evaluation Category | Implementation Details |
| :--- | :--- |
| **Frontend & User Experience** | Responsive Next.js 14 App Router interface with Tailwind CSS, skeleton loaders, interactive status gauges, feedback toasts, and a quick role switcher for assessment reviewers. |
| **Backend & APIs** | RESTful endpoints with input validation via **Zod**, custom error formatting, and role-based access control guards (**RBAC**). |
| **Database & Persistence** | **PostgreSQL 18** managed via **Prisma ORM**, relational foreign keys (`users`, `jobs`, `applications`, `reviews`, `audit_logs`), cascade deletions, indexes, and full support for **pgAdmin 4**. |
| **Business Logic Workflow** | Strict status state machine (`APPLIED` &rarr; `SCREENING` &rarr; `AI_ANALYZED` &rarr; `INTERVIEW_SCHEDULED` &rarr; `OFFER_EXTENDED` &rarr; `HIRED`/`REJECTED`) with automated transition validation, mandatory compliance rejection logging, and weighted composite score algorithms. |
| **AI / Machine Learning** | **Dual-mode AI Matcher**: Offline deterministic NLP heuristic engine (word tokenization, synonym mapping, experience scoring, and tailored interview question generation) + optional Gemini/OpenAI integration. |
| **Security & Validation** | Password hashing with `bcryptjs` (salt rounds = 10), cryptographic JWT tokens (`jose`), HTTP-only secure cookies, and parameterized SQL queries. |
| **Testing & Code Quality** | Automated unit and integration test suite using **Vitest** testing the business state machine, composite calculation, and AI NLP matching. |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Next.js 14 App Router)"]
        UI["Tailwind CSS UI Components"]
        Dashboard["Recruiter Dashboard"]
        Pipeline["Candidate Pipeline Table & Kanban"]
        CandidateBoard["Public Job Board & Apply Portal"]
    end

    subgraph Server ["Server Layer (Route Handlers)"]
        AuthRoute["/api/auth (JWT, Bcrypt, RBAC)"]
        JobsRoute["/api/jobs (CRUD, Filters)"]
        AppRoute["/api/applications (Status State Machine)"]
        AIRoute["/api/applications/[id]/ai-match"]
        ReviewsRoute["/api/reviews (Weighted Composite Scoring)"]
        AnalyticsRoute["/api/analytics (Funnel Metrics)"]
    end

    subgraph Engine ["Business & AI Engine"]
        WorkflowSM["Status State Machine (workflow.ts)"]
        NLPHeuristic["Local NLP Heuristic Matcher"]
        GeminiLLM["Optional Gemini/OpenAI API"]
        ScoreCalc["Composite Score Calculator (scoreCalculator.ts)"]
    end

    subgraph Database ["Persistence Layer"]
        PrismaClient["Prisma ORM Client"]
        PostgresDB[("PostgreSQL 18 Database: hirepulse_db")]
        PgAdmin["pgAdmin 4 GUI Tool"]
    end

    Client --> Server
    Server --> Engine
    Server --> PrismaClient
    PrismaClient --> PostgresDB
    PgAdmin -. Inspects .-> PostgresDB
```

---

## 🗄️ Database Schema & Relationships (PostgreSQL 18)

- **`users`**: System accounts (`ADMIN`, `RECRUITER`, `REVIEWER`, `CANDIDATE`).
- **`jobs`**: Job postings created by recruiters (`title`, `department`, `location`, `requiredSkills`, `status`, etc.).
- **`applications`**: Candidate submissions linked to `jobs` via `jobId` (`resumeText`, `status`, `aiScore`, `compositeScore`, etc.).
- **`reviews`**: Multi-criteria interview feedback linked to `applications` via `applicationId` and `users` via `reviewerId` (`technicalScore`, `communicationScore`, `cultureScore`, `recommendation`, `comments`).
- **`audit_logs`**: Chronological event logs for compliance and traceability (`fromStatus`, `toStatus`, `action`, `actorId`, `timestamp`).

---

## 🚀 Quick Setup Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v22.x recommended)
- **PostgreSQL 18**: Running locally on port `5432`
- **pgAdmin 4**: For visual database inspection

### 2. Environment Configuration
Check the `.env` file in the root directory:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:Shuvo5462@localhost:5432/hirepulse_db?schema=public"

# JWT secret
JWT_SECRET="hirepulse-secure-jwt-secret-token-key-nztech-2026-production"

# Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional External AI API Key (Leave blank to use built-in local NLP engine)
GEMINI_API_KEY=""
```

### 3. Database Migration & Seeding
Run the following commands to synchronize the database schema and populate realistic demo records:
```bash
# Push schema to PostgreSQL
npm run db:push

# Seed demo users, jobs, candidates, reviews, and audit logs
npm run db:seed
```

### 4. Running the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Running Automated Tests
```bash
npm test
```
All 11 unit & integration tests across the state machine, score calculations, and AI matcher will execute.

---

## 🔑 Demo Accounts for Assessment Reviewer

Use the **One-Click Role Switcher** in the top navigation bar, or log in with these credentials:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hirepulse.nz` | `Password123!` | Full system access, delete jobs/applications, reopen rejected candidates. |
| **Recruiter** | `recruiter@hirepulse.nz` | `Password123!` | Create & manage jobs, advance candidate pipeline stages, trigger AI evaluation. |
| **Reviewer / Tech Lead** | `lead.dev@hirepulse.nz` | `Password123!` | View candidate resumes, record interview scores (Tech/Comm/Culture). |
| **Candidate** | `alex.morgan@example.com` | `Password123!` | Public job board view, submit applications. |

---

## 🐘 pgAdmin 4 Inspection Guide

1. Open **pgAdmin 4**.
2. Connect to server **HirePulse NZTech (Port 5432)** or add:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `hirepulse_db`
   - **Username**: `postgres`
   - **Password**: `Shuvo5462`
3. Expand **Databases &rarr; hirepulse_db &rarr; Schemas &rarr; public &rarr; Tables**.
4. You will see all 5 relational tables: `users`, `jobs`, `applications`, `reviews`, and `audit_logs`.

---

## 🧪 Documentation Directory

- **`AI_FEATURE_DOC.md`**: In-depth explanation of the AI / ML feature (inputs, outputs, heuristics, limitations, and evaluation).
- **`LIVE_DEMO_GUIDE.md`**: Guide for the live technical interview and potential live coding tasks.
