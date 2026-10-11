"use client";

import { useState } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";
import PdfThumbnail from "./PdfThumbnail";
import PaperActions from "./PaperActions";
import PriorityDropdown from "./PriorityDropdown";

function pdfUrlFor(absUrl: string): string {
  return absUrl.replace("/abs/", "/pdf/");
}

export default function PaperCard({
  item,
  allTags,
  index,
}: {
  item: BriefItemView;
  allTags: string[];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="animate-fade-in-up group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-black/40"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="block w-full cursor-pointer text-left"
      >
        <PdfThumbnail
          pdfUrl={pdfUrlFor(item.url)}
          alt={item.title}
          className="aspect-[3/4] w-full"
        />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-accent">
          {item.selectionReason}
        </p>
        <button onClick={() => setExpanded((e) => !e)} className="text-left">
          <h3
            className={`mt-1 font-semibold leading-snug text-slate-900 transition-colors group-hover:text-accent dark:text-neutral-100 ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {item.title}
          </h3>
        </button>
        <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
          {item.authors.slice(0, 2).join(", ")}
          {item.authors.length > 2 ? " et al." : ""} &middot; {item.publishedAt.slice(0, 10)}
        </p>

        <p
          className={`mt-2 text-sm text-slate-600 dark:text-neutral-400 ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {item.summary}
        </p>

        {expanded && (
          <p className="mt-2 text-sm text-slate-600 dark:text-neutral-400">
            <span className="font-medium text-slate-800 dark:text-neutral-200">
              Why it matters:{" "}
            </span>
            {item.whyItMatters}
          </p>
        )}

        <div className="mt-auto pt-3">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 underline-offset-2 transition-colors hover:text-accent hover:underline dark:text-neutral-600"
          >
            View on arXiv ↗
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2.5 dark:border-neutral-800">
        <PaperActions
          paperId={item.paperId}
          initialBookmarked={item.isBookmarked}
          initialTags={item.tags}
          allTags={allTags}
        />
        <PriorityDropdown briefItemId={item.briefItemId} initialPriority={item.priority} />
      </div>
    </div>
  );
}
