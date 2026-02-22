import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db";
import Zone from "../../../../../../models/Zone";

export async function GET(req: NextRequest, context: { params: { farmId: string } } | { params: Promise<{ farmId: string }> }) {
  await connectDB();
  let farmId: string;
  if (typeof (context.params as any).then === "function") {
    // params is a Promise
    const resolved = await (context.params as Promise<{ farmId: string }>);
    farmId = resolved.farmId;
  } else {
    farmId = (context as any).params.farmId;
  }
  const zones = await Zone.find({ farm_id: farmId });
  return NextResponse.json(zones);
}


import mongoose from "mongoose";
import { checkZoneArea } from "../../../../../../lib/checkZoneArea";

export async function POST(req: NextRequest, context: { params: { farmId: string } } | { params: Promise<{ farmId: string }> }) {
  await connectDB();
  let farmId: string;
  if (typeof (context.params as any).then === "function") {
    // params is a Promise
    const resolved = await (context.params as Promise<{ farmId: string }>);
    farmId = resolved.farmId;
  } else {
    farmId = (context as any).params.farmId;
  }
  const body = await req.json();
  const newZoneArea = Number(body.width) * Number(body.length);
  const isAllowed = await checkZoneArea(farmId, newZoneArea);
  if (!isAllowed) {
    return NextResponse.json({ error: "La somme des surfaces des zones dépasse la surface de la ferme." }, { status: 400 });
  }
  const zone = await Zone.create({ ...body, farm_id: new mongoose.Types.ObjectId(farmId) });
  return NextResponse.json(zone, { status: 201 });
}
