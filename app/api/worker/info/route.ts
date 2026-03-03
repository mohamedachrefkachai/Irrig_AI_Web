import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Worker from "../../../../models/Worker";
import Task from "../../../../models/Task";
import Zone from "../../../../models/Zone";
import Tree from "../../../../models/Tree";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let worker_user_id = searchParams.get("user_id");

    // If no user_id in params, try to extract from token
    if (!worker_user_id) {
      const authHeader = req.headers.get("authorization");
      const rawToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

      if (rawToken && rawToken.includes("_")) {
        // Token format: "mobile_USER_ID_TIMESTAMP"
        const parts = rawToken.split("_");
        if (parts.length >= 3 && parts[0] === "mobile") {
          worker_user_id = parts[1];
        }
      }
    }

    if (!worker_user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(worker_user_id);
    if (!user || user.role !== "WORKER") {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    const worker = await Worker.findOne({ user_id: new mongoose.Types.ObjectId(worker_user_id) })
      .populate("farm_id", "name location longueur largeur")
      .populate("user_id", "email fullName");

    if (!worker || !worker.farm_id) {
      return NextResponse.json(
        { error: "Worker not assigned to any farm" },
        { status: 404 }
      );
    }

    // Get zones for this farm
    const zones = await Zone.find({ farm_id: worker.farm_id._id });
    const zoneIds = zones.map((zone: any) => zone._id);
    const trees = await Tree.find({ zone_id: { $in: zoneIds } });

    const treesByZone = trees.reduce((acc: Record<string, any[]>, tree: any) => {
      const zoneId = String(tree.zone_id);
      if (!acc[zoneId]) {
        acc[zoneId] = [];
      }
      acc[zoneId].push({
        id: String(tree._id),
        tree_code: tree.tree_code,
        row_number: tree.row_number,
        index_in_row: tree.index_in_row,
        health_status: tree.health_status,
        last_seen_at: tree.last_seen_at,
      });
      return acc;
    }, {});

    // Get worker's tasks
    const tasks = await Task.find({ 
      farm_id: worker.farm_id._id,
      worker_id: worker._id
    }).sort({ created_at: -1 });

    return NextResponse.json({
      success: true,
      worker: {
        id: String(worker._id),
        user_id: String(worker.user_id._id),
        full_name: worker.full_name,
        email: (worker.user_id as any).email,
        status: worker.status,
      },
      farm: {
        id: String(worker.farm_id._id),
        name: (worker.farm_id as any).name,
        location: (worker.farm_id as any).location,
        longueur: (worker.farm_id as any).longueur,
        largeur: (worker.farm_id as any).largeur,
      },
      zones: zones.map((zone: any) => ({
        id: String(zone._id),
        name: zone.name || "Unnamed Zone",
        crop_type: zone.crop_type,
        mode: zone.mode,
        width: zone.width,
        length: zone.length,
        x: zone.x,
        y: zone.y,
        moisture_threshold: zone.moisture_threshold,
        created_at: zone.created_at,
        trees: treesByZone[String(zone._id)] || [],
      })),
      tasks: tasks.map((task: any) => ({
        id: String(task._id),
        title: task.title || "Unnamed Task",
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        created_at: task.created_at,
      })),
    });
  } catch (error) {
    console.error("Worker info error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
