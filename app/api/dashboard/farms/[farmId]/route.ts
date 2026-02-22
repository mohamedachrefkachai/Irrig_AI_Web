import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Farm from "../../../../../models/Farm";

export async function GET(req: NextRequest, context: { params: Promise<{ farmId: string }> }) {
  await connectDB();
  const { farmId } = await context.params;
  const farm = await Farm.findById(farmId);
  if (!farm) return NextResponse.json({ error: "Farm not found" }, { status: 404 });
  return NextResponse.json(farm);
}
