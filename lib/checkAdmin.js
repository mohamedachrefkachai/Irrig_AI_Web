import 'dotenv/config';
import mongoose from "mongoose";
import User from "../models/User.js";

async function checkAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({});
  if (!users.length) {
    console.log("❌ Aucun utilisateur trouvé.");
    return;
  }
  const admin = users.find(u => u.email === "admin@yourdomain.com");
  if (!admin) {
    console.log("❌ Aucun compte admin@yourdomain.com trouvé.");
  } else {
    console.log("✅ Compte trouvé:", admin);
    if (admin.password === "admin" && admin.role === "superadmin") {
      console.log("✅ Les credentials sont corrects.");
    } else {
      console.log("❌ Les credentials ne correspondent pas.");
    }
  }
  console.log("Liste des utilisateurs:");
  users.forEach(u => console.log(u));
}

checkAdmin();
