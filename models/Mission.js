import mongoose from "mongoose";

const MissionSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
  robot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Robot", required: true },
  type: { type: String, enum: ["TREE", "ZONE"], required: true },
  action: { type: String, enum: ["IRRIGATE", "SPRAY", "INSPECT"], required: true },
  target_id: mongoose.Schema.Types.ObjectId, // Peut référencer tree_id ou zone_id
  duration_min: Number,
  status: { type: String, enum: ["PENDING", "RUNNING", "DONE", "FAILED"], default: "PENDING" },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Owner" },
  created_at: { type: Date, default: Date.now },
  completed_at: Date,
  notes: String,
});

export default mongoose.models.Mission || mongoose.model("Mission", MissionSchema);
