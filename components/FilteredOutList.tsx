"use client";

import { useState } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";

export default function FilteredOutList({ items }: { items: BriefItemView[] }) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        {open ? "Hide" : "Show"} {items.length} filtered-out paper{items.length === 1 ? "" : "s"}
      </button>
      {open && (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.paperId} className="border-t border-slate-200 pt-2 first:border-t-0 first:pt-0">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-slate-700 hover:underline"
              >
                {item.title}
              </a>
              <p className="text-xs text-slate-500">
                Score {item.significanceScore}/10 &middot; {item.selectionReason}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
