# NZTech Careers & ATS Deployment Guide

This guide details deployment options for both local development and cloud production on Vercel.

---

## 1. Local Development Setup (PostgreSQL + Express + Next.js)

### Prerequisites
* **Node.js**: v18.0.0+ (v20+ LTS recommended)
* **PostgreSQL**: 18.x installed and running on default port `5432`
* **npm**: v9+

### Environment Setup

#### 1. Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://postgres:Shuvo5462@localhost:5432/hirepulse_db?schema=public"
JWT_SECRET="nztech_enterprise_jwt_secret_key_2026"
# Optional Gemini API key for cloud LLM resume analysis:
GEMINI_API_KEY=""
```

#### 2. Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

### Launching Services (One-Click)
Windows developers can double-click **`run-all.bat`** at the project root (or execute `scripts/run-all.bat`), which:
1. Starts the PostgreSQL 18 database daemon on port `5432`
2. Starts the standalone Express REST API on port `5000`
3. Starts the Next.js 14 frontend on port `3000`

### Command-Line Launcher
```bash
# From project root:
npm run db:push          # Sync database schema with PostgreSQL
npm run dev:backend      # Launch Express API server on port 5000
npm run dev:frontend     # Launch Next.js dev server on port 3000
```

---

## 2. Cloud Production Deployment on Vercel

The frontend is fully optimized for zero-configuration deployment on **Vercel**.

### Vercel Project Configuration
* **Framework Preset**: `Next.js`
* **Root Directory**: `frontend`
* **Build Command**: `next build`
* **Output Directory**: `.next`
* **Install Command**: `npm install`

### Cloud Database Integration (Production)
For live persistence in production, connect any serverless or managed PostgreSQL provider:
* **Neon Serverless Postgres** (`postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`)
* **Supabase** (`postgresql://postgres:pass@db.supabase.co:5432/postgres`)
* **AWS RDS / Railway / Render**

Add the environment variable in the Vercel Dashboard under **Project Settings $\rightarrow$ Environment Variables**:
```
DATABASE_URL=your_production_postgresql_connection_string
JWT_SECRET=your_production_secure_random_jwt_secret
```

### Resilient Hybrid Fallback
If `DATABASE_URL` is not yet provisioned in a new Vercel deployment, the application seamlessly engages its built-in in-memory fallback layer (`dataStore.ts`), ensuring 100% uptime for public job seekers and demonstration reviewers without runtime 500 errors.

---

## 3. Automated Testing & Quality Checks

Run all unit and regression test suites before pushing code to production:

```bash
# Run both frontend and backend suites simultaneously:
npm run test

# Run frontend tests only (11 unit tests):
npm run test:frontend

# Run backend tests only (12 unit tests):
npm run test:backend

# Verify Next.js production build:
npm run build
```

---

## 4. Default Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hirepulse.nz` | `Password123!` | System configuration, stage overrides, job requisition deletion |
| **Recruiter** | `recruiter@hirepulse.nz` | `Password123!` | Candidate pipeline progression, job postings, AI resume scoring |
| **Reviewer** | `lead.dev@hirepulse.nz` | `Password123!` | Technical and culture scorecard evaluation |
| **Applicant** | `s@gmail.com` | `Shuvo5462` | Public job board discovery, instant application submission |
