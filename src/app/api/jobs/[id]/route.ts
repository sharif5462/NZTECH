import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jobSchema } from "@/lib/validations";
import { getUserFromRequest, requireRoles } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        applications: {
          select: {
            id: true,
            candidateName: true,
            candidateEmail: true,
            status: true,
            aiScore: true,
            compositeScore: true,
            createdAt: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job position not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!requireRoles(user, ["ADMIN", "RECRUITER"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validated = jobSchema.partial().safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: validated.data,
    });

    return NextResponse.json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!requireRoles(user, ["ADMIN"])) {
      return NextResponse.json(
        { error: "Only administrators can delete a job position" },
        { status: 403 }
      );
    }

    await prisma.job.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
