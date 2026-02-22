import mongoose from "mongoose";

const TreePhotoSchema = new mongoose.Schema({
  tree_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tree", required: true },
  mission_id: { type: mongoose.Schema.Types.ObjectId, ref: "Mission" },
  photo_url: String,
  analysis_result: String,
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.TreePhoto || mongoose.model("TreePhoto", TreePhotoSchema);
