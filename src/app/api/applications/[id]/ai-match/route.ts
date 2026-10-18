import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest, requireRoles } from "@/lib/auth";
import { analyzeCandidateWithAI } from "@/lib/aiMatcher";
import { calculateCompositeScore } from "@/lib/scoreCalculator";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!requireRoles(user, ["ADMIN", "RECRUITER"])) {
      return NextResponse.json(
        { error: "Forbidden: Only Recruiters and Admins can trigger AI evaluation" },
        { status: 403 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        job: true,
        reviews: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Run AI / ML analysis
    const aiResult = await analyzeCandidateWithAI({
      jobTitle: application.job.title,
      department: application.job.department,
      experienceLevel: application.job.experienceLevel,
      requiredSkills: application.job.requiredSkills,
      jobDescription: application.job.description,
      candidateName: application.candidateName,
      experienceYears: application.experienceYears,
      resumeText: application.resumeText,
    });

    // Recalculate composite score using the new AI score and existing human reviews
    const compositeBreakdown = calculateCompositeScore(
      aiResult.score,
      application.reviews.map((r) => ({
        technicalScore: r.technicalScore,
        communicationScore: r.communicationScore,
        cultureScore: r.cultureScore,
      }))
    );

    // Determine if status should automatically advance to AI_ANALYZED
    const shouldAdvanceStatus =
      application.status === "APPLIED" || application.status === "SCREENING";
    const nextStatus = shouldAdvanceStatus ? "AI_ANALYZED" : application.status;

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: params.id },
        data: {
          aiScore: aiResult.score,
          aiMatchLevel: aiResult.matchLevel,
          aiSummary: aiResult.summary,
          aiMatchedSkills: JSON.stringify(aiResult.matchedSkills),
          aiMissingSkills: JSON.stringify(aiResult.missingSkills),
          aiRecommendedQuestions: JSON.stringify(aiResult.recommendedQuestions),
          aiEvaluatedAt: new Date(),
          compositeScore: compositeBreakdown.compositeScore,
          status: nextStatus,
          stageChangedAt: shouldAdvanceStatus ? new Date() : application.stageChangedAt,
        },
      });

      await tx.auditLog.create({
        data: {
          applicationId: params.id,
          actorId: user!.userId,
          action: "AI_ANALYZED",
          fromStatus: application.status,
          toStatus: nextStatus,
          details: `AI Matching Engine completed. Match Score: ${aiResult.score}% (${aiResult.matchLevel}). Matched ${aiResult.matchedSkills.length} skills, identified ${aiResult.missingSkills.length} skill gaps.`,
        },
      });

      return app;
    });

    return NextResponse.json({
      message: "AI Candidate Analysis completed successfully",
      aiResult,
      compositeScore: compositeBreakdown.compositeScore,
      application: updated,
    });
  } catch (error) {
    console.error("AI matching route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
