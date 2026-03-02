import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../../../lib/db";
import Zone from "../../../../../../../models/Zone";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  context: { params: { farmId: string; zoneId: string } } | { params: Promise<{ farmId: string; zoneId: string }> }
) {
  await connectDB();
  let zoneId: string;

  if (typeof (context.params as any).then === "function") {
    const resolved = await (context.params as Promise<{ farmId: string; zoneId: string }>);
    zoneId = resolved.zoneId;
  } else {
    zoneId = (context as any).params.zoneId;
  }

  const zone = await Zone.findById(new mongoose.Types.ObjectId(zoneId));
  if (!zone) {
    return NextResponse.json({ error: "Zone not found" }, { status: 404 });
  }

  return NextResponse.json(zone);
}

export async function DELETE(req: NextRequest, context: { params: { farmId: string, zoneId: string } } | { params: Promise<{ farmId: string, zoneId: string }> }) {
  await connectDB();
  let zoneId: string;
  if (typeof (context.params as any).then === "function") {
    const resolved = await (context.params as Promise<{ farmId: string, zoneId: string }>);
    zoneId = resolved.zoneId;
  } else {
    zoneId = (context as any).params.zoneId;
  }
  const deleted = await Zone.findByIdAndDelete(new mongoose.Types.ObjectId(zoneId));
  if (!deleted) {
    return NextResponse.json({ error: "Zone not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
