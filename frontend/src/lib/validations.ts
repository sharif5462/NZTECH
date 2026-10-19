import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "RECRUITER", "REVIEWER", "CANDIDATE"]).optional().default("RECRUITER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  department: z.string().min(2, "Department is required"),
  location: z.string().min(2, "Location is required"),
  type: z.enum(["Full-time", "Part-time", "Contract", "Remote", "Hybrid"]).default("Full-time"),
  experienceLevel: z.enum(["Junior", "Mid-Level", "Senior", "Lead"]).default("Mid-Level"),
  minSalary: z.number().int().positive().optional(),
  maxSalary: z.number().int().positive().optional(),
  currency: z.string().default("NZD"),
  description: z.string().min(20, "Job description must be at least 20 characters"),
  requiredSkills: z.string().min(2, "At least one skill is required (comma-separated)"),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED"]).optional().default("ACTIVE"),
});

export const applicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  candidateName: z.string().min(2, "Candidate name must be at least 2 characters"),
  candidateEmail: z.string().email("Invalid email address"),
  candidatePhone: z.string().optional(),
  portfolioUrl: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  experienceYears: z.number().min(0).max(50).default(0),
  resumeText: z.string().min(30, "Resume content must be at least 30 characters"),
});

export const statusChangeSchema = z.object({
  status: z.enum([
    "APPLIED",
    "SCREENING",
    "AI_ANALYZED",
    "INTERVIEW_SCHEDULED",
    "OFFER_EXTENDED",
    "HIRED",
    "REJECTED",
  ]),
  rejectionReason: z.string().optional(),
  note: z.string().optional(),
});

export const reviewSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  stage: z.enum(["SCREENING", "TECHNICAL", "CULTURE_FIT"]).default("TECHNICAL"),
  technicalScore: z.number().int().min(1).max(10),
  communicationScore: z.number().int().min(1).max(10),
  cultureScore: z.number().int().min(1).max(10),
  recommendation: z.enum(["STRONG_YES", "YES", "HOLD", "NO"]),
  comments: z.string().min(10, "Review feedback must be at least 10 characters"),
});
