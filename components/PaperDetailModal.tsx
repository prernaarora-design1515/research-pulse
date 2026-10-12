"use client";

import { useEffect } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";
import PdfThumbnail from "./PdfThumbnail";
import PaperActions from "./PaperActions";
import PriorityDropdown from "./PriorityDropdown";

function pdfUrlFor(absUrl: string): string {
  return absUrl.replace("/abs/", "/pdf/");
}

export default function PaperDetailModal({
  item,
  allTags,
  onClose,
}: {
  item: BriefItemView | null;
  allTags: string[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="animate-fade-in-up fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-start gap-4 overflow-y-auto p-6">
          <PdfThumbnail
            pdfUrl={pdfUrlFor(item.url)}
            alt={item.title}
            className="aspect-[3/4] w-28 shrink-0 rounded-lg sm:w-36"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-accent">
              {item.selectionReason} &middot; score {item.significanceScore}/10
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-snug text-slate-900 dark:text-neutral-100">
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
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-6 py-3 dark:border-neutral-800">
          <PaperActions
            paperId={item.paperId}
            initialBookmarked={item.isBookmarked}
            initialTags={item.tags}
            allTags={allTags}
          />
          <PriorityDropdown briefItemId={item.briefItemId} initialPriority={item.priority} />
        </div>
      </div>
    </div>
  );
}
