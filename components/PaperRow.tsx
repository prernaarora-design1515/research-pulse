"use client";

import { useRef } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";
import PdfThumbnail from "./PdfThumbnail";

function pdfUrlFor(absUrl: string): string {
  return absUrl.replace("/abs/", "/pdf/");
}

function PaperTile({ item, onOpen }: { item: BriefItemView; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group relative block w-56 shrink-0 snap-start overflow-hidden rounded-xl text-left sm:w-64"
    >
      <PdfThumbnail
        pdfUrl={pdfUrlFor(item.url)}
        alt={item.title}
        className="aspect-[4/5] w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">
          {item.selectionReason}
        </p>
        <h3 className="mt-1 text-sm font-semibold leading-snug text-white line-clamp-2">
          {item.title}
        </h3>
        <p className="mt-1 text-[11px] text-white/70">
          {item.authors[0]}
          {item.authors.length > 1 ? " et al." : ""} &middot; {item.publishedAt.slice(0, 10)}
        </p>
      </div>
    </button>
  );
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition-colors hover:border-accent hover:text-accent dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
    >
      {direction === "left" ? "←" : "→"}
    </button>
  );
}

export default function PaperRow({
  items,
  onOpen,
}: {
  items: BriefItemView[];
  onOpen: (item: BriefItemView) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (items.length === 0) {
    return (
      <p className="py-10 text-sm text-slate-400 dark:text-neutral-600">
        Nothing significant surfaced this week in this domain.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ArrowButton direction="left" onClick={() => scrollBy(-320)} />
      <div
        ref={scrollerRef}
        className="flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <PaperTile key={item.paperId} item={item} onOpen={() => onOpen(item)} />
        ))}
      </div>
      <ArrowButton direction="right" onClick={() => scrollBy(320)} />
    </div>
  );
}
