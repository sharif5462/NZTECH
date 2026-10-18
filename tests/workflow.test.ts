import { describe, it, expect } from "vitest";
import { validateStatusTransition, getStageProgressPercentage } from "@/lib/workflow";

describe("Workflow State Machine & Business Logic", () => {
  it("allows valid forward transition from APPLIED to SCREENING", () => {
    const res = validateStatusTransition({
      currentStatus: "APPLIED",
      newStatus: "SCREENING",
      userRole: "RECRUITER",
    });
    expect(res.allowed).toBe(true);
  });

  it("disallows illegal transition directly from APPLIED to OFFER_EXTENDED", () => {
    const res = validateStatusTransition({
      currentStatus: "APPLIED",
      newStatus: "OFFER_EXTENDED",
      userRole: "RECRUITER",
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("Invalid workflow transition");
  });

  it("requires a clear rejection reason when rejecting a candidate", () => {
    const resWithoutReason = validateStatusTransition({
      currentStatus: "SCREENING",
      newStatus: "REJECTED",
      userRole: "RECRUITER",
      rejectionReason: "",
    });
    expect(resWithoutReason.allowed).toBe(false);
    expect(resWithoutReason.reason).toContain("rejection reason");

    const resWithReason = validateStatusTransition({
      currentStatus: "SCREENING",
      newStatus: "REJECTED",
      userRole: "RECRUITER",
      rejectionReason: "Does not meet minimum 5 years seniority threshold.",
    });
    expect(resWithReason.allowed).toBe(true);
  });

  it("prevents extending an offer if no interview reviews are recorded", () => {
    const resNoReviews = validateStatusTransition({
      currentStatus: "INTERVIEW_SCHEDULED",
      newStatus: "OFFER_EXTENDED",
      userRole: "RECRUITER",
      reviewCount: 0,
    });
    expect(resNoReviews.allowed).toBe(false);
    expect(resNoReviews.reason).toContain("without at least one recorded technical or culture review");

    const resWithReviews = validateStatusTransition({
      currentStatus: "INTERVIEW_SCHEDULED",
      newStatus: "OFFER_EXTENDED",
      userRole: "RECRUITER",
      reviewCount: 1,
    });
    expect(resWithReviews.allowed).toBe(true);
  });

  it("restricts reopening a rejected application only to ADMIN users", () => {
    const recruiterReopen = validateStatusTransition({
      currentStatus: "REJECTED",
      newStatus: "SCREENING",
      userRole: "RECRUITER",
    });
    expect(recruiterReopen.allowed).toBe(false);
    expect(recruiterReopen.reason).toContain("Only administrators are authorized");

    const adminReopen = validateStatusTransition({
      currentStatus: "REJECTED",
      newStatus: "SCREENING",
      userRole: "ADMIN",
    });
    expect(adminReopen.allowed).toBe(true);
  });

  it("correctly calculates stage progress percentages", () => {
    expect(getStageProgressPercentage("APPLIED")).toBe(15);
    expect(getStageProgressPercentage("AI_ANALYZED")).toBe(50);
    expect(getStageProgressPercentage("OFFER_EXTENDED")).toBe(90);
    expect(getStageProgressPercentage("HIRED")).toBe(100);
  });
});
