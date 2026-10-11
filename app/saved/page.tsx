import { isAuthenticated } from "@/lib/auth";
import LoginForm from "../settings/LoginForm";
import SavedClient from "./SavedClient";
import { db } from "@/lib/db/client";
import { bookmarks, papers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="mb-2 text-2xl font-semibold">Saved papers</h1>
        <p className="mb-6 text-sm text-slate-600">
          Bookmarks are Kavita&apos;s personal curation — sign in to view and manage them.
        </p>
        <LoginForm />
      </div>
    );
  }

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
