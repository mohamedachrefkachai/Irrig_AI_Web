import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Owners cannot login via mobile app - Web only
    if (user.role === "OWNER") {
      return NextResponse.json({ error: "Owners must use web dashboard" }, { status: 403 });
    }

    if (user.role === "WORKER" && user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Account not active" }, { status: 403 });
    }

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
    console.error("Auth login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
