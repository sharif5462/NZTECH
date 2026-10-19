import { Request, Response } from "express";
import prisma from "../config/db";

export async function getAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const [totalApplications, activeJobs, statusCountsRaw, recentLogs, topCandidates] =
      await Promise.all([
        prisma.application.count(),
        prisma.job.count({ where: { status: "ACTIVE" } }),
        prisma.application.groupBy({
          by: ["status"],
          _count: { id: true },
        }),
        prisma.auditLog.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { name: true, role: true } } },
        }),
        prisma.application.findMany({
          take: 5,
          where: { compositeScore: { not: null } },
          orderBy: { compositeScore: "desc" },
          include: { job: { select: { title: true } } },
        }),
      ]);

    const pipelineBreakdown: Record<string, number> = {
      APPLIED: 0,
      SCREENING: 0,
      AI_ANALYZED: 0,
      INTERVIEW_SCHEDULED: 0,
      OFFER_EXTENDED: 0,
      HIRED: 0,
      REJECTED: 0,
    };

    statusCountsRaw.forEach((sc) => {
      pipelineBreakdown[sc.status] = sc._count.id;
    });

    res.json({
      metrics: {
        totalApplications,
        activeJobs,
        pipelineBreakdown,
      },
      recentActivity: recentLogs,
      topCandidates,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
