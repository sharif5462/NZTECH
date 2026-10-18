import { ApplicationStatus, UserRole } from "@/types";

export interface TransitionValidationResult {
  allowed: boolean;
  reason?: string;
}

export interface TransitionContext {
  currentStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  userRole: UserRole;
  reviewCount?: number;
  rejectionReason?: string;
  aiScore?: number | null;
}

// Directed Graph of allowed status transitions
const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ["SCREENING", "AI_ANALYZED", "REJECTED"],
  SCREENING: ["AI_ANALYZED", "INTERVIEW_SCHEDULED", "REJECTED"],
  AI_ANALYZED: ["SCREENING", "INTERVIEW_SCHEDULED", "REJECTED"],
  INTERVIEW_SCHEDULED: ["OFFER_EXTENDED", "REJECTED"],
  OFFER_EXTENDED: ["HIRED", "REJECTED"],
  HIRED: [], // Terminal State
  REJECTED: ["SCREENING"], // Only ADMIN can reopen a rejected application
};

/**
 * Validates a business workflow state transition
 */
export function validateStatusTransition(ctx: TransitionContext): TransitionValidationResult {
  const { currentStatus, newStatus, userRole, reviewCount = 0, rejectionReason } = ctx;

  if (currentStatus === newStatus) {
    return { allowed: false, reason: `Application is already in status '${currentStatus}'` };
  }

  // Check if transition is in the graph
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    return {
      allowed: false,
      reason: `Invalid workflow transition: Cannot move directly from '${currentStatus}' to '${newStatus}'`,
    };
  }

  // Business Rule 1: Reopening a rejected application requires ADMIN role
  if (currentStatus === "REJECTED" && userRole !== "ADMIN") {
    return {
      allowed: false,
      reason: "Only administrators are authorized to reopen a rejected candidate application",
    };
  }

  // Business Rule 2: Rejection must have a documented reason for compliance
  if (newStatus === "REJECTED" && (!rejectionReason || rejectionReason.trim().length < 5)) {
    return {
      allowed: false,
      reason: "A clear rejection reason (at least 5 characters) is required for compliance logging",
    };
  }

  // Business Rule 3: Extending an offer requires at least one completed interview review
  if (newStatus === "OFFER_EXTENDED" && reviewCount < 1) {
    return {
      allowed: false,
      reason: "Cannot extend an employment offer without at least one recorded technical or culture review",
    };
  }

  return { allowed: true };
}

/**
 * Returns human-friendly progress percentage based on candidate lifecycle stage
 */
export function getStageProgressPercentage(status: ApplicationStatus): number {
  switch (status) {
    case "APPLIED":
      return 15;
    case "SCREENING":
      return 35;
    case "AI_ANALYZED":
      return 50;
    case "INTERVIEW_SCHEDULED":
      return 70;
    case "OFFER_EXTENDED":
      return 90;
    case "HIRED":
      return 100;
    case "REJECTED":
      return 100;
    default:
      return 0;
  }
}
