import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Invitation from "../../../../models/Invitation";
import Farm from "../../../../models/Farm";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { farmId, emails } = await req.json();

    if (!farmId || !emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: "farmId and emails array required" },
        { status: 400 }
      );
    }

    // Verify farm exists
    const farm = await Farm.findById(farmId);
    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    const invitations = [];
    for (const email of emails) {
      // Generate unique invitation token (6-char alphanumeric code)
      const token = Math.random().toString(36).substring(2, 8).toUpperCase();

      const invitation = await Invitation.create({
        email,
        farm_id: farmId,
        token,
        status: "PENDING",
      });
      invitations.push({
        email,
        token,
        farmName: farm.name,
      });
    }

    return NextResponse.json({
      success: true,
      invitations,
      message: "Invitations generated successfully",
    });
  } catch (error) {
    console.error("Error generating invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
