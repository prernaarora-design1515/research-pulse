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
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this paper"}
      className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
        bookmarked
          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      } disabled:opacity-50`}
    >
      {bookmarked ? "★ Saved" : "☆ Save"}
    </button>
  );
}
