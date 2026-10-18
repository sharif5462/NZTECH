import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jobSchema } from "@/lib/validations";
import { getUserFromRequest, requireRoles } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = department;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { requiredSkills: { contains: search, mode: "insensitive" } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!requireRoles(user, ["ADMIN", "RECRUITER"])) {
      return NextResponse.json(
        { error: "Forbidden: Only Recruiters and Admins can create jobs" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = jobSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        ...validated.data,
        createdById: user!.userId,
      },
    });

    return NextResponse.json({ message: "Job created successfully", job }, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
