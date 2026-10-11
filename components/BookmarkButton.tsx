"use client";

import { useState } from "react";

export default function BookmarkButton({
  paperId,
  initialBookmarked,
}: {
  paperId: number;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      if (bookmarked) {
        await fetch(`/api/bookmarks?paperId=${paperId}`, { method: "DELETE" });
        setBookmarked(false);
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

  return (
    <button
      onClick={toggle}
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
  );
}
