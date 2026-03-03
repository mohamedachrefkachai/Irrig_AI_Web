import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Task from "../../../../../models/Task";
import Worker from "../../../../../models/Worker";
import Farm from "../../../../../models/Farm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const farm_id = searchParams.get("farm_id");

    if (!farm_id) {
      return NextResponse.json(
        { error: "farm_id is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify farm exists
    const farm = await Farm.findById(farm_id);
    if (!farm) {
      return NextResponse.json(
        { error: "Farm not found" },
        { status: 404 }
      );
    }

    // Get all tasks for this farm with worker details
    const tasks = await Task.find({ farm_id })
      .populate({
        path: "worker_id",
        populate: {
          path: "user_id",
          select: "email fullName",
        },
      })
      .sort({ created_at: -1 });

    const tasksWithDetails = tasks.map((task: any) => ({
      id: String(task._id),
      farm_id: String(task.farm_id),
      worker: {
        id: String(task.worker_id._id),
        name: task.worker_id.full_name,
        email: task.worker_id.user_id?.email || "",
      },
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date,
      created_at: task.created_at,
    }));

    return NextResponse.json({
      success: true,
      tasks: tasksWithDetails,
    });
  } catch (error) {
    console.error("List tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
