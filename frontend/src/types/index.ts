export type UserRole = "ADMIN" | "RECRUITER" | "REVIEWER" | "CANDIDATE" | "APPLICANT";

export type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "AI_ANALYZED"
  | "INTERVIEW_SCHEDULED"
  | "OFFER_EXTENDED"
  | "HIRED"
  | "REJECTED";

export type JobStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED";

export type RecommendationType = "STRONG_YES" | "YES" | "HOLD" | "NO";

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AIAnalysisResult {
  score: number;
  matchLevel: "HIGH_MATCH" | "MODERATE_MATCH" | "LOW_MATCH";
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedQuestions: string[];
  experienceEvaluation: string;
}

export interface CompositeScoreBreakdown {
  compositeScore: number;
  aiContribution: number;
  technicalContribution: number;
  softSkillsContribution: number;
  reviewCount: number;
}
