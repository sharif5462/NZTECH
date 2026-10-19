import { Request } from "express";

export type UserRole = "ADMIN" | "RECRUITER" | "REVIEWER" | "CANDIDATE";

export type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "AI_ANALYZED"
  | "INTERVIEW_SCHEDULED"
  | "OFFER_EXTENDED"
  | "HIRED"
  | "REJECTED";

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}
