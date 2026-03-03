import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Worker from "../../../../../models/Worker";
import Farm from "../../../../../models/Farm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let owner_id = searchParams.get("owner_id");
    const farm_id = searchParams.get("farm_id");

    if (!owner_id) {
      try {
        const cookie = req.cookies.get("session");
        if (cookie) {
          const session = JSON.parse(decodeURIComponent(cookie.value));
          owner_id = session.userId;
        }
      } catch {}
    }

    if (!owner_id) {
      return NextResponse.json({ error: "owner_id is required" }, { status: 400 });
    }

    console.log("Fetching workers for owner:", owner_id);
    await connectDB();

    // Get all farms for this owner
    let farms = await Farm.find({ owner_id });
    console.log("Found farms:", farms.length);

    if (farm_id) {
      // Filter by specific farm if provided
      farms = farms.filter((f) => f._id.toString() === farm_id);
    }

    // Return empty arrays if no farms, but with success
    if (farms.length === 0) {
      console.log("No farms found for this owner");
      return NextResponse.json({ 
        success: true,
        workers: [], 
        farms: [] 
      });
    }

    const farmIds = farms.map((f) => f._id);

    // Get all workers for these farms
    const workers = await Worker.find({ farm_id: { $in: farmIds } })
      .populate("user_id", "email fullName")
      .populate("farm_id", "name location");
    
    console.log("Found workers:", workers.length);

    const workersList = workers.map((worker: any) => {
      const userData = worker.user_id || {};
      const farmData = worker.farm_id || {};
      
      return {
        id: String(worker._id),
        user_id: String(worker.user_id?._id || ""),
        farm_id: String(worker.farm_id?._id || ""),
        full_name: worker.full_name || "Unknown",
        email: userData.email || "no-email",
        farm_name: farmData.name || "Unknown Farm",
        status: worker.status || "ACTIVE",
        created_at: worker.created_at || new Date(),
      };
    });

    return NextResponse.json({
      success: true,
      workers: workersList,
      farms: farms.map((farm: any) => ({
        id: String(farm._id),
        name: farm.name || "Unnamed",
        location: farm.location || "",
      })),
    });
  } catch (error) {
    console.error("List workers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch workers", details: String(error) },
      { status: 500 }
    );
  }
}
