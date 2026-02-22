import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Farm from "../../../../models/Farm";

export async function GET(req: NextRequest) {
  await connectDB();
  // Get owner_id from cookie session
  let owner_id = null;
  try {
    const cookie = req.cookies.get("session");
    if (cookie) {
      const session = JSON.parse(decodeURIComponent(cookie.value));
      owner_id = session.userId;
    }
  } catch {}
  let farms = [];
  if (owner_id) {
    farms = await Farm.find({ owner_id });
  }
  return NextResponse.json(farms);
}

export async function POST(req: NextRequest) {
  const { name, location, longueur, largeur } = await req.json();
  await connectDB();
  // Get owner_id from cookie session
  let owner_id = null;
  try {
    const cookie = req.cookies.get("session");
    if (cookie) {
      const session = JSON.parse(decodeURIComponent(cookie.value));
      owner_id = session.userId;
    }
  } catch {}
  if (!owner_id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const farm = await Farm.create({ name, location, longueur, largeur, owner_id });
  return NextResponse.json(farm);
}

export async function PUT(req: NextRequest) {
  const { farmId, name, location, area_hectare, cropType } = await req.json();
  await connectDB();
  // TODO: check ownership
  const farm = await Farm.findByIdAndUpdate(farmId, { name, location, area_hectare, cropType }, { new: true });
  return NextResponse.json(farm);
}

export async function DELETE(req: NextRequest) {
  const { farmId } = await req.json();
  await connectDB();
  // TODO: check ownership
  await Farm.findByIdAndDelete(farmId);
  return NextResponse.json({ success: true });
}
