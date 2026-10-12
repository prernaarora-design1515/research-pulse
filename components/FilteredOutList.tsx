"use client";

import { useState } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";
import PaperArt from "./PaperArt";
import PriorityBadge from "./PriorityBadge";

export default function FilteredOutList({
  items,
  onOpen,
}: {
  items: BriefItemView[];
  onOpen: (item: BriefItemView) => void;
}) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-900/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium uppercase tracking-wide text-neutral-600 transition-colors hover:text-accent active:scale-[0.99] dark:text-neutral-400"
      >
        <span
          className={`inline-block text-accent transition-transform duration-300 ease-out ${
            open ? "rotate-90" : ""
          }`}
        >
          ▸
        </span>
        {open ? "Hide" : "Show"} {items.length} filtered-out paper{items.length === 1 ? "" : "s"}
        <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-neutral-400 dark:text-neutral-600">
          {open ? "click to collapse" : "click to expand"}
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <button
                key={item.paperId}
                onClick={() => onOpen(item)}
                className="animate-fade-in-up group flex gap-3 rounded-xl bg-white p-2.5 text-left transition-all hover:-tranneutral-y-0.5 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                style={{ animationDelay: open ? `${Math.min(i, 12) * 30}ms` : "0ms" }}
              >
                <PaperArt seed={item.paperId} alt={item.title} className="aspect-[3/4] w-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-xs font-medium text-neutral-700 group-hover:text-accent dark:text-neutral-300">
                      {item.title}
                    </p>
                    <PriorityBadge
                      priority={item.priority}
                      className="shrink-0 text-neutral-400 dark:text-neutral-600"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-600">
                    {item.significanceScore > 0
                      ? `Score ${item.significanceScore}/10 · ${item.selectionReason}`
                      : item.selectionReason}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
