import { describe, it, expect } from "vitest";
import { calculateCompositeScore, getScoreBadge } from "@/lib/scoreCalculator";

describe("Candidate Composite Score Calculator", () => {
  it("computes weighted score accurately when AI and human reviews are present", () => {
    const aiScore = 90; // 90 * 0.30 = 27.0
    const reviews = [
      {
        technicalScore: 8, // 8 * 10 = 80
        communicationScore: 8, // (8+8)/2 * 10 = 80
        cultureScore: 8,
      },
    ];

    // Tech: 80 * 0.45 = 36.0
    // Soft: 80 * 0.25 = 20.0
    // Total = 27.0 + 36.0 + 20.0 = 83.0
    const result = calculateCompositeScore(aiScore, reviews);

    expect(result.compositeScore).toBe(83.0);
    expect(result.aiContribution).toBe(27.0);
    expect(result.technicalContribution).toBe(36.0);
    expect(result.softSkillsContribution).toBe(20.0);
    expect(result.reviewCount).toBe(1);
  });

  it("handles empty reviews by falling back to normalized AI score", () => {
    const result = calculateCompositeScore(85, []);
    expect(result.compositeScore).toBe(85);
    expect(result.reviewCount).toBe(0);
  });

  it("assigns appropriate rating tiers based on numerical scores", () => {
    expect(getScoreBadge(92).label).toContain("Top Candidate");
    expect(getScoreBadge(75).label).toContain("Qualified Candidate");
    expect(getScoreBadge(55).label).toContain("Borderline");
    expect(getScoreBadge(40).label).toContain("Below Threshold");
  });
});
