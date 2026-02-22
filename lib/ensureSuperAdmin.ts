import { connectDB } from "./db";
import User from "../models/User";
import bcrypt from "bcryptjs";

export async function ensureSuperAdmin() {
  await connectDB();
  const email = "admin@yourdomain.com";
  const password_hash = await bcrypt.hash("admin123", 10);
  let user = await User.findOne({ email });
  if (!user) {
    await User.create({
      email,
      password_hash,
      role: "superadmin",
      nom: "Admin",
      prenom: "Super",
      tel: "00000000",
      created_at: new Date(),
    });
    console.log("Superadmin created: admin@yourdomain.com / admin123");
  } else {
    user.password_hash = password_hash;
    user.role = "superadmin";
    await user.save();
    console.log("Superadmin password reset: admin@yourdomain.com / admin123");
  }
}
