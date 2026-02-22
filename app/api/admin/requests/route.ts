import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import PurchaseRequest from "../../../../models/PurchaseRequest";
import User from "../../../../models/User";

export async function GET() {
  await connectDB();
  const requests = await PurchaseRequest.find({ status: "PENDING" }).populate("userId");
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const { requestId, action } = await req.json();
  await connectDB();
  const request = await PurchaseRequest.findById(requestId);
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  const user = await User.findById(request.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (action === "approve") {
    request.status = "APPROVED";
    await request.save();
    // Copier les infos manquantes de la demande vers l'utilisateur
    if (!user.fullName && request.fullName) user.fullName = request.fullName;
    if (!user.phone && request.phone) user.phone = request.phone;
    if (!user.company_name && request.farmName) user.company_name = request.farmName;
    user.status = "ACTIVE";
    await user.save();
    return NextResponse.json({ success: true });
  } else if (action === "reject") {
    await PurchaseRequest.deleteOne({ _id: requestId });
    await User.deleteOne({ _id: user._id });
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
