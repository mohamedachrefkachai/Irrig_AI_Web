import mongoose from "mongoose";

const SensorDataSchema = new mongoose.Schema({
  tree_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tree", required: true },
  soil_moisture: Number,
  soil_ph: Number,
  temperature: Number,
  recorded_at: { type: Date, default: Date.now },
});

export default mongoose.models.SensorData || mongoose.model("SensorData", SensorDataSchema);
