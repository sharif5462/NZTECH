import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest, requireRoles } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            experienceLevel: true,
            requiredSkills: true,
            description: true,
            minSalary: true,
            maxSalary: true,
            currency: true,
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            reviewer: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!requireRoles(user, ["ADMIN"])) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can delete applications" },
        { status: 403 }
      );
    }

    await prisma.application.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
