import { NextResponse } from "next/server";
import { dbStore } from "@/lib/dataStore";

export async function GET() {
  try {
    const users = dbStore.getAllUsers();
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
