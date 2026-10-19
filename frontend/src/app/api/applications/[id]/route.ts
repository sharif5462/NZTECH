import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/dataStore";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    const application = dbStore.getApplicationById(params.id);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (user && (user.role === "APPLICANT" || user.role === "CANDIDATE") && application.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden: You may only view your own application" }, { status: 403 });
    }

    return NextResponse.json({ application });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
