import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../../lib/db";
import User from "../../../../../models/User";
import Worker from "../../../../../models/Worker";
import Farm from "../../../../../models/Farm";

export async function POST(req: NextRequest) {
  try {
    const { owner_id, farm_id, worker_email, worker_name } = await req.json();

    // Validation
    if (!owner_id || !farm_id || !worker_email) {
      return NextResponse.json(
        { error: "owner_id, farm_id, and worker_email are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify that the owner owns the farm
    const farm = await Farm.findOne({ _id: farm_id, owner_id });
    if (!farm) {
      return NextResponse.json(
        { error: "Farm not found or you don't own this farm" },
        { status: 403 }
      );
    }

    // Check if worker email already exists
    const normalizedEmail = String(worker_email).toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Create User with default password "azerty"
    const password_hash = await bcrypt.hash("azerty", 10);
    const user = await User.create({
      email: normalizedEmail,
      password_hash,
      role: "WORKER",
      fullName: worker_name || "Unknown Worker",
      status: "ACTIVE",
    });

    // Create Worker record
    const worker = await Worker.create({
      user_id: user._id,
      farm_id: farm_id,
      full_name: worker_name || "Unknown Worker",
      status: "ACTIVE",
    });

    return NextResponse.json(
      {
        success: true,
        worker: {
          id: String(worker._id),
          user_id: String(worker.user_id),
          farm_id: String(worker.farm_id),
          full_name: worker.full_name,
          email: user.email,
          status: worker.status,
          default_password: "azerty",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add worker error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
