import { NextResponse } from "next/server";
import { dbStore } from "@/lib/dataStore";

export async function GET() {
  try {
    const departments = dbStore.getDepartments();
    return NextResponse.json({ departments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
