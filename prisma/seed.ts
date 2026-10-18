import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PostgreSQL database for NZ Tech HirePulse...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Sarah Jenkins (Head of Talent)",
      email: "admin@hirepulse.nz",
      passwordHash,
      role: "ADMIN",
    },
  });

  const recruiter = await prisma.user.create({
    data: {
      name: "Marcus Vance (Senior Tech Recruiter)",
      email: "recruiter@hirepulse.nz",
      passwordHash,
      role: "RECRUITER",
    },
  });

  const reviewer = await prisma.user.create({
    data: {
      name: "Liam Chen (Principal Engineer)",
      email: "lead.dev@hirepulse.nz",
      passwordHash,
      role: "REVIEWER",
    },
  });

  const candidateUser = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      passwordHash,
      role: "CANDIDATE",
    },
  });

  console.log("Users created successfully.");

  // 2. Create Jobs
  const jobFullstack = await prisma.job.create({
    data: {
      title: "Senior Full Stack Developer",
      department: "Core Engineering",
      location: "Auckland, New Zealand (Hybrid)",
      type: "Full-time",
      experienceLevel: "Senior",
      minSalary: 135000,
      maxSalary: 165000,
      currency: "NZD",
      description: `We are seeking an experienced Full Stack Developer to lead development across our high-throughput SaaS platform. 
You will architect microservices, build delightful responsive React interfaces, design relational database schemas, and integrate intelligent AI automation features.

Key Responsibilities:
• Build resilient APIs using Node.js, TypeScript, and modern frameworks.
• Design responsive web apps with Next.js, React, and Tailwind CSS.
• Optimize PostgreSQL queries and maintain scalable database migrations.
• Implement automated CI/CD workflows and Dockerized deployments.`,
      requiredSkills: "TypeScript, React, Node.js, PostgreSQL, Docker, Next.js, REST",
      status: "ACTIVE",
      createdById: recruiter.id,
    },
  });

  const jobFrontend = await prisma.job.create({
    data: {
      title: "Frontend UI/UX Engineer",
      department: "Product & Experience",
      location: "Wellington, New Zealand (Remote)",
      type: "Remote",
      experienceLevel: "Mid-Level",
      minSalary: 105000,
      maxSalary: 125000,
      currency: "NZD",
      description: `Join our design systems and frontend performance squad. You will be responsible for creating accessible, fluid component libraries and stateful user interactions.`,
      requiredSkills: "JavaScript, TypeScript, React, Tailwind CSS, Next.js, Redux",
      status: "ACTIVE",
      createdById: recruiter.id,
    },
  });

  const jobBackend = await prisma.job.create({
    data: {
      title: "Cloud & Distributed Systems Architect",
      department: "Infrastructure",
      location: "Christchurch, New Zealand (On-site)",
      type: "Full-time",
      experienceLevel: "Lead",
      minSalary: 160000,
      maxSalary: 190000,
      currency: "NZD",
      description: `Architect enterprise-grade cloud backends, message queues (Kafka/RabbitMQ), and Kubernetes cluster orchestration for multi-tenant fintech workloads.`,
      requiredSkills: "Golang, Python, Kubernetes, AWS, PostgreSQL, Docker, Microservices",
      status: "ACTIVE",
      createdById: admin.id,
    },
  });

  console.log("Jobs created successfully.");

  // 3. Create Applications
  // Candidate 1: High fit candidate - Stage: INTERVIEW_SCHEDULED
  const app1 = await prisma.application.create({
    data: {
      jobId: jobFullstack.id,
      candidateName: "Jordan Blake",
      candidateEmail: "jordan.blake@techmail.nz",
      candidatePhone: "+64 21 892 4110",
      portfolioUrl: "https://jordanblake.dev",
      githubUrl: "https://github.com/jordanblake-dev",
      linkedinUrl: "https://linkedin.com/in/jordanblake-nz",
      experienceYears: 6.5,
      status: "INTERVIEW_SCHEDULED",
      stageChangedAt: new Date(),
      resumeText: `Jordan Blake - Senior Software Engineer
Summary: 6.5 years building distributed full-stack applications with TypeScript, React, Node.js, Next.js, and PostgreSQL. Experienced in containerizing microservices with Docker and maintaining 99.98% SLA deployments.
Technical Skills:
- Languages: TypeScript, JavaScript, SQL
- Frontend: React, Next.js, Tailwind CSS, HTML5, CSS3
- Backend: Node.js, Express, REST APIs, Prisma ORM
- Database: PostgreSQL, Redis
- DevOps: Docker, GitHub Actions, AWS (S3, ECS, RDS)
Experience:
Senior Software Developer @ CloudPeak NZ (2022 - Present)
- Migrated monolithic REST service into 4 modular microservices using Node.js & Docker.
- Reduced PostgreSQL query latency by 45% via indexing and read-replica routing.`,
      aiScore: 92,
      aiMatchLevel: "HIGH_MATCH",
      aiSummary:
        "Jordan Blake is an exceptional candidate for Senior Full Stack Developer. Strong 6.5 years experience with complete coverage of TypeScript, React, Node.js, PostgreSQL, Next.js, and Docker.",
      aiMatchedSkills: JSON.stringify(["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "Next.js", "REST"]),
      aiMissingSkills: JSON.stringify([]),
      aiRecommendedQuestions: JSON.stringify([
        "You led a migration from monolith to microservices using Node.js. How did you maintain transaction atomicity and consistency across services?",
        "How do you design high-availability backend services to ensure graceful degradation and fault tolerance during peak traffic?",
        "Explain your methodology for database indexing and query optimization in PostgreSQL under high concurrency.",
      ]),
      aiEvaluatedAt: new Date(),
      compositeScore: 88.6,
    },
  });

  // Candidate 2: Stage: AI_ANALYZED (Moderate match)
  const app2 = await prisma.application.create({
    data: {
      jobId: jobFullstack.id,
      candidateName: "Priya Sharma",
      candidateEmail: "priya.sharma@innovate.co.nz",
      candidatePhone: "+64 22 415 9081",
      portfolioUrl: "https://priyasharma.io",
      githubUrl: "https://github.com/priyasharma",
      experienceYears: 4.0,
      status: "AI_ANALYZED",
      stageChangedAt: new Date(),
      resumeText: `Priya Sharma - Full Stack Developer
Experience: 4 years of software development.
Proficient in React, JavaScript, TypeScript, Node.js, and MongoDB.
Built responsive client-side web portals and integrated RESTful endpoints.
Looking to deepen cloud infrastructure experience.`,
      aiScore: 74,
      aiMatchLevel: "MODERATE_MATCH",
      aiSummary:
        "Priya Sharma shows solid full stack capabilities across React, TypeScript, and Node.js. Missing dedicated experience in Docker containerization and relational PostgreSQL.",
      aiMatchedSkills: JSON.stringify(["React", "TypeScript", "Node.js", "REST"]),
      aiMissingSkills: JSON.stringify(["PostgreSQL", "Docker"]),
      aiRecommendedQuestions: JSON.stringify([
        "We noticed PostgreSQL and Docker are required. How quickly have you adapted to relational databases from MongoDB in past projects?",
        "Can you share how you trace and debug asynchronous API request lifecycles?",
      ]),
      aiEvaluatedAt: new Date(),
      compositeScore: 74.0,
    },
  });

  // Candidate 3: Stage: OFFER_EXTENDED (Top candidate with human review)
  const app3 = await prisma.application.create({
    data: {
      jobId: jobFullstack.id,
      candidateName: "David Kim",
      candidateEmail: "david.kim@nzdevs.org",
      candidatePhone: "+64 27 500 1234",
      githubUrl: "https://github.com/davidkim-nz",
      experienceYears: 8.0,
      status: "OFFER_EXTENDED",
      stageChangedAt: new Date(),
      resumeText: `David Kim - Lead Full Stack Architect
8 years of engineering excellence across New Zealand tech startups.
Mastery in TypeScript, React, Next.js, Node.js, PostgreSQL, Docker, and Kubernetes.
Author of open-source TypeScript utility libraries.`,
      aiScore: 96,
      aiMatchLevel: "HIGH_MATCH",
      aiSummary:
        "David Kim exceeds all technical requirements with 8 years of proven full stack and architectural mastery.",
      aiMatchedSkills: JSON.stringify(["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "Next.js", "REST"]),
      aiMissingSkills: JSON.stringify([]),
      aiRecommendedQuestions: JSON.stringify([
        "Walk us through your strategy for system design and fault-tolerant architecture.",
      ]),
      aiEvaluatedAt: new Date(),
      compositeScore: 93.8,
    },
  });

  // Candidate 4: Stage: APPLIED (New submission)
  const app4 = await prisma.application.create({
    data: {
      jobId: jobFrontend.id,
      candidateName: "Chloe Martin",
      candidateEmail: "chloe.m@frontenddesign.nz",
      candidatePhone: "+64 21 334 8899",
      experienceYears: 3.5,
      status: "APPLIED",
      stageChangedAt: new Date(),
      resumeText: `Chloe Martin - UI/UX Frontend Developer
3.5 years developing web interfaces with React, JavaScript, TypeScript, Tailwind CSS, and Next.js.
Passionate about WCAG accessibility and micro-interactions.`,
      compositeScore: null,
    },
  });

  // Candidate 5: Stage: REJECTED (Low fit with documented reason)
  const app5 = await prisma.application.create({
    data: {
      jobId: jobBackend.id,
      candidateName: "Tom Wilson",
      candidateEmail: "tom.w@sample.com",
      experienceYears: 1.0,
      status: "REJECTED",
      rejectionReason: "Does not meet the minimum required seniority (Lead tier requires 7+ years; candidate has 1 year).",
      stageChangedAt: new Date(),
      resumeText: `Tom Wilson - Junior Developer. 1 year building basic scripts with Python.`,
      aiScore: 32,
      aiMatchLevel: "LOW_MATCH",
      aiSummary: "Tom Wilson does not match the seniority or distributed systems requirements for this Lead Architect role.",
      aiMatchedSkills: JSON.stringify(["Python"]),
      aiMissingSkills: JSON.stringify(["Golang", "Kubernetes", "AWS", "Docker", "Microservices"]),
      aiEvaluatedAt: new Date(),
      compositeScore: 32.0,
    },
  });

  console.log("Applications created successfully.");

  // 4. Create Reviews for Candidate 3 (David Kim) & Candidate 1 (Jordan Blake)
  await prisma.review.create({
    data: {
      applicationId: app3.id,
      reviewerId: reviewer.id,
      stage: "TECHNICAL",
      technicalScore: 10,
      communicationScore: 9,
      cultureScore: 9,
      overallScore: 9.4,
      recommendation: "STRONG_YES",
      comments:
        "Outstanding technical interview. David solved the concurrent database locking challenge with elegance and demonstrated deep mastery of TypeScript types and PostgreSQL isolation levels.",
    },
  });

  await prisma.review.create({
    data: {
      applicationId: app1.id,
      reviewerId: reviewer.id,
      stage: "TECHNICAL",
      technicalScore: 9,
      communicationScore: 8,
      cultureScore: 9,
      overallScore: 8.7,
      recommendation: "STRONG_YES",
      comments:
        "Strong live coding session. Jordan quickly built an optimized REST API endpoint, demonstrated good knowledge of Docker networking, and communicated clearly.",
    },
  });

  console.log("Reviews created successfully.");

  // 5. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        applicationId: app1.id,
        actorId: recruiter.id,
        action: "STATUS_CHANGED",
        fromStatus: "APPLIED",
        toStatus: "SCREENING",
        details: "Recruiter reviewed resume and verified 6.5 years experience.",
      },
      {
        applicationId: app1.id,
        actorId: recruiter.id,
        action: "AI_ANALYZED",
        fromStatus: "SCREENING",
        toStatus: "AI_ANALYZED",
        details: "Automated AI resume matching executed. Match Score: 92%.",
      },
      {
        applicationId: app1.id,
        actorId: recruiter.id,
        action: "STATUS_CHANGED",
        fromStatus: "AI_ANALYZED",
        toStatus: "INTERVIEW_SCHEDULED",
        details: "Scheduled Technical Round with Liam Chen.",
      },
      {
        applicationId: app3.id,
        actorId: admin.id,
        action: "STATUS_CHANGED",
        fromStatus: "INTERVIEW_SCHEDULED",
        toStatus: "OFFER_EXTENDED",
        details: "Hiring committee approved offer following outstanding technical review.",
      },
      {
        applicationId: app5.id,
        actorId: recruiter.id,
        action: "STATUS_CHANGED",
        fromStatus: "APPLIED",
        toStatus: "REJECTED",
        details: "Application rejected: Seniority requirement mismatch.",
      },
    ],
  });

  console.log("Audit logs created successfully.");
  console.log("Database seeding completed successfully for PostgreSQL!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
