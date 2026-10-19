import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/dataStore";
import { getUserFromRequest, requireRoles } from "@/lib/auth";
import { jobSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const department = searchParams.get("department") || undefined;
    const type = searchParams.get("type") || undefined;

    const jobs = dbStore.getJobs({ search, department, type });
    return NextResponse.json({ jobs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || !requireRoles(user, ["ADMIN", "RECRUITER"])) {
      return NextResponse.json({ error: "Forbidden: Recruiter or Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const validated = jobSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.format() },
        { status: 400 }
      );
    }

    const newJob = dbStore.createJob({
      ...validated.data,
      status: "OPEN",
    });

    return NextResponse.json({ message: "Job created successfully", job: newJob }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
