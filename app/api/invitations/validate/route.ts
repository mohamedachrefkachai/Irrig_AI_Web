import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Invitation from "../../../../models/Invitation.js";
import Worker from "../../../../models/Worker.js";
import User from "../../../../models/User.js";
import Farm from "../../../../models/Farm.js";

function normalizeToken(rawToken: unknown): string {
  const value = String(rawToken ?? "").trim();
  if (!value) return "";

  if (value.includes("token=")) {
    const match = value.match(/[?&]token=([^&]+)/i);
    if (match && match[1]) {
      return decodeURIComponent(match[1]).trim().toUpperCase();
    }
  }

  return value.replace(/\s+/g, "").toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { token, userId } = await req.json();

    const normalizedToken = normalizeToken(token);
    if (!normalizedToken || !userId) {
      return NextResponse.json(
        { error: "token and userId required" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await Invitation.findOne({
      token: { $regex: `^${normalizedToken}$`, $options: "i" },
    });
    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation code" },
        { status: 404 }
      );
    }

    if (invitation.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "This invitation has already been used" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get farm details
    const farm = await Farm.findById(invitation.farm_id);
    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    // Create worker record
    const worker = await Worker.create({
      user_id: userId,
      farm_id: invitation.farm_id,
      full_name: user.fullName,
      phone: user.phone,
      status: "ACTIVE",
    });

    // Mark invitation as accepted
    invitation.status = "ACCEPTED";
    await invitation.save();

    return NextResponse.json({
      success: true,
      worker: {
        _id: worker._id,
        farmId: farm._id,
        farmName: farm.name,
        status: "ACTIVE",
      },
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
