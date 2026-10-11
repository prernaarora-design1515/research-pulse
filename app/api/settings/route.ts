import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const rows = await db.select().from(settings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.key !== "string" || typeof body.value !== "string") {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }

  if (body.key === "recipient_email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(body.value)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
  }

  await db
    .insert(settings)
    .values({ key: body.key, value: body.value })
    .onConflictDoUpdate({ target: settings.key, set: { value: body.value } });

  return NextResponse.json({ ok: true });
}
