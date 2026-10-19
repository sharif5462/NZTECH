import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/dataStore";
import { getUserFromRequest } from "@/lib/auth";
import { applicationSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const searchParams = req.nextUrl.searchParams;
    const jobId = searchParams.get("jobId") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    let applications = dbStore.getApplications({ jobId, status, search });

    // Filter for candidate: only see own applications
    if (user && (user.role === "APPLICANT" || user.role === "CANDIDATE")) {
      applications = applications.filter((a) => a.email.toLowerCase() === user.email.toLowerCase());
    }

    return NextResponse.json({ applications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = applicationSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { jobId, candidateName, candidateEmail, candidatePhone, experienceYears, resumeText } =
      validated.data;
    const job = dbStore.getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job does not exist" }, { status: 404 });
    }

    const newApp = dbStore.createApplication({
      jobId,
      fullName: candidateName,
      email: candidateEmail,
      phone: candidatePhone,
      experienceYears,
      resumeText,
      status: "APPLIED",
    });

    return NextResponse.json(
      { message: "Application submitted successfully", application: newApp },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
