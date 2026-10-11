import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { bookmarks, papers } from "@/lib/db/schema";

function cleanTags(tags: unknown): string[] | null {
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === "string")) return null;
  return tags.map((t: string) => t.trim()).filter(Boolean);
}

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

/**
 * Creates a bookmark for a paper, or — if one already exists — merges in any
 * tags passed along. This lets tagging a paper directly on the brief/archive
 * page do double duty as "save + tag" in one call, with no separate step.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const paperId = Number(body?.paperId);
  if (!Number.isInteger(paperId)) {
    return NextResponse.json({ error: "A valid paperId is required" }, { status: 400 });
  }

  const incomingTags = body?.tags !== undefined ? cleanTags(body.tags) : [];
  if (incomingTags === null) {
    return NextResponse.json({ error: "tags must be an array of strings" }, { status: 400 });
  }

  const [existing] = await db.select().from(bookmarks).where(eq(bookmarks.paperId, paperId));
  if (existing) {
    if (incomingTags.length === 0) return NextResponse.json(existing, { status: 200 });
    const merged = Array.from(new Set([...existing.tags, ...incomingTags]));
    const [row] = await db
      .update(bookmarks)
      .set({ tags: merged })
      .where(eq(bookmarks.id, existing.id))
      .returning();
    return NextResponse.json(row, { status: 200 });
  }

  const [row] = await db
    .insert(bookmarks)
    .values({ paperId, tags: incomingTags, note: null })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = body?.id !== undefined ? Number(body.id) : null;
  const paperId = body?.paperId !== undefined ? Number(body.paperId) : null;

  if (!Number.isInteger(id) && !Number.isInteger(paperId)) {
    return NextResponse.json({ error: "A valid id or paperId is required" }, { status: 400 });
  }

  const updates: Partial<typeof bookmarks.$inferInsert> = {};
  if (body.tags !== undefined) {
    const cleaned = cleanTags(body.tags);
    if (cleaned === null) {
      return NextResponse.json({ error: "tags must be an array of strings" }, { status: 400 });
    }
    updates.tags = cleaned;
  }
  if (body.note !== undefined) {
    updates.note = typeof body.note === "string" ? body.note : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const whereClause = Number.isInteger(id)
    ? eq(bookmarks.id, id as number)
    : eq(bookmarks.paperId, paperId as number);

  const [row] = await db.update(bookmarks).set(updates).where(whereClause).returning();
  if (!row) return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paperId = Number(searchParams.get("paperId"));
  if (!Number.isInteger(paperId)) {
    return NextResponse.json({ error: "A valid paperId is required" }, { status: 400 });
  }

  await db.delete(bookmarks).where(eq(bookmarks.paperId, paperId));
  return NextResponse.json({ ok: true });
}
