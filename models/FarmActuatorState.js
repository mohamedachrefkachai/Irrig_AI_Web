import mongoose from "mongoose";

const FarmActuatorStateSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true, unique: true },
  zone_id: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },
  valve_state: { type: String, enum: ["ON", "OFF"], default: "OFF" },
  mode: { type: String, enum: ["AUTO", "MANUAL"], default: "MANUAL" },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.FarmActuatorState || mongoose.model("FarmActuatorState", FarmActuatorStateSchema);