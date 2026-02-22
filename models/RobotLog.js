import mongoose from "mongoose";

const RobotLogSchema = new mongoose.Schema({
  robot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Robot", required: true },
  level: { type: String, enum: ["INFO", "WARN", "CRITICAL"], default: "INFO" },
  message: String,
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.RobotLog || mongoose.model("RobotLog", RobotLogSchema);
