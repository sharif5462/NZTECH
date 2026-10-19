import { ApplicationStatus, UserRole } from "../types";

export interface TransitionContext {
  currentStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  userRole: UserRole;
  reviewCount?: number;
  rejectionReason?: string;
}

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ["SCREENING", "AI_ANALYZED", "REJECTED"],
  SCREENING: ["AI_ANALYZED", "INTERVIEW_SCHEDULED", "REJECTED"],
  AI_ANALYZED: ["SCREENING", "INTERVIEW_SCHEDULED", "REJECTED"],
  INTERVIEW_SCHEDULED: ["OFFER_EXTENDED", "REJECTED"],
  OFFER_EXTENDED: ["HIRED", "REJECTED"],
  HIRED: [],
  REJECTED: ["SCREENING"],
};

export function validateStatusTransition(ctx: TransitionContext): { allowed: boolean; reason?: string } {
  const { currentStatus, newStatus, userRole, reviewCount = 0, rejectionReason } = ctx;

  if (currentStatus === newStatus) {
    return { allowed: false, reason: `Application is already in status '${currentStatus}'` };
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    return {
      allowed: false,
      reason: `Invalid workflow transition: Cannot move directly from '${currentStatus}' to '${newStatus}'`,
    };
  }

  if (currentStatus === "REJECTED" && userRole !== "ADMIN") {
    return {
      allowed: false,
      reason: "Only administrators are authorized to reopen a rejected candidate application",
    };
  }

  if (newStatus === "REJECTED" && (!rejectionReason || rejectionReason.trim().length < 5)) {
    return {
      allowed: false,
      reason: "A clear rejection reason (at least 5 characters) is required for compliance logging",
    };
  }

  if (newStatus === "OFFER_EXTENDED" && reviewCount < 1) {
    return {
      allowed: false,
      reason: "Cannot extend an employment offer without at least one recorded technical or culture review",
    };
  }

  return { allowed: true };
}
