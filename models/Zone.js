import mongoose from "mongoose";

const ZoneSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
  name: { type: String, required: true },
  crop_type: String,
  width: { type: Number, required: true },
  length: { type: Number, required: true },
  x: { type: Number, default: 0 }, // position x (mètres)
  y: { type: Number, default: 0 }, // position y (mètres)
  mode: { type: String, enum: ["AUTO", "MANUAL"], default: "AUTO" },
  moisture_threshold: Number,
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Zone || mongoose.model("Zone", ZoneSchema);
