"use client";

import { useMemo, useState } from "react";
import PdfThumbnail from "@/components/PdfThumbnail";

type Bookmark = {
  id: number;
  paperId: number;
  tags: string[];
  note: string | null;
  title: string;
  authors: string[];
  url: string;
  publishedAt: string;
};

function pdfUrlFor(absUrl: string): string {
  return absUrl.replace("/abs/", "/pdf/");
}

export default function SavedClient({ initialBookmarks }: { initialBookmarks: Bookmark[] }) {
  const [items, setItems] = useState(initialBookmarks);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tagDrafts, setTagDrafts] = useState<Record<number, string>>({});

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const b of items) for (const t of b.tags) set.add(t);
    return Array.from(set).sort();
  }, [items]);

  const filtered = activeTag ? items.filter((b) => b.tags.includes(activeTag)) : items;

  async function removeBookmark(paperId: number) {
    await fetch(`/api/bookmarks?paperId=${paperId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((b) => b.paperId !== paperId));
  }

  async function saveTags(bookmark: Bookmark) {
    const raw = tagDrafts[bookmark.id] ?? bookmark.tags.join(", ");
    const tags = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await fetch("/api/bookmarks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookmark.id, tags }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((b) => (b.id === bookmark.id ? { ...b, tags } : b)));
    }
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-neutral-100">
        Saved papers
      </h1>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-95 ${
              activeTag === null
                ? "bg-slate-900 text-white dark:bg-accent dark:text-accent-foreground"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-95 ${
                activeTag === tag
                  ? "bg-slate-900 text-white dark:bg-accent dark:text-accent-foreground"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-neutral-500">
          {items.length === 0
            ? "No bookmarks yet. Save papers from the brief or archive pages."
            : "No bookmarks with this tag."}
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((b, i) => (
          <div
            key={b.id}
            className="animate-fade-in-up group flex gap-4 overflow-hidden border-2 border-slate-200 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-[4px_4px_0_0_var(--color-accent)] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-100"
            style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
          >
            <PdfThumbnail
              pdfUrl={pdfUrlFor(b.url)}
              alt={b.title}
              className="aspect-[3/4] w-20 shrink-0 border border-slate-300 dark:border-neutral-700 sm:w-24"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-slate-900 hover:underline dark:text-neutral-100"
                >
                  {b.title}
                </a>
                <button
                  onClick={() => removeBookmark(b.paperId)}
                  className="shrink-0 text-xs text-red-600 transition-colors hover:text-red-500 dark:text-red-400"
                >
                  Remove
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
                {b.authors.slice(0, 4).join(", ")}
                {b.authors.length > 4 ? " et al." : ""} &middot; {b.publishedAt.slice(0, 10)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={b.tags.join(", ")}
                  placeholder="tags, comma-separated"
                  onChange={(e) => setTagDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))}
                  className="flex-1 border-2 border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 transition-colors focus:border-accent focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
                <button
                  onClick={() => saveTags(b)}
                  className="bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white transition-all hover:bg-accent active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-accent dark:hover:text-accent-foreground"
                >
                  Save tags
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
