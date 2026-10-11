"use client";

import { useState } from "react";

export default function PaperActions({
  paperId,
  initialBookmarked,
  initialTags,
  allTags,
}: {
  paperId: number;
  initialBookmarked: boolean;
  initialTags: string[];
  allTags: string[];
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [tags, setTags] = useState(initialTags);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  async function toggleBookmark() {
    setLoading(true);
    try {
      if (bookmarked) {
        await fetch(`/api/bookmarks?paperId=${paperId}`, { method: "DELETE" });
        setBookmarked(false);
        setTags([]);
      } else {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paperId }),
        });
        setBookmarked(true);
      }
      setJustToggled(true);
      setTimeout(() => setJustToggled(false), 260);
    } finally {
      setLoading(false);
    }
  }

  async function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) {
      setAdding(false);
      setDraft("");
      return;
    }
    setDraft("");
    setAdding(false);
    setTags((prev) => [...prev, tag]);
    setBookmarked(true);
    await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paperId, tags: [tag] }),
    });
  }

  async function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    await fetch("/api/bookmarks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paperId, tags: next }),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={toggleBookmark}
        disabled={loading}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark this paper"}
        className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium transition-colors active:scale-90 ${
          justToggled ? "animate-pop" : ""
        } ${
          bookmarked
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:hover:bg-yellow-500/25"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-700"
        } disabled:opacity-50`}
      >
        {bookmarked ? "★ saved" : "☆ save"}
      </button>

      {tags.map((tag) => (
        <span
          key={tag}
          className="group/tag flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] text-accent"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            aria-label={`Remove tag ${tag}`}
            className="opacity-50 transition-opacity hover:opacity-100"
          >
            ×
          </button>
        </span>
      ))}

      {adding ? (
        <input
          autoFocus
          list="rp-all-tags"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTag(draft);
            if (e.key === "Escape") {
              setAdding(false);
              setDraft("");
            }
          }}
          onBlur={() => addTag(draft)}
          placeholder="tag + Enter"
          className="w-24 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-900 focus:border-accent focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-full px-1.5 py-0.5 text-[11px] text-slate-400 transition-colors hover:bg-slate-100 hover:text-accent dark:text-neutral-600 dark:hover:bg-neutral-800"
        >
          + tag
        </button>
      )}
      <datalist id="rp-all-tags">
        {allTags.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  );
}
