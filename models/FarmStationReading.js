import mongoose from "mongoose";

const FarmStationReadingSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
  zone_id: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },
  temperature: Number,
  humidity: Number,
  rain: Number,
  luminosity: Number,
  recorded_at: { type: Date, default: Date.now },
});

export default mongoose.models.FarmStationReading || mongoose.model("FarmStationReading", FarmStationReadingSchema);