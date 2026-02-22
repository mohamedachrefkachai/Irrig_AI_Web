import mongoose from "mongoose";

const OwnerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  full_name: { type: String, required: true },
  phone: String,
  company_name: String,
});

export default mongoose.models.Owner || mongoose.model("Owner", OwnerSchema);
