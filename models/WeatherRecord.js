import mongoose from "mongoose";

const WeatherRecordSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
  temperature: Number,
  humidity: Number,
  wind_speed: Number,
  rain_mm: Number,
  prediction: mongoose.Schema.Types.Mixed, // JSON
  recorded_at: { type: Date, default: Date.now },
});

export default mongoose.models.WeatherRecord || mongoose.model("WeatherRecord", WeatherRecordSchema);
