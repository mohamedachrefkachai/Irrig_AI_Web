import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
  title: String,
  description: String,
  priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
  status: { type: String, enum: ["TODO", "IN_PROGRESS", "DONE"], default: "TODO" },
  due_date: Date,
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
