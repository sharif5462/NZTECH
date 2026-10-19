# NZTech REST API Specification

This document provides complete technical specifications for all REST API endpoints provided by the NZTech Backend Service.

- **Direct API URL**: `http://localhost:5000/api`
- **Frontend Reverse-Proxy URL**: `http://localhost:3000/api`
- **Content Type**: `application/json`
- **Authentication**: `Authorization: Bearer <jwt_token>`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account with hashed password storage (bcrypt).
* **Access**: Public
* **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "Jane Doe",
  "role": "APPLICANT"
}
```
* **Success Response (`201 Created`)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "usr-123",
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "role": "APPLICANT",
    "createdAt": "2026-10-19T10:00:00.000Z"
  }
}
```

---

### `POST /api/auth/login`
Authenticates user credentials and issues a signed JSON Web Token (JWT).
* **Access**: Public
* **Request Body**:
```json
{
  "email": "admin@hirepulse.nz",
  "password": "Password123!"
}
```
* **Success Response (`200 OK`)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr-admin",
    "email": "admin@hirepulse.nz",
    "fullName": "System Administrator",
    "role": "ADMIN"
  }
}
```

---

### `GET /api/auth/me`
Fetches the currently authenticated profile from the provided bearer token.
* **Access**: Authenticated (`ADMIN`, `RECRUITER`, `REVIEWER`, `APPLICANT`)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (`200 OK`)**:
```json
{
  "user": {
    "id": "usr-admin",
    "email": "admin@hirepulse.nz",
    "fullName": "System Administrator",
    "role": "ADMIN"
  }
}
```

---

### `GET /api/auth/users`
Lists all active users registered in the system.
* **Access**: Authenticated (`ADMIN`, `RECRUITER`)
* **Success Response (`200 OK`)**:
```json
[
  {
    "id": "usr-1",
    "email": "admin@hirepulse.nz",
    "fullName": "System Administrator",
    "role": "ADMIN"
  }
]
```

---

## 2. Job Requisition Endpoints

### `GET /api/jobs`
Retrieves published job requisitions. Supports filtering by search keyword and department.
* **Access**: Public
* **Query Parameters**:
  * `search` (optional string): Keyword match against title or description
  * `department` (optional string): Filter by department name
* **Success Response (`200 OK`)**:
```json
[
  {
    "id": "job-1",
    "title": "Senior Full-Stack Engineer (Next.js & TypeScript)",
    "department": "Engineering",
    "location": "Auckland, NZ (Hybrid)",
    "employmentType": "FULL_TIME",
    "experienceLevel": "SENIOR",
    "requiredSkills": "React, Next.js, Node.js, TypeScript, PostgreSQL",
    "minSalary": 120000,
    "maxSalary": 150000,
    "status": "PUBLISHED",
    "company": "NZTech Cloud Services",
    "deadline": "2026-11-30",
    "isHot": true,
    "_count": { "applications": 8 }
  }
]
```

---

### `POST /api/jobs`
Creates a new job requisition.
* **Access**: Authenticated (`ADMIN`, `RECRUITER`)
* **Request Body**:
```json
{
  "title": "Lead DevOps Architect",
  "department": "Cloud & Infrastructure",
  "location": "Wellington, NZ (Remote)",
  "employmentType": "FULL_TIME",
  "experienceLevel": "LEAD",
  "requiredSkills": "Kubernetes, Terraform, AWS, Docker",
  "jobDescription": "Architect scalable infrastructure across multi-region clusters.",
  "minSalary": 140000,
  "maxSalary": 175000,
  "company": "NZTech Cloud Services",
  "deadline": "2026-12-15",
  "isHot": true
}
```
* **Success Response (`201 Created`)**

---

### `GET /api/jobs/departments`
Returns a distinct list of active functional departments across open jobs.
* **Access**: Public
* **Success Response (`200 OK`)**:
```json
[
  "Engineering",
  "Product & Design",
  "Cloud & Infrastructure",
  "Data Science & AI",
  "Customer Success"
]
```

---

## 3. Candidate Application Endpoints

### `GET /api/applications`
Queries candidate applications. Recruiter and Admin users see all applicants; regular applicants view their own submissions.
* **Access**: Authenticated
* **Query Parameters**:
  * `status` (optional string): Filter by stage (`APPLIED`, `SCREENING`, `AI_ANALYZED`, `INTERVIEW_SCHEDULED`, `OFFER_EXTENDED`, `HIRED`, `REJECTED`)
  * `jobId` (optional string): Filter by specific requisition
* **Success Response (`200 OK`)**:
```json
[
  {
    "id": "app-1",
    "jobId": "job-1",
    "fullName": "Liam Henderson",
    "email": "liam.henderson@nztech.example.com",
    "experienceYears": 6,
    "status": "INTERVIEW_SCHEDULED",
    "aiScore": 88,
    "compositeScore": 85.5,
    "job": {
      "title": "Senior Full-Stack Engineer",
      "department": "Engineering"
    }
  }
]
```

---

### `POST /api/applications`
Submits a candidate application with resume profile text.
* **Access**: Public / Authenticated
* **Request Body**:
```json
{
  "jobId": "job-1",
  "fullName": "Liam Henderson",
  "email": "liam.henderson@example.com",
  "phone": "+64 21 555 0199",
  "experienceYears": 6,
  "resumeText": "Senior Full-Stack Engineer with 6 years experience in Next.js, Node.js, TypeScript and PostgreSQL."
}
```
* **Success Response (`201 Created`)**

---

### `GET /api/applications/:id`
Retrieves comprehensive details for an application including candidate resume, parsed AI analysis, interview reviews, and chronological audit logs.
* **Access**: Authenticated
* **Success Response (`200 OK`)**:
```json
{
  "id": "app-1",
  "jobId": "job-1",
  "fullName": "Liam Henderson",
  "email": "liam.henderson@nztech.example.com",
  "experienceYears": 6,
  "status": "INTERVIEW_SCHEDULED",
  "aiScore": 88,
  "compositeScore": 85.5,
  "job": { "title": "Senior Full-Stack Engineer" },
  "reviews": [
    {
      "id": "rev-1",
      "technicalScore": 9,
      "communicationScore": 8,
      "cultureScore": 8,
      "feedback": "Strong architectural grounding in Next.js SSR and PostgreSQL concurrency.",
      "recommendation": "STRONG_HIRE",
      "reviewer": { "fullName": "Lead Architect" }
    }
  ],
  "auditLogs": [
    {
      "id": "log-1",
      "fromStatus": "SCREENING",
      "toStatus": "INTERVIEW_SCHEDULED",
      "action": "ADVANCE_STAGE",
      "createdAt": "2026-10-19T08:30:00.000Z"
    }
  ]
}
```

---

### `PATCH /api/applications/:id/status`
Advances or changes a candidate stage through the governed state machine.
* **Access**: Authenticated (`ADMIN`, `RECRUITER`)
* **Request Body**:
```json
{
  "status": "OFFER_EXTENDED",
  "rejectionReason": null
}
```
* **Success Response (`200 OK`)**
* **Error Response (`400 Bad Request`)**:
```json
{
  "error": "Cannot extend an employment offer without at least one recorded technical or culture review"
}
```

---

### `POST /api/applications/:id/ai-match`
Executes the resume parsing engine against the job requirements, updating `aiScore` and `compositeScore`.
* **Access**: Authenticated (`ADMIN`, `RECRUITER`)
* **Success Response (`200 OK`)**:
```json
{
  "score": 88,
  "matchLevel": "HIGH_MATCH",
  "summary": "Liam Henderson demonstrates a high match for Senior Full-Stack Engineer. Matched 5/5 required skills.",
  "matchedSkills": ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL"],
  "missingSkills": [],
  "recommendedQuestions": [
    "What is the most complex architecture challenge you resolved using React?",
    "Walk us through how you trace and debug performance bottlenecks in high-concurrency APIs."
  ]
}
```

---

## 4. Review & Scorecard Endpoints

### `POST /api/reviews`
Records a structured multi-criteria interview evaluation. Automatically recalculates candidate composite score.
* **Access**: Authenticated (`ADMIN`, `REVIEWER`)
* **Request Body**:
```json
{
  "applicationId": "app-1",
  "technicalScore": 9,
  "communicationScore": 8,
  "cultureScore": 8,
  "feedback": "Candidate articulated clean state boundaries and scalable caching patterns.",
  "recommendation": "STRONG_HIRE"
}
```
* **Success Response (`201 Created`)**

---

## 5. Analytics Endpoints

### `GET /api/analytics`
Fetches operational recruiting metrics and recruitment funnel stage counts.
* **Access**: Authenticated
* **Success Response (`200 OK`)**:
```json
{
  "metrics": {
    "totalApplications": 24,
    "activeJobs": 8,
    "interviewsScheduled": 6,
    "offersExtended": 3,
    "hiredCount": 2,
    "averageTimeToHireDays": 14.5
  },
  "funnel": [
    { "status": "APPLIED", "count": 24 },
    { "status": "SCREENING", "count": 18 },
    { "status": "AI_ANALYZED", "count": 15 },
    { "status": "INTERVIEW_SCHEDULED", "count": 6 },
    { "status": "OFFER_EXTENDED", "count": 3 },
    { "status": "HIRED", "count": 2 }
  ]
}
```
