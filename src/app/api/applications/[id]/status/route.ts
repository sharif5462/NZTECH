import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { statusChangeSchema } from "@/lib/validations";
import { getUserFromRequest, requireRoles } from "@/lib/auth";
import { validateStatusTransition } from "@/lib/workflow";
import { ApplicationStatus } from "@/types";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!requireRoles(user, ["ADMIN", "RECRUITER"])) {
      return NextResponse.json(
        { error: "Forbidden: Only Recruiters and Admins can update candidate status" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = statusChangeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status: newStatus, rejectionReason, note } = validated.data;

    // Fetch current application with reviews
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        reviews: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Business Logic State Machine Validation
    const validation = validateStatusTransition({
      currentStatus: application.status as ApplicationStatus,
      newStatus: newStatus as ApplicationStatus,
      userRole: user!.role,
      reviewCount: application.reviews.length,
      rejectionReason,
      aiScore: application.aiScore,
    });

    if (!validation.allowed) {
      return NextResponse.json({ error: validation.reason }, { status: 422 });
    }

    // Update status in a transactional flow with audit log
    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          stageChangedAt: new Date(),
          rejectionReason: newStatus === "REJECTED" ? rejectionReason : null,
        },
      });

      await tx.auditLog.create({
        data: {
          applicationId: params.id,
          actorId: user!.userId,
          action: "STATUS_CHANGED",
          fromStatus: application.status,
          toStatus: newStatus,
          details:
            newStatus === "REJECTED"
              ? `Status changed to REJECTED by ${user!.name}. Reason: ${rejectionReason}`
              : `Status transitioned from ${application.status} to ${newStatus} by ${user!.name}${
                  note ? `. Note: ${note}` : ""
                }`,
        },
      });

      return app;
    });

    return NextResponse.json({
      message: `Status successfully updated to ${newStatus}`,
      application: updated,
    });
  } catch (error) {
    console.error("Status transition error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
