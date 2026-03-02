import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../../../../lib/db";
import Tree from "../../../../../../../../models/Tree";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  context: { params: { farmId: string; zoneId: string } } | { params: Promise<{ farmId: string; zoneId: string }> }
) {
  await connectDB();
  let zoneId: string;

  if (typeof (context.params as any).then === "function") {
    const resolved = await (context.params as Promise<{ farmId: string; zoneId: string }>);
    zoneId = resolved.zoneId;
  } else {
    zoneId = (context as any).params.zoneId;
  }

  const trees = await Tree.find({ zone_id: zoneId });
  return NextResponse.json(trees);
}

export async function POST(
  req: NextRequest,
  context: { params: { farmId: string; zoneId: string } } | { params: Promise<{ farmId: string; zoneId: string }> }
) {
  await connectDB();
  let zoneId: string;

  if (typeof (context.params as any).then === "function") {
    const resolved = await (context.params as Promise<{ farmId: string; zoneId: string }>);
    zoneId = resolved.zoneId;
  } else {
    zoneId = (context as any).params.zoneId;
  }

  const body = await req.json();
  const zoneObjectId = new mongoose.Types.ObjectId(zoneId);

  // Check if bulk request (array) or single tree
  if (Array.isArray(body)) {
    // Bulk add
    const treesToInsert = body.map((tree) => ({
      zone_id: zoneObjectId,
      tree_code: tree.tree_code,
      row_number: tree.row_number || 0,
      index_in_row: tree.index_in_row || 0,
      health_status: tree.health_status || "OK",
    }));

    const trees = await Tree.insertMany(treesToInsert);
    return NextResponse.json(trees, { status: 201 });
  } else {
    // Single tree add
    const tree = await Tree.create({
      zone_id: zoneObjectId,
      tree_code: body.tree_code,
      row_number: body.row_number || 0,
      index_in_row: body.index_in_row || 0,
      health_status: body.health_status || "OK",
    });

    return NextResponse.json(tree, { status: 201 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { farmId: string; zoneId: string } } | { params: Promise<{ farmId: string; zoneId: string }> }
) {
  await connectDB();
  let zoneId: string;

  if (typeof (context.params as any).then === "function") {
    const resolved = await (context.params as Promise<{ farmId: string; zoneId: string }>);
    zoneId = resolved.zoneId;
  } else {
    zoneId = (context as any).params.zoneId;
  }

  const body = await req.json();
  const treeId = body.tree_id;

  if (!treeId) {
    return NextResponse.json({ error: "tree_id is required" }, { status: 400 });
  }

  await Tree.findByIdAndDelete(treeId);
  return NextResponse.json({ success: true });
}
