import { Request, Response } from "express";
import prisma from "../config/db";
import { AuthRequest, ApplicationStatus } from "../types";
import { validateStatusTransition } from "../services/workflowService";
import { analyzeCandidateLocally } from "../services/aiService";
import { calculateCompositeScore } from "../services/scoreService";

export async function getApplications(req: Request, res: Response): Promise<void> {
  try {
    const { jobId, status, search, sort = "latest" } = req.query;

    const where: any = {};
    if (jobId) where.jobId = String(jobId);
    if (status) where.status = String(status);
    if (search) {
      where.OR = [
        { candidateName: { contains: String(search), mode: "insensitive" } },
        { candidateEmail: { contains: String(search), mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "score_desc") orderBy = { compositeScore: "desc" };
    else if (sort === "ai_score_desc") orderBy = { aiScore: "desc" };

    const applications = await prisma.application.findMany({
      where,
      orderBy,
      include: {
        job: { select: { id: true, title: true, department: true } },
        reviews: { select: { overallScore: true, recommendation: true } },
      },
    });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getApplicationById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        reviews: {
          include: { reviewer: { select: { id: true, name: true, role: true } } },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json({ application });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function submitApplication(req: Request, res: Response): Promise<void> {
  try {
    const {
      jobId,
      candidateName,
      candidateEmail,
      candidatePhone,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      experienceYears = 0,
      resumeText,
    } = req.body;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "ACTIVE") {
      res.status(400).json({ error: "Job does not exist or is not active" });
      return;
    }

    const existing = await prisma.application.findFirst({
      where: { jobId, candidateEmail: candidateEmail.toLowerCase() },
    });

    if (existing) {
      res.status(409).json({ error: "Already applied for this position" });
      return;
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateName,
        candidateEmail: candidateEmail.toLowerCase(),
        candidatePhone,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
        experienceYears: Number(experienceYears),
        resumeText,
        status: "APPLIED",
      },
    });

    await prisma.auditLog.create({
      data: {
        applicationId: application.id,
        action: "APPLICATION_SUBMITTED",
        toStatus: "APPLIED",
        details: `Application submitted by ${candidateName}`,
      },
    });

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status: newStatus, rejectionReason, note } = req.body;
    const user = req.user!;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { reviews: true },
    });

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const validation = validateStatusTransition({
      currentStatus: application.status as ApplicationStatus,
      newStatus: newStatus as ApplicationStatus,
      userRole: user.role,
      reviewCount: application.reviews.length,
      rejectionReason,
    });

    if (!validation.allowed) {
      res.status(422).json({ error: validation.reason });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: {
          status: newStatus,
          stageChangedAt: new Date(),
          rejectionReason: newStatus === "REJECTED" ? rejectionReason : null,
        },
      });

      await tx.auditLog.create({
        data: {
          applicationId: id,
          actorId: user.userId,
          action: "STATUS_CHANGED",
          fromStatus: application.status,
          toStatus: newStatus,
          details: `Status transitioned from ${application.status} to ${newStatus} by ${user.name}${
            note ? `. ${note}` : ""
          }`,
        },
      });

      return app;
    });

    res.json({ message: `Status updated to ${newStatus}`, application: updated });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function runAiEvaluation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true, reviews: true },
    });

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const aiResult = analyzeCandidateLocally({
      jobTitle: application.job.title,
      department: application.job.department,
      experienceLevel: application.job.experienceLevel,
      requiredSkills: application.job.requiredSkills,
      jobDescription: application.job.description,
      candidateName: application.candidateName,
      experienceYears: application.experienceYears,
      resumeText: application.resumeText,
    });

    const composite = calculateCompositeScore(
      aiResult.score,
      application.reviews.map((r: { technicalScore: number; communicationScore: number; cultureScore: number }) => ({
        technicalScore: r.technicalScore,
        communicationScore: r.communicationScore,
        cultureScore: r.cultureScore,
      }))
    );

    const nextStatus =
      application.status === "APPLIED" || application.status === "SCREENING"
        ? "AI_ANALYZED"
        : application.status;

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: {
          aiScore: aiResult.score,
          aiMatchLevel: aiResult.matchLevel,
          aiSummary: aiResult.summary,
          aiMatchedSkills: JSON.stringify(aiResult.matchedSkills),
          aiMissingSkills: JSON.stringify(aiResult.missingSkills),
          aiRecommendedQuestions: JSON.stringify(aiResult.recommendedQuestions),
          aiEvaluatedAt: new Date(),
          compositeScore: composite.compositeScore,
          status: nextStatus,
        },
      });

      await tx.auditLog.create({
        data: {
          applicationId: id,
          actorId: user.userId,
          action: "AI_ANALYZED",
          fromStatus: application.status,
          toStatus: nextStatus,
          details: `AI Matching completed. Score: ${aiResult.score}% (${aiResult.matchLevel})`,
        },
      });

      return app;
    });

    res.json({
      message: "AI analysis completed",
      aiResult,
      compositeScore: composite.compositeScore,
      application: updated,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
