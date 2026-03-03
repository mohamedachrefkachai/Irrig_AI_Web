import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "email, password and name are required" }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = String(email).toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // Mobile app signup is only for workers
    const user = await User.create({
      email: normalizedEmail,
      password_hash,
      role: "WORKER",
      fullName: name,
      status: "ACTIVE",
    });

    const token = `mobile_${user._id}_${Date.now()}`;

    return NextResponse.json({
      token,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.fullName || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Auth signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
