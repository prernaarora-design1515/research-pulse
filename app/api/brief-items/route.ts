import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { briefItems } from "@/lib/db/schema";

const VALID_PRIORITIES = ["low", "medium", "high"];

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "A valid brief item id is required" }, { status: 400 });
  }

  if (typeof body.priority !== "string" || !VALID_PRIORITIES.includes(body.priority)) {
    return NextResponse.json(
      { error: "priority must be one of: low, medium, high" },
      { status: 400 }
    );
  }

  const [row] = await db
    .update(briefItems)
    .set({ priority: body.priority })
    .where(eq(briefItems.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: "Brief item not found" }, { status: 404 });
  return NextResponse.json(row);
}
