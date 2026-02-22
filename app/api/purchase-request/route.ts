import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import PurchaseRequest from "../../../models/PurchaseRequest";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Purchase request received:", data);
    const { fullName, email, phone, password, confirmPassword, farmName, message, city } = data;

    if (!fullName || !email || !phone) {
      console.error("Invalid input", data);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Générer un mot de passe aléatoire si non fourni
    let userPassword = password;
    if (!userPassword) {
      userPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2);
      console.log("[INFO] Mot de passe généré pour l'utilisateur", email, ":", userPassword);
    } else if (password !== confirmPassword) {
      console.error("Passwords do not match", data);
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.error("User already exists:", email);
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(userPassword, 10);

        // Create FARM_OWNER user with status=INVITED (pending approval)
        const user = await User.create({
          email,
          password_hash,
          role: "OWNER",
          status: "INVITED",
          fullName,
          phone,
          city,
          created_at: new Date(),
        });
    console.log("User created:", user.email, user._id);

    // Create PurchaseRequest
    const pr = await PurchaseRequest.create({
      fullName,
      email,
      phone,
      farmName,
      message,
      userId: user._id,
      status: "PENDING",
      created_at: new Date(),
    });
    console.log("PurchaseRequest created:", pr._id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in purchase-request API:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
