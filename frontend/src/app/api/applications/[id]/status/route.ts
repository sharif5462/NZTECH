import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/dataStore";
import { getUserFromRequest, requireRoles } from "@/lib/auth";
import { validateStatusTransition } from "@/lib/workflow";
import { statusChangeSchema } from "@/lib/validations";
import { ApplicationStatus } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || !requireRoles(user, ["ADMIN", "RECRUITER"])) {
      return NextResponse.json({ error: "Forbidden: Recruiter or Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const validated = statusChangeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { status: targetStatus, rejectionReason } = validated.data;
    const application = dbStore.getApplicationById(params.id);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const validation = validateStatusTransition({
      currentStatus: application.status,
      newStatus: targetStatus as ApplicationStatus,
      userRole: user.role,
      reviewCount: application.reviews?.length || 0,
      rejectionReason: rejectionReason,
      aiScore: application.aiScore,
    });

    if (!validation.allowed) {
      return NextResponse.json({ error: validation.reason }, { status: 422 });
    }

    const updated = dbStore.updateApplication(params.id, {
      status: targetStatus as ApplicationStatus,
      rejectionReason: targetStatus === "REJECTED" ? rejectionReason : undefined,
    });

    dbStore.createAuditLog({
      applicationId: params.id,
      actorId: user.userId,
      actorName: user.name,
      fromStatus: application.status,
      toStatus: targetStatus,
      action: "ADVANCE_STAGE",
    });

    return NextResponse.json({
      message: `Status updated to ${targetStatus}`,
      application: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
