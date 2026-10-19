export interface ReviewScoreInput {
  technicalScore: number;
  communicationScore: number;
  cultureScore: number;
}

export function calculateCompositeScore(
  aiScore: number | null | undefined,
  reviews: ReviewScoreInput[]
): { compositeScore: number; reviewCount: number } {
  const normalizedAi = aiScore ?? 0;
  const reviewCount = reviews.length;

  if (reviewCount === 0) {
    return {
      compositeScore: aiScore ? Number(aiScore.toFixed(1)) : 0,
      reviewCount: 0,
    };
  }

  const totalTech = reviews.reduce((sum, r) => sum + r.technicalScore, 0);
  const avgTechPercent = (totalTech / reviewCount) * 10;

  const totalSoft = reviews.reduce(
    (sum, r) => sum + (r.communicationScore + r.cultureScore) / 2,
    0
  );
  const avgSoftPercent = (totalSoft / reviewCount) * 10;

  if (aiScore === null || aiScore === undefined) {
    const composite = avgTechPercent * 0.65 + avgSoftPercent * 0.35;
    return { compositeScore: Number(composite.toFixed(1)), reviewCount };
  }

  const composite = normalizedAi * 0.3 + avgTechPercent * 0.45 + avgSoftPercent * 0.25;
  return { compositeScore: Number(composite.toFixed(1)), reviewCount };
}
