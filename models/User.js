import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["OWNER", "WORKER", "superadmin"], required: true },
  fullName: { type: String },
  phone: { type: String },
  city: { type: String },
  created_at: { type: Date, default: Date.now },
  status: { type: String, enum: ["ACTIVE", "INVITED", "DISABLED"], default: "ACTIVE" },
  company_name: String,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
