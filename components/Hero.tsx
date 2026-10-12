"use client";

import { useState } from "react";
import Link from "next/link";
import type { BriefItemView } from "@/lib/db/briefQueries";
import PdfThumbnail from "./PdfThumbnail";
import PaperDetailModal from "./PaperDetailModal";

export type HeroItem = BriefItemView & { domainName: string };

function pdfUrlFor(absUrl: string): string {
  return absUrl.replace("/abs/", "/pdf/");
}

const DEPTH_STYLE = [
  { x: 0, y: 0, rotate: -1.5, scale: 1, opacity: 1 },
  { x: 18, y: 14, rotate: 4, scale: 0.96, opacity: 0.92 },
  { x: -16, y: 26, rotate: -6, scale: 0.92, opacity: 0.8 },
  { x: 12, y: 38, rotate: 5, scale: 0.88, opacity: 0.65 },
];

function FlashCard({
  item,
  depth,
  onOpen,
}: {
  item: HeroItem;
  depth: number;
  onOpen: () => void;
}) {
  const d = DEPTH_STYLE[Math.min(depth, DEPTH_STYLE.length - 1)];
  const interactive = depth === 0;

  return (
    <button
      onClick={interactive ? onOpen : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-hidden={!interactive}
      style={{
        transform: `translate(${d.x}px, ${d.y}px) rotate(${d.rotate}deg) scale(${d.scale})`,
        zIndex: 40 - depth * 10,
        opacity: d.opacity,
      }}
      className={`absolute inset-0 overflow-hidden rounded-sm border-2 border-white/15 text-left shadow-2xl transition-all duration-500 ease-out ${
        interactive
          ? "cursor-pointer hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_0_0_3px_var(--color-accent)]"
          : "pointer-events-none"
      }`}
    >
      <PdfThumbnail pdfUrl={pdfUrlFor(item.url)} alt={item.title} className="absolute inset-0 h-full w-full grayscale-[25%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

      {item.significanceScore > 0 && (
        <div
          style={{ transform: "rotate(-9deg)" }}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-accent font-display text-xs font-black text-accent"
        >
          {item.significanceScore}/10
        </div>
      )}

      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <span className="w-fit border border-white/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/90">
          {item.domainName}
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold leading-[1.05] text-white line-clamp-2">
            {item.title}
          </h3>
          <p className="mt-1 text-xs text-white/60 line-clamp-1">{item.summary}</p>
        </div>
      </div>
    </button>
  );
}

export default function Hero({
  items,
  domainsCount,
  allTags,
}: {
  items: HeroItem[];
  domainsCount: number;
  allTags: string[];
}) {
  const [base, setBase] = useState(0);
  const [openItem, setOpenItem] = useState<BriefItemView | null>(null);
  const [shuffling, setShuffling] = useState(false);

  function shuffle() {
    setShuffling(true);
    setBase((b) => (b + 1) % items.length);
    setTimeout(() => setShuffling(false), 260);
  }

  function scrollToBrief() {
    document.getElementById("brief")?.scrollIntoView({ behavior: "smooth" });
  }

  const visible = items.length === 0 ? [] : items.map((_, i) => items[(base + i) % items.length]).slice(0, 4);

  return (
    <section className="animate-fade-in-up py-4 lg:py-8">
      <div className="mb-8 flex items-center justify-between border-y border-slate-900/70 py-2 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-500 dark:border-neutral-100/30 dark:text-neutral-500">
        <span>Weekly Dispatch</span>
        <span>{domainsCount} Domains Scanned — Nothing Hidden</span>
      </div>

      <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-7">
          <h1 className="font-display leading-[0.88] tracking-tight text-slate-900 dark:text-neutral-100">
            <span className="block text-xl font-normal italic text-slate-500 sm:text-2xl dark:text-neutral-500">
              The system narrows.
            </span>
            <span className="-ml-0.5 block text-6xl font-black uppercase sm:text-7xl lg:text-[5.5rem]">
              Kavita
              <br />
              <span className="text-accent">Chooses.</span>
            </span>
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-neutral-400">
            Every week, {domainsCount} research domains get scanned, scored and surfaced from live
            arXiv data — nothing is ever hidden, just ranked.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={scrollToBrief}
              className="rounded-none bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all hover:bg-accent active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-accent dark:hover:text-white"
            >
              Explore this week&rsquo;s brief
            </button>
            <Link
              href="/settings"
              className="group flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 transition-colors hover:text-accent dark:text-neutral-300"
            >
              + Add a domain
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {visible.length > 0 && (
          <div className="flex flex-col items-center gap-4">
            <div
              className={`relative h-72 w-full max-w-xs sm:h-80 sm:max-w-sm ${shuffling ? "animate-pop" : ""}`}
            >
              {visible.map((item, i) => (
                <FlashCard
                  key={`${item.paperId}-${base}-${i}`}
                  item={item}
                  depth={i}
                  onOpen={() => setOpenItem(item)}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={shuffle}
                disabled={items.length < 2}
                className="flex items-center gap-1.5 rounded-none border border-slate-900 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-700 transition-colors hover:border-accent hover:text-accent disabled:opacity-40 dark:border-neutral-100 dark:text-neutral-300"
              >
                Shuffle Headlines ↻
              </button>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-neutral-600">
                best pick per domain
              </span>
            </div>
          </div>
        )}
      </div>

      <PaperDetailModal item={openItem} allTags={allTags} onClose={() => setOpenItem(null)} />
    </section>
  );
}
