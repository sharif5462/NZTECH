import { CompositeScoreBreakdown } from "@/types";

export interface ReviewScoreInput {
  technicalScore: number; // 1 - 10
  communicationScore: number; // 1 - 10
  cultureScore: number; // 1 - 10
}

/**
 * Calculates candidate composite evaluation score from AI analysis and human interviewer scores
 * 
 * Formula:
 * - AI Score weight: 30% (objective resume/skill qualification match)
 * - Technical Interview weight: 45% (live coding, system design, architectural skills)
 * - Communication & Culture fit weight: 25% (collaboration, team values, clarity)
 */
export function calculateCompositeScore(
  aiScore: number | null | undefined,
  reviews: ReviewScoreInput[]
): CompositeScoreBreakdown {
  const normalizedAi = aiScore ?? 0;
  const reviewCount = reviews.length;

  if (reviewCount === 0) {
    return {
      compositeScore: aiScore ? Number(aiScore.toFixed(1)) : 0,
      aiContribution: aiScore ? Number(aiScore.toFixed(1)) : 0,
      technicalContribution: 0,
      softSkillsContribution: 0,
      reviewCount: 0,
    };
  }

  // Calculate technical average (scaled from 1-10 to 10-100)
  const totalTech = reviews.reduce((sum, r) => sum + r.technicalScore, 0);
  const avgTechPercent = (totalTech / reviewCount) * 10;

  // Calculate soft skills average (communication + culture average, scaled 10-100)
  const totalSoft = reviews.reduce(
    (sum, r) => sum + (r.communicationScore + r.cultureScore) / 2,
    0
  );
  const avgSoftPercent = (totalSoft / reviewCount) * 10;

  // If AI score is missing, re-normalize weights between tech (65%) and soft (35%)
  if (aiScore === null || aiScore === undefined) {
    const techCont = avgTechPercent * 0.65;
    const softCont = avgSoftPercent * 0.35;
    const composite = techCont + softCont;

    return {
      compositeScore: Number(composite.toFixed(1)),
      aiContribution: 0,
      technicalContribution: Number(techCont.toFixed(1)),
      softSkillsContribution: Number(softCont.toFixed(1)),
      reviewCount,
    };
  }

  const aiCont = normalizedAi * 0.3;
  const techCont = avgTechPercent * 0.45;
  const softCont = avgSoftPercent * 0.25;
  const composite = aiCont + techCont + softCont;

  return {
    compositeScore: Number(composite.toFixed(1)),
    aiContribution: Number(aiCont.toFixed(1)),
    technicalContribution: Number(techCont.toFixed(1)),
    softSkillsContribution: Number(softCont.toFixed(1)),
    reviewCount,
  };
}

export function getScoreBadge(score: number): {
  label: string;
  colorClass: string;
} {
  if (score >= 85) {
    return { label: "Top Candidate (Tier 1)", colorClass: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  } else if (score >= 70) {
    return { label: "Qualified Candidate", colorClass: "bg-blue-100 text-blue-800 border-blue-300" };
  } else if (score >= 50) {
    return { label: "Borderline / Needs Review", colorClass: "bg-amber-100 text-amber-800 border-amber-300" };
  } else {
    return { label: "Below Threshold", colorClass: "bg-rose-100 text-rose-800 border-rose-300" };
  }
}
