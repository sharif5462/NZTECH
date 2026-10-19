import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/dataStore";
import { getUserFromRequest, requireRoles } from "@/lib/auth";
import { analyzeCandidateWithAI } from "@/lib/aiMatcher";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || !requireRoles(user, ["ADMIN", "RECRUITER"])) {
      return NextResponse.json({ error: "Forbidden: Recruiter or Admin access required" }, { status: 403 });
    }

    const application = dbStore.getApplicationById(params.id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const job = dbStore.getJobById(application.jobId);
    if (!job) {
      return NextResponse.json({ error: "Associated job not found" }, { status: 404 });
    }

    const aiResult = await analyzeCandidateWithAI({
      jobTitle: job.title,
      department: job.department,
      requiredSkills: job.requiredSkills,
      experienceLevel: job.experienceLevel,
      jobDescription: job.description,
      candidateName: application.fullName,
      experienceYears: application.experienceYears,
      resumeText: application.resumeText,
    });

    const updated = dbStore.updateApplication(params.id, {
      aiScore: aiResult.score,
      aiSummary: aiResult.summary,
      matchedSkills: aiResult.matchedSkills,
      missingSkills: aiResult.missingSkills,
      suggestedQuestions: aiResult.recommendedQuestions,
      status: application.status === "SCREENING" ? "AI_ANALYZED" : application.status,
    });

    dbStore.createAuditLog({
      applicationId: params.id,
      actorId: user.userId,
      actorName: user.name,
      fromStatus: application.status,
      toStatus: updated?.status || application.status,
      action: "RUN_AI_MATCH",
    });

    return NextResponse.json({
      message: "AI analysis completed",
      evaluation: aiResult,
      application: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
