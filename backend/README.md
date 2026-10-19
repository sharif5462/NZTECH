# HirePulse Backend REST API

Standalone backend REST API service for the HirePulse recruitment platform. Built with Express.js, TypeScript, Prisma ORM, and PostgreSQL 18.

---

## Quick Start

### 1. Database Connection
Ensure PostgreSQL is running on port `5432` with database `hirepulse_db`:
```env
DATABASE_URL="postgresql://postgres:Shuvo5462@localhost:5432/hirepulse_db?schema=public"
```

### 2. Install & Start Server (Port 5000)
```bash
npm install
npx prisma generate
npm run dev
```

The server listens on **`http://localhost:5000`**.

---

## Architecture & Modules

* `src/controllers/`: Request handling, parameter extraction, and status responses.
* `src/routes/`: Route definitions with authentication and role-based guards.
* `src/services/`: Core business logic decoupled from HTTP:
  * `workflowService.ts`: Candidate status state machine and rule validation.
  * `scoreService.ts`: Multi-criteria composite score calculations.
  * `aiService.ts`: Deterministic heuristic resume parser and LLM fallback.
* `src/middlewares/`: JWT authentication, Zod request payload validation, and global error handling.
* `prisma/schema.prisma`: Relational database schema with cascade rules and indexes.

---

## API Endpoints

### Authentication (`/api/auth`)
* `POST /api/auth/register`: Register new user
* `POST /api/auth/login`: Authenticate and issue signed JWT Bearer token
* `GET /api/auth/me`: Fetch authenticated user profile
* `GET /api/auth/users`: List active system users and roles

### Jobs (`/api/jobs`)
* `GET /api/jobs`: Query job listings (filters: `?search=react`, `?department=Engineering`)
* `GET /api/jobs/departments`: List active company departments
* `GET /api/jobs/:id`: Fetch single job details
* `POST /api/jobs`: Create position (*Admin / Recruiter*)
* `DELETE /api/jobs/:id`: Delete position (*Admin*)

### Applications (`/api/applications`)
* `GET /api/applications`: Query applications (filters: `?status=SCREENING`)
* `GET /api/applications/:id`: Application details, reviews, and audit logs
* `POST /api/applications`: Submit candidate application with resume text
* `PATCH /api/applications/:id/status`: Advance stage through state machine
* `POST /api/applications/:id/ai-match`: Trigger automated resume analysis

### Reviews (`/api/reviews`)
* `POST /api/reviews`: Submit interview evaluation score (Technical 1–10, Communication 1–10, Culture 1–10)

### Analytics (`/api/analytics`)
* `GET /api/analytics`: Pipeline conversion counts and top candidate rankings
