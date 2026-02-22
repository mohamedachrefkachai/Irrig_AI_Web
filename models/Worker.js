import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farm" },
  full_name: String,
  phone: String,
  photo_url: String,
  status: { type: String, enum: ["ACTIVE", "INVITED"], default: "INVITED" },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Worker || mongoose.model("Worker", WorkerSchema);
