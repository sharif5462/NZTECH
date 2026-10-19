import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/dataStore";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { email, password, name, role } = validated.data;
    const existing = dbStore.findUserByEmail(email);

    if (existing) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = dbStore.createUser({
      name,
      email,
      passwordHash,
      role: (role as any) || "APPLICANT",
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
      { status: 201 }
    );

    response.cookies.set({
      name: "hirepulse_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
