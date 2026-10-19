# RestAPINZtech — Standalone Express & TypeScript REST API
> **HirePulse Recruitment Platform | Standalone Backend REST API**

This is the decoupled, standalone backend REST API service for the HirePulse recruitment platform. It runs on Express.js, TypeScript, Prisma ORM, and PostgreSQL 18.

---

## 🚀 Quick Start

### 1. Start PostgreSQL (Port 5432)
Ensure your PostgreSQL instance is running on port `5432` with database `hirepulse_db`.

### 2. Install & Run API Server (Port 5000)
```bash
cd "D:\My Project\RestAPINZtech"
npm install
npm run dev
```
*(Or simply double-click `run-api.bat`)*

The server will start at: **`http://localhost:5000`**

---

## 📡 API Endpoints

### 1. Authentication (`/api/auth`)
- **`POST /api/auth/register`**: Register new user
  ```json
  { "name": "Sarah", "email": "sarah@nz.co", "password": "Password123!", "role": "RECRUITER" }
  ```
- **`POST /api/auth/login`**: Login user
  ```json
  { "email": "recruiter@hirepulse.nz", "password": "Password123!" }
  ```
  *Returns JWT Bearer token.*
- **`GET /api/auth/me`**: Get current user profile (Header: `Authorization: Bearer <TOKEN>`)

### 2. Jobs (`/api/jobs`)
- **`GET /api/jobs`**: List all jobs (filters: `?search=react`, `?department=Engineering`)
- **`GET /api/jobs/:id`**: Single job details
- **`POST /api/jobs`**: Create position *(Requires RECRUITER or ADMIN token)*
- **`DELETE /api/jobs/:id`**: Delete position *(Requires ADMIN token)*

### 3. Applications (`/api/applications`)
- **`GET /api/applications`**: List all candidate applications (filters: `?status=SCREENING`)
- **`GET /api/applications/:id`**: Full application details + reviews + audit trail
- **`POST /api/applications`**: Submit application
- **`POST /api/applications/:id/status`**: Transition status via State Machine *(Requires RECRUITER or ADMIN token)*
- **`POST /api/applications/:id/ai-match`**: Trigger AI NLP resume matching

### 4. Reviews (`/api/reviews`)
- **`POST /api/reviews`**: Submit interview score (Technical 1-10, Communication 1-10, Culture 1-10)

### 5. Analytics (`/api/analytics`)
- **`GET /api/analytics`**: Real-time pipeline funnel counts & top candidates
