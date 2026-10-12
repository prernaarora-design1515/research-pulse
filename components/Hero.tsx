"use client";

import { useState } from "react";
import Link from "next/link";
import type { BriefItemView } from "@/lib/db/briefQueries";
import type { Priority } from "./PriorityDropdown";
import PaperArt from "./PaperArt";
import PriorityStamp from "./PriorityStamp";
import PaperDetailModal from "./PaperDetailModal";
import { Wordmark, Marquee, Magnetic, Tilt, Scribble } from "./Motion";

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

  const marqueeItems = [
    ...Array.from(new Set(items.map((i) => i.domainName))),
    "nothing hidden",
    "just ranked",
  ];

  function handlePriorityChanged(briefItemId: number, next: Priority) {
    setPriorityOverrides((prev) => ({ ...prev, [briefItemId]: next }));
    setOpenItem((prev) =>
      prev && prev.briefItemId === briefItemId ? { ...prev, priority: next } : prev
    );
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
    <section className="animate-fade-in-up pb-4 lg:pb-8">
      <div className="relative">
        <Wordmark text="Pulse" />
        <p
          className="float absolute -top-2 right-0 hidden font-hand text-2xl text-neutral-500 sm:block dark:text-neutral-400"
          style={{ ["--r" as string]: "6deg" }}
        >
          est. weekly, nothing hidden ✎
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-1 font-mono text-[10px] uppercase text-[#121212] sm:grid-cols-5 dark:text-[#f1f1f1]">
        {["Weekly", "arXiv", "Gemini", "Ranked", "Nothing hidden", `(${String(domainsCount).padStart(2, "0")})`, "Domains", "Live data", "Kavita chooses"].map((t) => (
          <span key={t} className="w-fit transition-transform duration-200 hover:-translate-y-0.5 hover:rotate-[-2deg]">
            {t}
          </span>
        ))}
      </div>

      <p className="mt-8 max-w-3xl text-xl leading-snug text-[#121212] sm:text-2xl dark:text-[#f1f1f1]">
        The system{" "}
        <span className="relative inline-block">
          narrows
          <Scribble on className="text-neutral-500" />
        </span>
        , Kavita chooses. Every week {domainsCount} research domains are scanned, scored and surfaced
        from live arXiv data &mdash; nothing is ever hidden, just ranked.
      </p>

      <div className="mt-10">
        <Marquee items={marqueeItems} />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-7">
          <div className="flex flex-wrap items-center gap-5">
            <Magnetic>
              <button
                onClick={scrollToBrief}
                className="group relative overflow-hidden rounded-full bg-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-transform active:scale-90 dark:bg-neutral-100 dark:text-neutral-900"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  Explore this week&rsquo;s brief
                  <span className="inline-block transition-transform duration-300 group-hover:translate-y-1">↓</span>
                </span>
                <span className="absolute inset-0 origin-left scale-x-0 bg-neutral-600 transition-transform duration-500 ease-out group-hover:scale-x-100 dark:bg-neutral-400" />
              </button>
            </Magnetic>
            <Link
              href="/settings"
              className="group relative flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-700 dark:text-neutral-300"
            >
              + Add a domain
              <span className="transition-transform duration-300 group-hover:translate-x-1.5 group-hover:rotate-[-20deg]">→</span>
              <Scribble />
            </Link>
          </div>

          <div className="max-w-sm rounded-2xl bg-neutral-50 p-5 dark:bg-neutral-900">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-600">
              See it work
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
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
                className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 transition-colors focus:border-accent focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <Magnetic strength={0.25}>
                <button
                  type="submit"
                  disabled={emailStatus === "sending"}
                  className="shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-all hover:-rotate-2 active:scale-90 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
                >
                  {emailStatus === "sending" ? "Sending…" : emailStatus === "sent" ? "Sent ✓" : "Send test"}
                </button>
              </Magnetic>
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
          <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3">
            <p
              className="float absolute -top-9 left-2 z-10 font-hand text-2xl text-neutral-500 dark:text-neutral-400"
              style={{ ["--r" as string]: "-4deg" }}
            >
              top picks, one per domain ↘
            </p>
            {sortedItems.map((item, i) => {
              const featured = i === 0;
              return (
                <button
                  key={item.paperId}
                  onClick={() => setOpenItem(item)}
                  className={`group flex flex-col gap-2.5 rounded-2xl p-2 text-left ${
                    featured ? "col-span-2 row-span-2 sm:col-span-2" : ""
                  }`}
                >
                  <Tilt className="sketch-frame relative rounded-2xl">
                    <PaperArt
                      seed={item.paperId}
                      alt={item.title}
                      className={featured ? "aspect-[4/3] w-full" : "aspect-square w-full"}
                    />
                    <PriorityStamp
                      priority={item.priority}
                      className="absolute bottom-3 right-3"
                    />
                  </Tilt>
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                      {item.domainName}
                    </p>
                    <h3
                      className={`font-display leading-snug text-neutral-900 group-hover:text-accent dark:text-neutral-100 line-clamp-2 ${
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
