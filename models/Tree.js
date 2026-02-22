import mongoose from "mongoose";

const TreeSchema = new mongoose.Schema({
  zone_id: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
  tree_code: String,
  row_number: Number,
  index_in_row: Number,
  health_status: { type: String, enum: ["OK", "STRESS", "DISEASE"], default: "OK" },
  last_seen_at: Date,
});

export default mongoose.models.Tree || mongoose.model("Tree", TreeSchema);
