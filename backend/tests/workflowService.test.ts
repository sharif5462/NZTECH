import { describe, it, expect } from "vitest";
import { validateStatusTransition } from "../src/services/workflowService";

describe("Workflow State Machine (workflowService)", () => {
  it("should permit valid initial progression from APPLIED to SCREENING", () => {
    const result = validateStatusTransition({
      currentStatus: "APPLIED",
      newStatus: "SCREENING",
      userRole: "RECRUITER",
    });
    expect(result.allowed).toBe(true);
  });

  it("should permit advancing from SCREENING to INTERVIEW_SCHEDULED", () => {
    const result = validateStatusTransition({
      currentStatus: "SCREENING",
      newStatus: "INTERVIEW_SCHEDULED",
      userRole: "RECRUITER",
    });
    expect(result.allowed).toBe(true);
  });

  it("should block invalid direct transition from APPLIED to OFFER_EXTENDED", () => {
    const result = validateStatusTransition({
      currentStatus: "APPLIED",
      newStatus: "OFFER_EXTENDED",
      userRole: "RECRUITER",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Invalid workflow transition");
  });

  it("should enforce at least one interview review before OFFER_EXTENDED", () => {
    const noReviews = validateStatusTransition({
      currentStatus: "INTERVIEW_SCHEDULED",
      newStatus: "OFFER_EXTENDED",
      userRole: "RECRUITER",
      reviewCount: 0,
    });
    expect(noReviews.allowed).toBe(false);
    expect(noReviews.reason).toContain("without at least one recorded technical or culture review");

    const withReviews = validateStatusTransition({
      currentStatus: "INTERVIEW_SCHEDULED",
      newStatus: "OFFER_EXTENDED",
      userRole: "RECRUITER",
      reviewCount: 2,
    });
    expect(withReviews.allowed).toBe(true);
  });

  it("should require a rejection reason for compliance logging when transitioning to REJECTED", () => {
    const missingReason = validateStatusTransition({
      currentStatus: "SCREENING",
      newStatus: "REJECTED",
      userRole: "RECRUITER",
      rejectionReason: "",
    });
    expect(missingReason.allowed).toBe(false);
    expect(missingReason.reason).toContain("A clear rejection reason");

    const validReason = validateStatusTransition({
      currentStatus: "SCREENING",
      newStatus: "REJECTED",
      userRole: "RECRUITER",
      rejectionReason: "Insufficient depth in distributed systems architecture",
    });
    expect(validReason.allowed).toBe(true);
  });

  it("should allow only ADMIN users to reopen a REJECTED candidate", () => {
    const recruiterAttempt = validateStatusTransition({
      currentStatus: "REJECTED",
      newStatus: "SCREENING",
      userRole: "RECRUITER",
    });
    expect(recruiterAttempt.allowed).toBe(false);
    expect(recruiterAttempt.reason).toContain("Only administrators are authorized");

    const adminAttempt = validateStatusTransition({
      currentStatus: "REJECTED",
      newStatus: "SCREENING",
      userRole: "ADMIN",
    });
    expect(adminAttempt.allowed).toBe(true);
  });
});
