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
  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  { x: 16, y: 12, rotate: 5, scale: 0.96, opacity: 0.92 },
  { x: -14, y: 24, rotate: -6, scale: 0.92, opacity: 0.8 },
  { x: 10, y: 36, rotate: 4, scale: 0.88, opacity: 0.65 },
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
      className={`absolute inset-0 overflow-hidden rounded-2xl border border-white/10 text-left shadow-xl transition-all duration-500 ease-out ${
        interactive
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-2xl"
          : "pointer-events-none"
      }`}
    >
      <PdfThumbnail pdfUrl={pdfUrlFor(item.url)} alt={item.title} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-black/10" />
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
            {item.domainName}
          </span>
          {item.significanceScore > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
              {item.significanceScore}/10
            </span>
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold leading-snug text-white line-clamp-2">
            {item.title}
          </h3>
          <p className="mt-1 text-xs text-white/70 line-clamp-1">{item.summary}</p>
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
    <section className="animate-fade-in-up grid grid-cols-1 items-center gap-10 py-6 lg:grid-cols-2 lg:gap-16 lg:py-10">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Weekly AI/ML research pulse
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl dark:text-neutral-100">
            The system narrows.
            <br />
            Kavita chooses.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-slate-600 dark:text-neutral-400">
            Every week, {domainsCount} research domains get scanned, scored and surfaced from live
            arXiv data — nothing is ever hidden, just ranked.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={scrollToBrief}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-accent dark:hover:text-white"
          >
            Explore this week&rsquo;s brief
          </button>
          <Link
            href="/settings"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-accent hover:text-accent active:scale-95 dark:border-neutral-700 dark:text-neutral-300"
          >
            + Add a domain
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
              className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-accent hover:text-accent disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-400"
            >
              Shuffle headlines ↻
            </button>
            <span className="text-xs text-slate-400 dark:text-neutral-600">
              best pick from each domain &middot; tap to read
            </span>
          </div>
        </div>
      )}

      <PaperDetailModal item={openItem} allTags={allTags} onClose={() => setOpenItem(null)} />
    </section>
  );
}
