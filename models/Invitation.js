import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
  role: { type: String, enum: ["WORKER"], default: "WORKER" },
  token: String,
  status: { type: String, enum: ["PENDING", "ACCEPTED"], default: "PENDING" },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Invitation || mongoose.model("Invitation", InvitationSchema);
