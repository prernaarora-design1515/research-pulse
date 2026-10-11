"use client";

import { useMemo, useState } from "react";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Saved papers</h1>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              activeTag === null ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                activeTag === tag ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-sm text-slate-500">
          {items.length === 0
            ? "No bookmarks yet. Save papers from the brief or archive pages."
            : "No bookmarks with this tag."}
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((b) => (
          <div key={b.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <a
                href={b.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-slate-900 hover:underline"
              >
                {b.title}
              </a>
              <button
                onClick={() => removeBookmark(b.paperId)}
                className="shrink-0 text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {b.authors.slice(0, 4).join(", ")}
              {b.authors.length > 4 ? " et al." : ""} &middot; {b.publishedAt.slice(0, 10)}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                defaultValue={b.tags.join(", ")}
                placeholder="tags, comma-separated"
                onChange={(e) => setTagDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))}
                className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-slate-500 focus:outline-none"
              />
              <button
                onClick={() => saveTags(b)}
                className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
              >
                Save tags
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
