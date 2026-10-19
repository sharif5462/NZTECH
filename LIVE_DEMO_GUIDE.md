# Live Demonstration & Technical Review Guide
> **Preparation Guide for the NZ Tech Assessment Review & Live Defense (10 Marks)**

---

## 1. 5-Minute Live Walkthrough Script

When the examiners ask you to demonstrate your project, follow this structured narrative:

### Step 1: Objective & Business Problem (1 min)
> *"Hello! For my assessment, I built **HirePulse**, an AI-powered applicant tracking and candidate evaluation pipeline. The goal is to solve the bottleneck engineering teams face when reviewing hundreds of resumes, ensuring fair screening, rigorous status workflows, and continuous compliance."*

### Step 2: The Core User Flow (2 mins)
1. **Show the Dashboard (`/dashboard`)**:
   - Point out the KPI statistics (Total applications, active jobs, average AI fit index).
   - Show the **Recruitment Status Pipeline Funnel** (`Applied` &rarr; `Screening` &rarr; `AI Analyzed` &rarr; `Interview` &rarr; `Offer` &rarr; `Hired`/`Rejected`).
   - Highlight the **Real-time Audit Log** showing the history of actions.
2. **Show Candidate Details & AI Feature (`/applications/[id]`)**:
   - Navigate to Jordan Blake or David Kim.
   - Click **"Run AI Analysis"**: Show how the AI extracts matched skills (green), detects missing gaps (red), and generates **tailored interview questions**.
   - Show the **Weighted Composite Score Card**: Explain how the final score combines AI Resume Fit (30%), Technical Coding (45%), and Culture Fit (25%).
3. **Demonstrate Status Workflow & Business Rules**:
   - Advance Jordan Blake from `INTERVIEW_SCHEDULED` to `OFFER_EXTENDED`.
   - Explain that the system **blocks** extending an offer if no interview reviews are recorded, ensuring quality hiring standards.
   - Click **"Record Interview Score"**: Submit a new review score (e.g., Tech: 9, Comm: 8, Culture: 9), and show the composite score recalculate automatically.

### Step 3: Database & pgAdmin 4 Inspection (1 min)
1. Open **pgAdmin 4**.
2. Expand `hirepulse_db` &rarr; `Schemas` &rarr; `public` &rarr; `Tables`.
3. Open `applications` or `reviews`: Run `SELECT * FROM applications;` to show live persistence.

### Step 4: Testing & Code Quality (1 min)
1. Open terminal: Run `npm test`.
2. Show that all **11 Vitest tests pass** in under 600ms, covering the workflow state machine, scoring mathematics, and AI matching.

---

## 2. Key Architecture & Database Defense

### Question: "Why did you choose Next.js 14 and PostgreSQL with Prisma?"
- **Answer**: 
  - *"Next.js 14 App Router provides a unified TypeScript environment with React Server Components, eliminating CORS issues and client-server synchronization overhead.*
  - *PostgreSQL 18 is an industry-standard ACID-compliant relational database. I modeled explicit foreign keys with cascade deletions, compound indexes on status and email, and text fields for resumes.*
  - *Prisma provides type-safe queries, automatic migration management, and parameterized SQL queries to prevent SQL injection."*

### Question: "Explain your status workflow state machine."
- **Answer**: 
  - *"Located in `src/lib/workflow.ts`. Instead of allowing arbitrary status updates, transitions must follow a directed acyclic graph.*
  - *We enforce business rules: an application cannot jump directly from `APPLIED` to `OFFER_EXTENDED` without screening; an offer cannot be extended without at least one recorded interview review; rejections must log a compliance reason; and reopening a rejected candidate requires `ADMIN` privileges."*

### Question: "How does your AI/ML feature work?"
- **Answer**: 
  - *"Located in `src/lib/aiMatcher.ts`. I designed it as a **dual-mode system**. For guaranteed 100% offline local review without external API dependencies, it runs a deterministic NLP engine with tokenization, synonym matching, experience weighting, and density scoring.*
  - *If an API key is provided in `.env`, it seamlessly upgrades to generative LLM analysis (Gemini/OpenAI) for deeper semantic synthesis."*

---

## 3. Live Code Change Scenarios & Solutions

Interviewers often ask for a short live modification during technical reviews. Here is how to handle the most common requests:

### Scenario A: "Add a minimum salary filter to the Jobs page"
1. Open `src/app/api/jobs/route.ts`:
   - In `GET`, read `searchParams.get("minSalary")`.
   - Add to `where`: `if (minSalary) where.minSalary = { gte: parseInt(minSalary) };`.
2. In `src/app/jobs/page.tsx`:
   - Add a number input `<input type="number" placeholder="Min Salary" onChange={...} />`.

### Scenario B: "Change the weight of the AI Score from 30% to 20% and Technical to 55%"
1. Open `src/lib/scoreCalculator.ts`:
   - Change line 46: `const aiCont = normalizedAi * 0.20;`
   - Change line 47: `const techCont = avgTechPercent * 0.55;`
   - Run `npm test` &rarr; update the expected test value in `tests/scoreCalculator.test.ts`.

### Scenario C: "Add a new stage 'BACKGROUND_CHECK' before HIRED"
1. Open `src/types/index.ts`:
   - Add `"BACKGROUND_CHECK"` to `ApplicationStatus`.
2. Open `src/lib/workflow.ts`:
   - In `ALLOWED_TRANSITIONS`, update `OFFER_EXTENDED: ["BACKGROUND_CHECK", "REJECTED"]`.
   - Add `BACKGROUND_CHECK: ["HIRED", "REJECTED"]`.
3. Open `src/components/StatusBadge.tsx`:
   - Add case `"BACKGROUND_CHECK"` with blue/purple styling.

---

## 4. Helpful Terminal Commands

```bash
# Run Next.js in development mode
npm run dev

# Run automated tests
npm test

# Run Prisma Studio (alternative GUI database browser)
npx prisma studio

# Seed or reset demo data
npm run db:seed
```
