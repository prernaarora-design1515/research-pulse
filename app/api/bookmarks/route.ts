import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { bookmarks, papers } from "@/lib/db/schema";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");

  const rows = await db
    .select({
      id: bookmarks.id,
      paperId: bookmarks.paperId,
      tags: bookmarks.tags,
      note: bookmarks.note,
      createdAt: bookmarks.createdAt,
      title: papers.title,
      authors: papers.authors,
      url: papers.url,
      publishedAt: papers.publishedAt,
    })
    .from(bookmarks)
    .innerJoin(papers, eq(bookmarks.paperId, papers.id))
    .orderBy(bookmarks.createdAt);

  const filtered = tag ? rows.filter((r) => r.tags.includes(tag)) : rows;
  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const paperId = Number(body?.paperId);
  if (!Number.isInteger(paperId)) {
    return NextResponse.json({ error: "A valid paperId is required" }, { status: 400 });
  }

  const [existing] = await db.select().from(bookmarks).where(eq(bookmarks.paperId, paperId));
  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const [row] = await db
    .insert(bookmarks)
    .values({ paperId, tags: [], note: null })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "A valid bookmark id is required" }, { status: 400 });
  }

  const updates: Partial<typeof bookmarks.$inferInsert> = {};
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || !body.tags.every((t: unknown) => typeof t === "string")) {
      return NextResponse.json({ error: "tags must be an array of strings" }, { status: 400 });
    }
    updates.tags = body.tags.map((t: string) => t.trim()).filter(Boolean);
  }
  if (body.note !== undefined) {
    updates.note = typeof body.note === "string" ? body.note : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [row] = await db.update(bookmarks).set(updates).where(eq(bookmarks.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const paperId = Number(searchParams.get("paperId"));
  if (!Number.isInteger(paperId)) {
    return NextResponse.json({ error: "A valid paperId is required" }, { status: 400 });
  }

  await db.delete(bookmarks).where(eq(bookmarks.paperId, paperId));
  return NextResponse.json({ ok: true });
}
