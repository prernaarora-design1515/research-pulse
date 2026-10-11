"use client";

import { useState } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";
import PaperThumbnail from "./PaperThumbnail";
import PaperActions from "./PaperActions";
import PriorityDropdown from "./PriorityDropdown";

export default function PaperCard({
  item,
  domainName,
  allTags,
  index,
}: {
  item: BriefItemView;
  domainName: string;
  allTags: string[];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="animate-fade-in-up group w-[320px] shrink-0 snap-start rounded border border-slate-200 bg-white transition-all duration-200 hover:border-accent/50 hover:shadow-md sm:w-[360px] dark:border-neutral-800 dark:bg-neutral-900"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <PaperThumbnail seed={item.url} score={item.significanceScore} domainName={domainName} />

      <div className="cursor-pointer p-4" onClick={() => setExpanded((e) => !e)}>
        <p className="text-[11px] font-medium uppercase tracking-wide text-accent">
          {item.selectionReason}
        </p>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`mt-1 block font-semibold leading-snug text-slate-900 hover:underline dark:text-neutral-100 ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {item.title}
        </a>
        <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
          {item.authors.slice(0, 3).join(", ")}
          {item.authors.length > 3 ? " et al." : ""} &middot; {item.publishedAt.slice(0, 10)}
          {item.hfUpvotes != null && <> &middot; {item.hfUpvotes} hf</>}
        </p>

        <p
          className={`mt-2 text-sm text-slate-700 dark:text-neutral-300 ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {item.summary}
        </p>

        {expanded && (
          <p className="mt-2 text-sm text-slate-600 dark:text-neutral-400">
            <span className="font-medium text-slate-800 dark:text-neutral-200">matters: </span>
            {item.whyItMatters}
          </p>
        )}

        {!expanded && (
          <p className="mt-1 text-[11px] text-slate-400 group-hover:text-accent dark:text-neutral-600">
            tap to expand
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2 dark:border-neutral-800">
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
