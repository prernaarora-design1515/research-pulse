import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { domains } from "@/lib/db/schema";

function parseListField(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const cleaned = value
    .filter((v) => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
  return cleaned;
}

export async function GET() {
  const rows = await db.select().from(domains).orderBy(domains.id);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
  }

  const arxivCategories = parseListField(body.arxivCategories);
  const keywords = parseListField(body.keywords);
  if (!arxivCategories || arxivCategories.length === 0) {
    return NextResponse.json({ error: "At least one arXiv category is required" }, { status: 400 });
  }
  if (!keywords || keywords.length === 0) {
    return NextResponse.json({ error: "At least one keyword is required" }, { status: 400 });
  }

  const papersToShow = Number.isInteger(body.papersToShow) ? body.papersToShow : 4;
  if (papersToShow < 1 || papersToShow > 20) {
    return NextResponse.json({ error: "papersToShow must be between 1 and 20" }, { status: 400 });
  }

  try {
    const [row] = await db
      .insert(domains)
      .values({
        name: body.name.trim(),
        arxivCategories,
        keywords,
        papersToShow,
        isActive: body.isActive !== false,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create domain";
    if (message.includes("unique")) {
      return NextResponse.json({ error: "A domain with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "A valid domain id is required" }, { status: 400 });
  }

  const updates: Partial<typeof domains.$inferInsert> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Domain name cannot be empty" }, { status: 400 });
    }
    updates.name = body.name.trim();
  }

  if (body.arxivCategories !== undefined) {
    const parsed = parseListField(body.arxivCategories);
    if (!parsed || parsed.length === 0) {
      return NextResponse.json({ error: "At least one arXiv category is required" }, { status: 400 });
    }
    updates.arxivCategories = parsed;
  }

  if (body.keywords !== undefined) {
    const parsed = parseListField(body.keywords);
    if (!parsed || parsed.length === 0) {
      return NextResponse.json({ error: "At least one keyword is required" }, { status: 400 });
    }
    updates.keywords = parsed;
  }

  if (body.papersToShow !== undefined) {
    if (!Number.isInteger(body.papersToShow) || body.papersToShow < 1 || body.papersToShow > 20) {
      return NextResponse.json({ error: "papersToShow must be between 1 and 20" }, { status: 400 });
    }
    updates.papersToShow = body.papersToShow;
  }

  if (body.isActive !== undefined) {
    updates.isActive = Boolean(body.isActive);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const [row] = await db.update(domains).set(updates).where(eq(domains.id, id)).returning();
    if (!row) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update domain";
    if (message.includes("unique")) {
      return NextResponse.json({ error: "A domain with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "A valid domain id is required" }, { status: 400 });
  }

  const [row] = await db.delete(domains).where(eq(domains.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
