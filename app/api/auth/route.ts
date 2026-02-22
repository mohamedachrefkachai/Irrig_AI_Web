import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { ensureSuperAdmin } from "../../../lib/ensureSuperAdmin";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  await ensureSuperAdmin();
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  // Only allow login if status is ACTIVE (for OWNER)
  if (user.role === "OWNER" && user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Account not approved" }, { status: 403 });
  }
  // TODO: create session/JWT with role + status
  return NextResponse.json({ success: true, user: { email: user.email, role: user.role, status: user.status, fullName: user.fullName, _id: user._id } });
}
