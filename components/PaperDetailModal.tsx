"use client";

import { useEffect } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";
import PaperArt from "./PaperArt";
import PaperActions from "./PaperActions";
import PriorityDropdown, { type Priority } from "./PriorityDropdown";
import PriorityStamp from "./PriorityStamp";
import { useActivePaper } from "./ActivePaperContext";

export default function PaperDetailModal({
  item,
  allTags,
  onClose,
  onPriorityChanged,
}: {
  item: BriefItemView | null;
  allTags: string[];
  onClose: () => void;
  onPriorityChanged?: (briefItemId: number, next: Priority) => void;
}) {
  const { setActivePaper } = useActivePaper();

  useEffect(() => {
    if (!item) return;
    setActivePaper({ paperId: item.paperId, title: item.title });
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="animate-fade-in-up fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-none bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:h-auto sm:max-h-[85vh] sm:rounded-[2rem] dark:bg-neutral-900"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg font-bold leading-none text-white backdrop-blur-sm transition-all hover:bg-accent"
        >
          ×
        </button>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6 sm:flex-row">
          <div className="relative shrink-0 sm:w-40">
            <PaperArt seed={item.paperId} alt={item.title} className="aspect-[3/4] w-full rounded-2xl" />
            <PriorityStamp priority={item.priority} className="absolute -bottom-2 -right-2" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-accent">
              {item.selectionReason} &middot; score {item.significanceScore}/10
            </p>
            <h2 className="mt-1 break-words font-display text-xl font-semibold leading-snug text-slate-900 dark:text-neutral-100 sm:text-2xl">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-500">
              {item.authors.join(", ")} &middot; {item.publishedAt.slice(0, 10)}
              {item.hfUpvotes != null && <> &middot; {item.hfUpvotes} HF upvotes</>}
            </p>
            <p className="mt-3 text-sm text-slate-700 dark:text-neutral-300">{item.summary}</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-neutral-400">
              <span className="font-medium text-slate-800 dark:text-neutral-200">
                Why it matters:{" "}
              </span>
              {item.whyItMatters}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs text-slate-400 underline-offset-2 transition-colors hover:text-accent hover:underline dark:text-neutral-600"
            >
              View on arXiv ↗
            </a>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-b-[2rem] bg-slate-50 px-6 py-3 dark:bg-neutral-800/50">
          <PaperActions
            paperId={item.paperId}
            initialBookmarked={item.isBookmarked}
            initialTags={item.tags}
            allTags={allTags}
          />
          <PriorityDropdown
            briefItemId={item.briefItemId}
            initialPriority={item.priority}
            onChanged={(next) => onPriorityChanged?.(item.briefItemId, next)}
          />
        </div>
      </div>
    </div>
  );
}
