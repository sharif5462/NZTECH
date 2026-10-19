import { describe, it, expect } from "vitest";
import { calculateCompositeScore, ReviewScoreInput } from "../src/services/scoreService";

describe("Candidate Composite Score Service (scoreService)", () => {
  it("should return the standalone AI score when no human reviews have been recorded", () => {
    const result = calculateCompositeScore(85, []);
    expect(result.compositeScore).toBe(85);
    expect(result.reviewCount).toBe(0);
  });

  it("should return 0 when both AI score and reviews are absent", () => {
    const result = calculateCompositeScore(null, []);
    expect(result.compositeScore).toBe(0);
    expect(result.reviewCount).toBe(0);
  });

  it("should calculate composite score weighted across AI (30%), Technical (45%), and Soft Skills (25%)", () => {
    const sampleReviews: ReviewScoreInput[] = [
      {
        technicalScore: 8,     // 8/10 = 80%
        communicationScore: 7, // 7/10
        cultureScore: 9,       // 9/10 -> Avg soft = 8/10 = 80%
      },
    ];

    // AI = 90
    // Tech = 80
    // Soft = 80
    // Expected = (90 * 0.3) + (80 * 0.45) + (80 * 0.25) = 27 + 36 + 20 = 83.0
    const result = calculateCompositeScore(90, sampleReviews);
    expect(result.compositeScore).toBe(83.0);
    expect(result.reviewCount).toBe(1);
  });

  it("should gracefully handle multiple reviews with averaging", () => {
    const reviews: ReviewScoreInput[] = [
      { technicalScore: 9, communicationScore: 8, cultureScore: 8 }, // tech 90%, soft 80%
      { technicalScore: 7, communicationScore: 6, cultureScore: 8 }, // tech 70%, soft 70%
    ];
    // Avg tech = 80%
    // Avg soft = 75%
    // AI = 80
    // Expected = (80 * 0.3) + (80 * 0.45) + (75 * 0.25) = 24 + 36 + 18.75 = 78.75 -> 78.8
    const result = calculateCompositeScore(80, reviews);
    expect(result.compositeScore).toBe(78.8);
    expect(result.reviewCount).toBe(2);
  });
});
