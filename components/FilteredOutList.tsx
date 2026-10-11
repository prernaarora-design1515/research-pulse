"use client";

import { useState } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";

export default function FilteredOutList({ items }: { items: BriefItemView[] }) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-accent dark:text-neutral-400"
      >
        <span
          className={`inline-block transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          ▸
        </span>
        {open ? "Hide" : "Show"} {items.length} filtered-out paper{items.length === 1 ? "" : "s"}
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <ul className="space-y-2 overflow-hidden">
          {items.map((item) => (
            <li
              key={item.paperId}
              className="border-t border-slate-200 pt-2 first:border-t-0 first:pt-0 dark:border-neutral-800"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-slate-700 hover:underline dark:text-neutral-300"
              >
                {item.title}
              </a>
              <p className="text-xs text-slate-500 dark:text-neutral-500">
                score {item.significanceScore}/10 &middot; {item.selectionReason}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
