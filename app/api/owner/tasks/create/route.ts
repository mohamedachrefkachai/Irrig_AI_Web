import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Task from "../../../../../models/Task";
import Worker from "../../../../../models/Worker";
import Farm from "../../../../../models/Farm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { farm_id, worker_id, title, description, priority, due_date } = body;

    // Validation
    if (!farm_id || !worker_id || !title) {
      return NextResponse.json(
        { error: "farm_id, worker_id, and title are required" },
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

    // Verify worker exists and belongs to this farm
    const worker = await Worker.findById(worker_id);
    if (!worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    if (String(worker.farm_id) !== String(farm_id)) {
      return NextResponse.json(
        { error: "Worker does not belong to this farm" },
        { status: 400 }
      );
    }

    // Create task
    const task = new Task({
      farm_id,
      worker_id,
      title,
      description: description || "",
      priority: priority || "MEDIUM",
      status: "TODO",
      due_date: due_date ? new Date(due_date) : null,
      created_at: new Date(),
    });

    await task.save();

    return NextResponse.json({
      success: true,
      message: "Task created successfully",
      task: {
        id: String(task._id),
        farm_id: String(task.farm_id),
        worker_id: String(task.worker_id),
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date,
        created_at: task.created_at,
      },
    });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
