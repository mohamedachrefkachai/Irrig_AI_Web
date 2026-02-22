import 'dotenv/config';
import User from "../models/User.js";
import mongoose from "mongoose";

async function ensureSuperAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ email: "admin@yourdomain.com" });
  if (!existing) {
    await User.create({
      nom: "Admin",
      prenom: "Super",
      email: "admin@yourdomain.com",
      password: "admin", // À sécuriser en prod
      tel: "00000000",
      role: "superadmin",
    });
    console.log("✅ Compte super admin créé.");
  } else {
    console.log("ℹ️ Compte super admin déjà existant.");
  }
}

ensureSuperAdmin();
