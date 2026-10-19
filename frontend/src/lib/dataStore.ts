import bcrypt from "bcryptjs";
import { UserRole, ApplicationStatus } from "@/types";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface StoredJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  minSalary?: number;
  maxSalary?: number;
  requiredSkills: string;
  experienceLevel: string;
  description: string;
  status: string;
  createdAt: string;
  _count?: { applications: number };
}

export interface StoredReview {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  technicalScore: number;
  communicationScore: number;
  cultureScore: number;
  recommendation: string;
  comments: string;
  createdAt: string;
}

export interface StoredAuditLog {
  id: string;
  applicationId: string;
  actorId?: string;
  actorName?: string;
  fromStatus: string;
  toStatus: string;
  action: string;
  timestamp: string;
}

export interface StoredApplication {
  id: string;
  jobId: string;
  jobTitle?: string;
  jobDepartment?: string;
  fullName: string;
  email: string;
  phone?: string;
  experienceYears: number;
  resumeText: string;
  status: ApplicationStatus;
  aiScore?: number;
  aiSummary?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  suggestedQuestions?: string[];
  compositeScore?: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Global in-memory singleton to persist between hot-reloads and serverless invocations
declare global {
  var __hirepulse_store__: {
    users: StoredUser[];
    jobs: StoredJob[];
    applications: StoredApplication[];
    reviews: StoredReview[];
    auditLogs: StoredAuditLog[];
    initialized: boolean;
  } | undefined;
}

function initStore() {
  if (global.__hirepulse_store__?.initialized) {
    return global.__hirepulse_store__;
  }

  const saltRounds = 10;
  const adminHash = bcrypt.hashSync("Password123!", saltRounds);
  const shuvoHash = bcrypt.hashSync("Shuvo5462", saltRounds);

  const users: StoredUser[] = [
    {
      id: "usr-admin-01",
      name: "Admin User",
      email: "admin@hirepulse.nz",
      passwordHash: adminHash,
      role: "ADMIN",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-recruiter-01",
      name: "Sarah Jenkins",
      email: "recruiter@hirepulse.nz",
      passwordHash: adminHash,
      role: "RECRUITER",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-reviewer-01",
      name: "Alex Rivera",
      email: "lead.dev@hirepulse.nz",
      passwordHash: adminHash,
      role: "REVIEWER",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-candidate-01",
      name: "Sharif Shuvo",
      email: "s@gmail.com",
      passwordHash: shuvoHash,
      role: "APPLICANT",
      createdAt: new Date().toISOString(),
    },
  ];

  const jobs: StoredJob[] = [
    {
      id: "job-1",
      title: "Senior Full Stack Developer",
      department: "Core Engineering",
      location: "Auckland, NZ (Hybrid)",
      type: "Full-Time",
      minSalary: 120000,
      maxSalary: 150000,
      requiredSkills: "React, Node.js, TypeScript, PostgreSQL, Docker, Next.js",
      experienceLevel: "Senior",
      description: "Design and implement scalable microservices and intuitive responsive frontends. Oversee state architecture and PostgreSQL database migrations.",
      status: "OPEN",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "job-2",
      title: "DevOps & Cloud Platform Engineer",
      department: "Platform Squad",
      location: "Remote (NZ/AU)",
      type: "Full-Time",
      minSalary: 130000,
      maxSalary: 160000,
      requiredSkills: "Kubernetes, AWS, Terraform, Docker, CI/CD, Linux",
      experienceLevel: "Senior",
      description: "Build robust infrastructure automation, maintain multi-region Kubernetes clusters, and optimize deployment pipelines for high-traffic services.",
      status: "OPEN",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "job-3",
      title: "Product UX/UI Designer",
      department: "Design & Product",
      location: "Wellington, NZ (On-site)",
      type: "Full-Time",
      minSalary: 95000,
      maxSalary: 120000,
      requiredSkills: "Figma, Design Systems, User Research, Prototyping, Wireframing",
      experienceLevel: "Mid-Level",
      description: "Craft human-centered interfaces, lead user feedback sessions, and maintain our enterprise design system.",
      status: "OPEN",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  const applications: StoredApplication[] = [
    {
      id: "app-1",
      jobId: "job-1",
      jobTitle: "Senior Full Stack Developer",
      jobDepartment: "Core Engineering",
      fullName: "Jordan Blake",
      email: "jordan.blake@example.com",
      phone: "+64 21 555 0192",
      experienceYears: 6.5,
      resumeText: "Accomplished Senior Full Stack Engineer with 6.5 years building distributed React, Node.js, Next.js, and TypeScript applications. Deep experience optimizing PostgreSQL databases, writing Prisma migrations, and deploying containerized Docker services on AWS.",
      status: "INTERVIEW_SCHEDULED",
      aiScore: 92,
      aiSummary: "Jordan Blake demonstrates a high match for Senior Full Stack Developer. Matched 6 of 6 skills (React, Node.js, TypeScript, PostgreSQL, Docker, Next.js) with 6.5 years verified experience.",
      matchedSkills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "Next.js"],
      missingSkills: [],
      suggestedQuestions: [
        "Explain your approach to database indexing and connection pooling in high-concurrency PostgreSQL environments.",
        "How do you design type-safe communication contracts between Next.js frontends and backend REST microservices?",
      ],
      compositeScore: 88.5,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: "app-2",
      jobId: "job-1",
      jobTitle: "Senior Full Stack Developer",
      jobDepartment: "Core Engineering",
      fullName: "David Kim",
      email: "david.kim@example.com",
      phone: "+64 22 411 9820",
      experienceYears: 2.0,
      resumeText: "Junior Web Developer skilled in React and JavaScript. Familiar with Node.js basics and SQLite. Eager to learn Docker, TypeScript, and large-scale cloud PostgreSQL.",
      status: "SCREENING",
      aiScore: 52,
      aiSummary: "David Kim demonstrates an entry-level match. Missing senior core competencies (Docker, Next.js, PostgreSQL). Junior seniority gap identified.",
      matchedSkills: ["React", "Node.js"],
      missingSkills: ["Docker", "Next.js", "PostgreSQL", "TypeScript"],
      suggestedQuestions: [
        "How would you approach bridging knowledge gaps in Docker containerization and TypeScript within your first 30 days?",
      ],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "app-3",
      jobId: "job-2",
      jobTitle: "DevOps & Cloud Platform Engineer",
      jobDepartment: "Platform Squad",
      fullName: "Elena Rostova",
      email: "elena.rostova@cloudops.nz",
      phone: "+64 27 889 1234",
      experienceYears: 5.0,
      resumeText: "Platform Engineer specializing in AWS EKS Kubernetes clusters, Terraform infrastructure-as-code, and resilient CI/CD pipelines using GitHub Actions and Docker.",
      status: "AI_ANALYZED",
      aiScore: 88,
      aiSummary: "Elena Rostova shows a strong match for Cloud Platform Engineer with extensive Kubernetes and Terraform experience.",
      matchedSkills: ["Kubernetes", "AWS", "Terraform", "Docker", "CI/CD", "Linux"],
      missingSkills: [],
      suggestedQuestions: [
        "How do you handle zero-downtime rolling deployments and canary releases across Kubernetes clusters?",
      ],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: "app-4",
      jobId: "job-3",
      jobTitle: "Product UX/UI Designer",
      jobDepartment: "Design & Product",
      fullName: "Marcus Vance",
      email: "marcus.vance@design.nz",
      phone: "+64 21 999 8765",
      experienceYears: 4.5,
      resumeText: "Product Designer with 4.5 years creating design systems in Figma, conducting quantitative user usability testing, and crafting interactive component libraries.",
      status: "OFFER_EXTENDED",
      aiScore: 85,
      aiSummary: "Marcus Vance demonstrates an exceptional profile matching all UX design system requirements.",
      matchedSkills: ["Figma", "Design Systems", "User Research", "Prototyping", "Wireframing"],
      missingSkills: [],
      suggestedQuestions: [],
      compositeScore: 91.0,
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: "app-5",
      jobId: "job-1",
      jobTitle: "Senior Full Stack Developer",
      jobDepartment: "Core Engineering",
      fullName: "Sophia Patel",
      email: "sophia.patel@tech.co.nz",
      phone: "+64 21 345 6789",
      experienceYears: 4.0,
      resumeText: "Full stack engineer building TypeScript applications with React, Express, and PostgreSQL. Experienced in API design and unit testing with Vitest.",
      status: "APPLIED",
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  const reviews: StoredReview[] = [
    {
      id: "rev-1",
      applicationId: "app-1",
      reviewerId: "usr-reviewer-01",
      reviewerName: "Alex Rivera",
      technicalScore: 9,
      communicationScore: 8,
      cultureScore: 9,
      recommendation: "Strong hire. Excellent architectural understanding and clean coding standards.",
      comments: "Jordan excelled at the technical system design and live coding challenge.",
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  const auditLogs: StoredAuditLog[] = [
    {
      id: "log-1",
      applicationId: "app-1",
      actorId: "usr-recruiter-01",
      actorName: "Sarah Jenkins",
      fromStatus: "APPLIED",
      toStatus: "SCREENING",
      action: "ADVANCE_STAGE",
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "log-2",
      applicationId: "app-1",
      actorId: "usr-recruiter-01",
      actorName: "Sarah Jenkins",
      fromStatus: "SCREENING",
      toStatus: "AI_ANALYZED",
      action: "RUN_AI_MATCH",
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "log-3",
      applicationId: "app-1",
      actorId: "usr-recruiter-01",
      actorName: "Sarah Jenkins",
      fromStatus: "AI_ANALYZED",
      toStatus: "INTERVIEW_SCHEDULED",
      action: "ADVANCE_STAGE",
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  const store = {
    users,
    jobs,
    applications,
    reviews,
    auditLogs,
    initialized: true,
  };

  global.__hirepulse_store__ = store;
  return store;
}

export const dbStore = {
  getStore: initStore,

  // Users
  findUserByEmail(email: string) {
    const s = initStore();
    return s.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById(id: string) {
    const s = initStore();
    return s.users.find((u) => u.id === id);
  },
  createUser(userData: Omit<StoredUser, "id" | "createdAt">) {
    const s = initStore();
    const newUser: StoredUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    s.users.push(newUser);
    return newUser;
  },
  getAllUsers() {
    const s = initStore();
    return s.users.map(({ passwordHash, ...safeUser }) => safeUser);
  },

  // Jobs
  getJobs(filters?: { search?: string; department?: string; type?: string }) {
    const s = initStore();
    let result = [...s.jobs];

    if (filters?.department) {
      result = result.filter((j) => j.department.toLowerCase() === filters.department!.toLowerCase());
    }
    if (filters?.type) {
      result = result.filter((j) => j.type.toLowerCase() === filters.type!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q) ||
          j.requiredSkills.toLowerCase().includes(q)
      );
    }

    return result.map((j) => ({
      ...j,
      _count: {
        applications: s.applications.filter((a) => a.jobId === j.id).length,
      },
    }));
  },
  getJobById(id: string) {
    const s = initStore();
    const job = s.jobs.find((j) => j.id === id);
    if (!job) return null;
    return {
      ...job,
      _count: {
        applications: s.applications.filter((a) => a.jobId === id).length,
      },
    };
  },
  createJob(jobData: Omit<StoredJob, "id" | "createdAt">) {
    const s = initStore();
    const newJob: StoredJob = {
      ...jobData,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    s.jobs.unshift(newJob);
    return newJob;
  },
  deleteJob(id: string) {
    const s = initStore();
    const idx = s.jobs.findIndex((j) => j.id === id);
    if (idx !== -1) {
      s.jobs.splice(idx, 1);
      return true;
    }
    return false;
  },
  getDepartments() {
    const s = initStore();
    return Array.from(new Set(s.jobs.map((j) => j.department)));
  },

  // Applications
  getApplications(filters?: { jobId?: string; status?: string; search?: string }) {
    const s = initStore();
    let result = [...s.applications];

    if (filters?.jobId) {
      result = result.filter((a) => a.jobId === filters.jobId);
    }
    if (filters?.status) {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.fullName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.jobTitle && a.jobTitle.toLowerCase().includes(q))
      );
    }

    return result.map((a) => {
      const job = s.jobs.find((j) => j.id === a.jobId);
      const appReviews = s.reviews.filter((r) => r.applicationId === a.id);
      return {
        ...a,
        candidateName: a.fullName,
        candidateEmail: a.email,
        candidatePhone: a.phone,
        job: job ? { id: job.id, title: job.title, department: job.department } : undefined,
        reviews: appReviews,
        _count: { reviews: appReviews.length },
      };
    });
  },
  getApplicationById(id: string) {
    const s = initStore();
    const app = s.applications.find((a) => a.id === id);
    if (!app) return null;
    const job = s.jobs.find((j) => j.id === app.jobId);
    const appReviews = s.reviews
      .filter((r) => r.applicationId === id)
      .map((r) => ({
        ...r,
        overallScore: Math.round(((r.technicalScore + r.communicationScore + r.cultureScore) / 3) * 10) / 10,
        reviewer: {
          id: r.reviewerId,
          name: r.reviewerName || "Alex Rivera",
          role: "REVIEWER",
        },
      }));
    const appLogs = s.auditLogs
      .filter((l) => l.applicationId === id)
      .map((l) => ({
        ...l,
        createdAt: l.timestamp,
        details: `${l.actorName || "Recruiter"} moved candidate from ${l.fromStatus} to ${l.toStatus}`,
        actor: {
          name: l.actorName || "System Automated",
          role: "RECRUITER",
        },
      }));

    return {
      ...app,
      candidateName: app.fullName,
      candidateEmail: app.email,
      candidatePhone: app.phone,
      stageChangedAt: app.updatedAt || app.createdAt,
      aiMatchedSkills: JSON.stringify(app.matchedSkills || []),
      aiMissingSkills: JSON.stringify(app.missingSkills || []),
      aiRecommendedQuestions: JSON.stringify(app.suggestedQuestions || []),
      job: job || {
        id: app.jobId,
        title: app.jobTitle || "Engineering Position",
        department: app.jobDepartment || "Core Engineering",
        location: "Auckland, New Zealand",
        type: "Full-time",
        experienceLevel: "Senior",
        requiredSkills: "TypeScript, React, Node.js",
        description: "Software engineering position.",
      },
      reviews: appReviews,
      auditLogs: appLogs,
    };
  },
  createApplication(appData: Omit<StoredApplication, "id" | "createdAt" | "updatedAt">) {
    const s = initStore();
    const job = s.jobs.find((j) => j.id === appData.jobId);
    const newApp: StoredApplication = {
      ...appData,
      jobTitle: job?.title || appData.jobTitle,
      jobDepartment: job?.department || appData.jobDepartment,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    s.applications.unshift(newApp);

    // Record submission in audit log
    s.auditLogs.unshift({
      id: `log-${Date.now()}`,
      applicationId: newApp.id,
      actorName: newApp.fullName,
      fromStatus: "NONE",
      toStatus: "APPLIED",
      action: "SUBMIT_APPLICATION",
      timestamp: new Date().toISOString(),
    });

    return newApp;
  },
  updateApplication(id: string, updates: Partial<StoredApplication>) {
    const s = initStore();
    const idx = s.applications.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    s.applications[idx] = {
      ...s.applications[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return s.applications[idx];
  },

  // Reviews
  createReview(reviewData: Omit<StoredReview, "id" | "createdAt">) {
    const s = initStore();
    const newReview: StoredReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    s.reviews.push(newReview);
    return newReview;
  },
  getReviewsForApplication(applicationId: string) {
    const s = initStore();
    return s.reviews.filter((r) => r.applicationId === applicationId);
  },

  // Audit Logs
  createAuditLog(logData: Omit<StoredAuditLog, "id" | "timestamp">) {
    const s = initStore();
    const newLog: StoredAuditLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    s.auditLogs.unshift(newLog);
    return newLog;
  },

  // Analytics
  getAnalytics() {
    const s = initStore();
    const apps = s.applications;
    const stages: Record<string, number> = {
      APPLIED: 0,
      SCREENING: 0,
      AI_ANALYZED: 0,
      INTERVIEW_SCHEDULED: 0,
      OFFER_EXTENDED: 0,
      HIRED: 0,
      REJECTED: 0,
    };

    apps.forEach((a) => {
      if (stages[a.status] !== undefined) {
        stages[a.status]++;
      }
    });

    const evaluated = apps.filter((a) => a.aiScore !== undefined && a.aiScore !== null);
    const avgScore =
      evaluated.length > 0
        ? Math.round(evaluated.reduce((acc, a) => acc + (a.aiScore || 0), 0) / evaluated.length)
        : 0;

    return {
      metrics: {
        totalApplications: apps.length,
        total: apps.length,
        activeJobs: s.jobs.length,
        avgAiScore: avgScore,
        averageFitIndex: avgScore,
        offersExtended: stages.OFFER_EXTENDED + stages.HIRED,
        pipelineBreakdown: stages,
      },
      stages,
      pipelineBreakdown: stages,
      topCandidates: apps
        .filter((a) => a.status !== "REJECTED")
        .sort((a, b) => (b.compositeScore || b.aiScore || 0) - (a.compositeScore || a.aiScore || 0))
        .slice(0, 5)
        .map((a) => {
          const job = s.jobs.find((j) => j.id === a.jobId);
          return {
            id: a.id,
            candidateName: a.fullName,
            candidateEmail: a.email,
            status: a.status,
            aiScore: a.aiScore,
            compositeScore: a.compositeScore,
            job: job ? { title: job.title } : undefined,
          };
        }),
      recentActivity: s.auditLogs.slice(0, 8).map((log) => ({
        id: log.id,
        action: log.action,
        fromStatus: log.fromStatus,
        toStatus: log.toStatus,
        details: `${log.actorName || "Recruiter"} updated candidate status to ${log.toStatus}`,
        createdAt: log.timestamp,
        actor: { name: log.actorName || "System Automated", role: "RECRUITER" },
      })),
    };
  },
};
