import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Task from "../../../../models/Task";
import Zone from "../../../../models/Zone";
import Robot from "../../../../models/Robot";
import Farm from "../../../../models/Farm";

export async function GET(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  try {
    await connectDB();
    const farmId = params.farmId;

    // Verify farm exists
    const farm = await Farm.findById(farmId);
    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    // Fetch all data for this farm
    const [tasks, zones, robots] = await Promise.all([
      Task.find({ farm_id: farmId }),
      Zone.find({ farm_id: farmId }),
      Robot.find({ farm_id: farmId }),
    ]);

    return NextResponse.json({
      success: true,
      farm: {
        _id: farm._id,
        name: farm.name,
        location: farm.location,
        length: farm.longueur,
        width: farm.largeur,
      },
      tasks,
      zones,
      robots,
    });
  } catch (error) {
    console.error("Error fetching farm data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
