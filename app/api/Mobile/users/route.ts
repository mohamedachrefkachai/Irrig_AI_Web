import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await dbConnect();
  const users = await User.find().sort({ createdAt: -1 });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const user = await User.create(body);
  return NextResponse.json(user, { status: 201 });
}