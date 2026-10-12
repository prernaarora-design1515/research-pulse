"use client";

import { useState } from "react";
import Link from "next/link";
import type { BriefItemView } from "@/lib/db/briefQueries";
import type { Priority } from "./PriorityDropdown";
import PaperArt from "./PaperArt";
import PriorityStamp from "./PriorityStamp";
import PaperDetailModal from "./PaperDetailModal";

export type HeroItem = BriefItemView & { domainName: string };

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function Hero({
  items,
  domainsCount,
  allTags,
}: {
  items: HeroItem[];
  domainsCount: number;
  allTags: string[];
}) {
  const [openItem, setOpenItem] = useState<BriefItemView | null>(null);
  const [priorityOverrides, setPriorityOverrides] = useState<Record<number, Priority>>({});
  const [testEmail, setTestEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  const sortedItems = items
    .map((item) => {
      const override = priorityOverrides[item.briefItemId];
      return override ? { ...item, priority: override } : item;
    })
    .sort((a, b) => {
      const rankDiff = (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
      if (rankDiff !== 0) return rankDiff;
      return b.significanceScore - a.significanceScore;
    })
    .slice(0, 6);

  function handlePriorityChanged(briefItemId: number, next: Priority) {
    setPriorityOverrides((prev) => ({ ...prev, [briefItemId]: next }));
  }

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

  function scrollToBrief() {
    document.getElementById("brief")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="animate-fade-in-up py-4 lg:py-8">
      <div className="mb-8 flex items-center justify-between border-y border-slate-200 py-2 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-500 dark:border-neutral-800 dark:text-neutral-500">
        <span>Weekly Dispatch</span>
        <span>{domainsCount} Domains Scanned — Nothing Hidden</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
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
              className="rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all hover:bg-accent active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-accent dark:hover:text-white"
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

          <div className="max-w-sm rounded-2xl bg-slate-50 p-5 dark:bg-neutral-900">
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
                className="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 transition-colors focus:border-accent focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <button
                type="submit"
                disabled={emailStatus === "sending"}
                className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-all hover:bg-accent active:scale-95 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-accent dark:hover:text-white"
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

        {sortedItems.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sortedItems.map((item, i) => {
              const featured = i === 0;
              return (
                <button
                  key={item.paperId}
                  onClick={() => setOpenItem(item)}
                  className={`group flex flex-col gap-2 rounded-2xl p-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-neutral-900 ${
                    featured ? "col-span-2 row-span-2 sm:col-span-2" : ""
                  }`}
                >
                  <div className="relative">
                    <PaperArt
                      seed={item.paperId}
                      alt={item.title}
                      className={featured ? "aspect-[4/3] w-full" : "aspect-square w-full"}
                    />
                    <PriorityStamp
                      priority={item.priority}
                      className="absolute -bottom-2 -right-2 scale-90"
                    />
                  </div>
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400 dark:text-neutral-600">
                      {item.domainName}
                    </p>
                    <h3
                      className={`font-display italic leading-snug text-slate-900 group-hover:text-accent dark:text-neutral-100 line-clamp-2 ${
                        featured ? "text-lg" : "text-xs"
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>
                </button>
              );
            })}
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
