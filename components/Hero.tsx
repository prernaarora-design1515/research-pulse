"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BriefItemView } from "@/lib/db/briefQueries";
import type { Priority } from "./PriorityDropdown";
import PaperArt from "./PaperArt";
import PaperDetailModal from "./PaperDetailModal";

export type HeroItem = BriefItemView & { domainName: string };

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

// Index 0-3 are the visible stack depths (front to back). Index 4 is the
// "parked" state — just past the back of the stack, invisible — so a card
// cycling back into view eases in from there instead of popping in place.
const DEPTH_STYLE = [
  { x: 0, y: 0, rotate: -1.5, scale: 1, opacity: 1 },
  { x: 20, y: 16, rotate: 4, scale: 0.96, opacity: 0.9 },
  { x: -18, y: 30, rotate: -6, scale: 0.92, opacity: 0.78 },
  { x: 14, y: 44, rotate: 5, scale: 0.88, opacity: 0.6 },
  { x: 14, y: 54, rotate: 6, scale: 0.84, opacity: 0 },
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
        zIndex: 40 - Math.min(depth, 4) * 10,
        opacity: d.opacity,
        transitionDuration: "550ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={`group absolute inset-0 overflow-hidden border-2 border-white/15 text-left transition-[transform,opacity,box-shadow] ${
        interactive
          ? "cursor-pointer shadow-2xl hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_0_0_3px_var(--color-accent)]"
          : "pointer-events-none shadow-xl"
      }`}
    >
      <PaperArt seed={item.paperId} alt={item.title} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15" />
      <div
        aria-hidden
        className="absolute inset-x-[-20%] bottom-[-20%] h-3/4 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.95),rgba(0,0,0,0.5)_55%,transparent_80%)] blur-xl"
      />

      <div
        className={`absolute right-3 top-3 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
          item.priority === "high"
            ? "border-accent bg-accent text-white"
            : "border-white/30 bg-black/40 text-white/80 backdrop-blur-sm"
        }`}
      >
        {item.priority}
      </div>

      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <span className="w-fit border border-white/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/90">
          {item.domainName}
        </span>
        <div>
          <h3 className="font-display text-2xl font-black italic leading-[0.95] text-white line-clamp-2 sm:text-[1.75rem]">
            {item.title}
          </h3>
          <p className="mt-1.5 text-xs text-white/65 line-clamp-1">{item.summary}</p>
        </div>
      </div>
    </button>
  );
}

function StackNavButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous headline" : "Next headline"}
      className="flex h-9 w-9 items-center justify-center border-2 border-slate-900 text-slate-900 transition-all hover:bg-slate-900 hover:text-white active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-900 dark:border-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900 dark:disabled:hover:text-neutral-100"
    >
      {direction === "prev" ? "←" : "→"}
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
  const [priorityOverrides, setPriorityOverrides] = useState<Record<number, Priority>>({});
  const [testEmail, setTestEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const n = items.length;

  async function handleSendTestEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailStatus("sending");
    setEmailError(null);
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEmailStatus("error");
        setEmailError(data.error ?? "Failed to send email");
        return;
      }
      setEmailStatus("sent");
    } catch {
      setEmailStatus("error");
      setEmailError("Something went wrong sending the email.");
    }
  }
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // High-priority picks jump to the front of the stack -- otherwise marking
  // a flashcard "high priority" had no visible effect anywhere.
  const sortedItems = items
    .map((item) => {
      const override = priorityOverrides[item.briefItemId];
      return override ? { ...item, priority: override } : item;
    })
    .sort((a, b) => {
      const rankDiff = (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
      if (rankDiff !== 0) return rankDiff;
      return b.significanceScore - a.significanceScore;
    });

  function handlePriorityChanged(briefItemId: number, next: Priority) {
    setPriorityOverrides((prev) => ({ ...prev, [briefItemId]: next }));
    setOpenItem((prev) =>
      prev && prev.briefItemId === briefItemId ? { ...prev, priority: next } : prev
    );
    setBase(0);
  }

  useEffect(() => {
    if (n < 2) return;
    autoplayRef.current = setInterval(() => {
      setBase((b) => (b + 1) % n);
    }, 6000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [n]);

  function restartAutoplay() {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (n < 2) return;
    autoplayRef.current = setInterval(() => {
      setBase((b) => (b + 1) % n);
    }, 6000);
  }

  function next() {
    setBase((b) => (b + 1) % n);
    restartAutoplay();
  }
  function prev() {
    setBase((b) => (b - 1 + n) % n);
    restartAutoplay();
  }

  function scrollToBrief() {
    document.getElementById("brief")?.scrollIntoView({ behavior: "smooth" });
  }

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
            <span className="-ml-0.5 block text-6xl font-black italic sm:text-7xl lg:text-[5.5rem]">
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
              className="bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all hover:bg-accent active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-accent dark:hover:text-white"
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

          <div className="max-w-sm border-t border-slate-200 pt-5 dark:border-neutral-800">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-600">
              See it work
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
              Drop your email and we&rsquo;ll fire off a real test message right now.
            </p>
            <form onSubmit={handleSendTestEmail} className="mt-3 flex gap-2">
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => {
                  setTestEmail(e.target.value);
                  if (emailStatus !== "idle") setEmailStatus("idle");
                }}
                placeholder="you@example.com"
                className="min-w-0 flex-1 border-2 border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-accent focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
              <button
                type="submit"
                disabled={emailStatus === "sending"}
                className="shrink-0 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-all hover:bg-accent active:scale-95 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-accent dark:hover:text-white"
              >
                {emailStatus === "sending" ? "Sending…" : "Send test"}
              </button>
            </form>
            {emailStatus === "sent" && (
              <p className="mt-2 text-xs font-medium text-accent">
                Sent — check your inbox (and spam folder).
              </p>
            )}
            {emailStatus === "error" && (
              <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                {emailError}
              </p>
            )}
          </div>
        </div>

        {n > 0 && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-72 w-full max-w-xs sm:h-80 sm:max-w-sm">
              {sortedItems.map((item, i) => {
                const depth = (i - base + n) % n;
                if (depth > 4) return null;
                return (
                  <FlashCard
                    key={item.paperId}
                    item={item}
                    depth={depth}
                    onOpen={() => setOpenItem(item)}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              <StackNavButton direction="prev" onClick={prev} disabled={n < 2} />
              <span className="w-12 text-center text-[10px] uppercase tracking-wider text-slate-400 tabular-nums dark:text-neutral-600">
                {base + 1} / {n}
              </span>
              <StackNavButton direction="next" onClick={next} disabled={n < 2} />
            </div>
          </div>
        )}
      </div>

      <PaperDetailModal
        item={openItem}
        allTags={allTags}
        onClose={() => setOpenItem(null)}
        onPriorityChanged={handlePriorityChanged}
      />
    </section>
  );
}
