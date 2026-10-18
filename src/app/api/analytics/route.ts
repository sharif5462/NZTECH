import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      totalApplications,
      activeJobs,
      statusCountsRaw,
      reviewedApplications,
      recentAuditLogs,
      topCandidates,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.job.count({ where: { status: "ACTIVE" } }),
      prisma.application.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.application.findMany({
        where: { aiScore: { not: null } },
        select: { aiScore: true, compositeScore: true },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { name: true, role: true } },
          application: { select: { candidateName: true } },
        },
      }),
      prisma.application.findMany({
        take: 5,
        orderBy: { compositeScore: "desc" },
        where: { compositeScore: { not: null } },
        include: {
          job: { select: { title: true } },
        },
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

    const avgAiScore =
      reviewedApplications.length > 0
        ? Number(
            (
              reviewedApplications.reduce((acc, curr) => acc + (curr.aiScore || 0), 0) /
              reviewedApplications.length
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      metrics: {
        totalApplications,
        activeJobs,
        avgAiScore,
        pipelineBreakdown,
      },
      recentActivity: recentAuditLogs,
      topCandidates,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
