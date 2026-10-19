import { NextResponse } from "next/server";
import { dbStore } from "@/lib/dataStore";

export async function GET() {
  try {
    const analytics = dbStore.getAnalytics();
    return NextResponse.json(analytics);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
