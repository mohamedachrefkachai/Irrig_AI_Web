import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db";
import FarmStationReading from "../../../../../../models/FarmStationReading";
import mongoose from "mongoose";

function normalizeDisplayDate(value: unknown, fallback: Date) {
  const parsed = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  // Reject timestamps that are clearly bogus for this app.
  if (parsed.getFullYear() < 2020) {
    return fallback;
  }

  return parsed;
}

export async function GET(
  req: NextRequest,
  context: { params: { farmId: string } } | { params: Promise<{ farmId: string }> }
) {
  await connectDB();

  const resolved = typeof (context.params as any).then === "function"
    ? await (context.params as Promise<{ farmId: string }>)
    : (context as any).params;

  const latest = await FarmStationReading.findOne({ farm_id: new mongoose.Types.ObjectId(resolved.farmId) })
    .sort({ recorded_at: -1 });

  if (!latest) {
    return NextResponse.json({
      farm_id: resolved.farmId,
      temperature: null,
      humidity: null,
      rain: null,
      luminosity: null,
      recorded_at: null,
    });
  }

  return NextResponse.json({
    farm_id: String(latest.farm_id),
    zone_id: latest.zone_id ? String(latest.zone_id) : null,
    temperature: latest.temperature,
    humidity: latest.humidity,
    rain: latest.rain,
    luminosity: latest.luminosity,
    recorded_at: normalizeDisplayDate(latest.recorded_at, latest._id.getTimestamp()),
  });
}

export async function POST(
  req: NextRequest,
  context: { params: { farmId: string } } | { params: Promise<{ farmId: string }> }
) {
  await connectDB();

  const resolved = typeof (context.params as any).then === "function"
    ? await (context.params as Promise<{ farmId: string }>)
    : (context as any).params;

  const body = await req.json();
  const fallbackDate = new mongoose.Types.ObjectId().getTimestamp();
  const recordedAt = normalizeDisplayDate(body.recorded_at, fallbackDate);

  const reading = await FarmStationReading.create({
    farm_id: new mongoose.Types.ObjectId(resolved.farmId),
    zone_id: body.zone_id ? new mongoose.Types.ObjectId(body.zone_id) : undefined,
    temperature: body.temperature,
    humidity: body.humidity,
    rain: body.rain,
    luminosity: body.luminosity,
    recorded_at: recordedAt,
  });

  return NextResponse.json({
    farm_id: String(reading.farm_id),
    zone_id: reading.zone_id ? String(reading.zone_id) : null,
    temperature: reading.temperature,
    humidity: reading.humidity,
    rain: reading.rain,
    luminosity: reading.luminosity,
    recorded_at: reading.recorded_at,
  }, { status: 201 });
}