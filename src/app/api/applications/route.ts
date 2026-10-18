import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { applicationSchema } from "@/lib/validations";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "latest"; // "latest", "score_desc", "experience_desc"

    const where: any = {};

    if (jobId) {
      where.jobId = jobId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { candidateName: { contains: search, mode: "insensitive" } },
        { candidateEmail: { contains: search, mode: "insensitive" } },
        { resumeText: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "score_desc") {
      orderBy = { compositeScore: "desc" };
    } else if (sort === "ai_score_desc") {
      orderBy = { aiScore: "desc" };
    } else if (sort === "experience_desc") {
      orderBy = { experienceYears: "desc" };
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            experienceLevel: true,
            requiredSkills: true,
          },
        },
        reviews: {
          select: {
            id: true,
            overallScore: true,
            recommendation: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = applicationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Check if job exists and is ACTIVE
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job does not exist" }, { status: 404 });
    }

    if (job.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Applications are currently closed for this position (Status: ${job.status})` },
        { status: 400 }
      );
    }

    // Check for duplicate application
    const existing = await prisma.application.findFirst({
      where: {
        jobId: data.jobId,
        candidateEmail: data.candidateEmail.toLowerCase(),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted an application for this position." },
        { status: 409 }
      );
    }

    const user = await getUserFromRequest(req);

    const application = await prisma.application.create({
      data: {
        ...data,
        candidateEmail: data.candidateEmail.toLowerCase(),
        status: "APPLIED",
      },
    });

    // Create initial audit log
    await prisma.auditLog.create({
      data: {
        applicationId: application.id,
        actorId: user?.userId || null,
        action: "APPLICATION_SUBMITTED",
        toStatus: "APPLIED",
        details: `Application submitted by ${data.candidateName} for position '${job.title}'`,
      },
    });

    return NextResponse.json(
      { message: "Application submitted successfully", application },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
