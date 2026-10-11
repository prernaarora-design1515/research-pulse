import SavedClient from "./SavedClient";
import { db } from "@/lib/db/client";
import { bookmarks, papers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const rows = await db
    .select({
      id: bookmarks.id,
      paperId: bookmarks.paperId,
      tags: bookmarks.tags,
      note: bookmarks.note,
      title: papers.title,
      authors: papers.authors,
      url: papers.url,
      publishedAt: papers.publishedAt,
    })
    .from(bookmarks)
    .innerJoin(papers, eq(bookmarks.paperId, papers.id))
    .orderBy(bookmarks.createdAt);

  const initialBookmarks = rows.map((r) => ({ ...r, publishedAt: r.publishedAt.toISOString() }));

  return <SavedClient initialBookmarks={initialBookmarks} />;
}
