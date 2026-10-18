import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { reviewSchema } from "@/lib/validations";
import { getUserFromRequest, requireRoles } from "@/lib/auth";
import { calculateCompositeScore } from "@/lib/scoreCalculator";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!requireRoles(user, ["ADMIN", "RECRUITER", "REVIEWER"])) {
      return NextResponse.json(
        { error: "Forbidden: Only authorized interviewers can submit candidate reviews" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = reviewSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Check application exists
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: { reviews: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Weighted average for this individual review:
    // Technical 50%, Communication 30%, Culture 20%
    const overallScore = Number(
      (data.technicalScore * 0.5 + data.communicationScore * 0.3 + data.cultureScore * 0.2).toFixed(1)
    );

    // Create review and update application composite score in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          applicationId: data.applicationId,
          reviewerId: user!.userId,
          stage: data.stage,
          technicalScore: data.technicalScore,
          communicationScore: data.communicationScore,
          cultureScore: data.cultureScore,
          overallScore,
          recommendation: data.recommendation,
          comments: data.comments,
        },
      });

      // Recalculate composite score including all existing reviews + new review
      const allReviews = [
        ...application.reviews.map((r) => ({
          technicalScore: r.technicalScore,
          communicationScore: r.communicationScore,
          cultureScore: r.cultureScore,
        })),
        {
          technicalScore: data.technicalScore,
          communicationScore: data.communicationScore,
          cultureScore: data.cultureScore,
        },
      ];

      const scoreBreakdown = calculateCompositeScore(application.aiScore, allReviews);

      await tx.application.update({
        where: { id: data.applicationId },
        data: {
          compositeScore: scoreBreakdown.compositeScore,
        },
      });

      await tx.auditLog.create({
        data: {
          applicationId: data.applicationId,
          actorId: user!.userId,
          action: "REVIEW_ADDED",
          details: `Interview feedback submitted by ${user!.name}. Stage: ${data.stage}, Overall Score: ${overallScore}/10, Recommendation: ${data.recommendation}. Composite score updated to ${scoreBreakdown.compositeScore}%.`,
        },
      });

      return { review, compositeScore: scoreBreakdown.compositeScore };
    });

    return NextResponse.json(
      { message: "Interview review recorded successfully", ...result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
