import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/dataStore";
import { getUserFromRequest, requireRoles } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import { calculateCompositeScore } from "@/lib/scoreCalculator";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || !requireRoles(user, ["ADMIN", "REVIEWER"])) {
      return NextResponse.json({ error: "Forbidden: Reviewer or Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const validated = reviewSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { applicationId, technicalScore, communicationScore, cultureScore, recommendation, comments } =
      validated.data;

    const application = dbStore.getApplicationById(applicationId);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const review = dbStore.createReview({
      applicationId,
      reviewerId: user.userId,
      reviewerName: user.name,
      technicalScore,
      communicationScore,
      cultureScore,
      recommendation,
      comments: comments || "",
    });

    // Recompute composite score
    const allReviews = dbStore.getReviewsForApplication(applicationId);
    const composite = calculateCompositeScore(application.aiScore, allReviews as any);

    dbStore.updateApplication(applicationId, {
      compositeScore: composite.compositeScore,
    });

    dbStore.createAuditLog({
      applicationId,
      actorId: user.userId,
      actorName: user.name,
      fromStatus: application.status,
      toStatus: application.status,
      action: "SUBMIT_REVIEW",
    });

    return NextResponse.json(
      { message: "Review recorded successfully", review, composite },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
