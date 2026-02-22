import mongoose from "mongoose";

const PurchaseRequestSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  farmName: { type: String },
  message: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.PurchaseRequest || mongoose.model("PurchaseRequest", PurchaseRequestSchema);
