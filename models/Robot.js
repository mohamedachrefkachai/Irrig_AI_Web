import mongoose from "mongoose";

const RobotSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
  name: String,
  battery_level: Number,
  status: { type: String, enum: ["ONLINE", "OFFLINE", "BUSY"], default: "OFFLINE" },
  health_status: { type: String, enum: ["OK", "WARNING", "CRITICAL"], default: "OK" },
  last_sync: Date,
});

export default mongoose.models.Robot || mongoose.model("Robot", RobotSchema);
