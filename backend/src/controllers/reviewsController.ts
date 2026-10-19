import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../types";
import { calculateCompositeScore } from "../services/scoreService";

export async function createReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const {
      applicationId,
      stage = "TECHNICAL",
      technicalScore,
      communicationScore,
      cultureScore,
      recommendation,
      comments,
    } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { reviews: true },
    });

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const overallScore = Number(
      (technicalScore * 0.5 + communicationScore * 0.3 + cultureScore * 0.2).toFixed(1)
    );

    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          applicationId,
          reviewerId: user.userId,
          stage,
          technicalScore: Number(technicalScore),
          communicationScore: Number(communicationScore),
          cultureScore: Number(cultureScore),
          overallScore,
          recommendation,
          comments,
        },
      });

      const allReviews = [
        ...application.reviews.map((r) => ({
          technicalScore: r.technicalScore,
          communicationScore: r.communicationScore,
          cultureScore: r.cultureScore,
        })),
        {
          technicalScore: Number(technicalScore),
          communicationScore: Number(communicationScore),
          cultureScore: Number(cultureScore),
        },
      ];

      const score = calculateCompositeScore(application.aiScore, allReviews);

      await tx.application.update({
        where: { id: applicationId },
        data: { compositeScore: score.compositeScore },
      });

      await tx.auditLog.create({
        data: {
          applicationId,
          actorId: user.userId,
          action: "REVIEW_ADDED",
          details: `Review recorded by ${user.name} (${recommendation}, Score: ${overallScore}/10). Composite: ${score.compositeScore}%`,
        },
      });

      return { review, compositeScore: score.compositeScore };
    });

    res.status(201).json({ message: "Review recorded successfully", ...result });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
