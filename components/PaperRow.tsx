"use client";

import { useEffect, useRef } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";
import PaperArt from "./PaperArt";
import PriorityBadge from "./PriorityBadge";

const AUTO_SPEED = 40; // px/sec ambient drift
const RESUME_DELAY_MS = 1200; // how long after manual input before autoplay resumes

function PaperTile({ item, onOpen }: { item: BriefItemView; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group relative block w-56 shrink-0 overflow-hidden border-2 border-slate-900 text-left transition-shadow duration-300 hover:shadow-[5px_5px_0_0_var(--color-accent)] dark:border-neutral-100 sm:w-64"
    >
      <PaperArt seed={item.paperId} alt={item.title} className="aspect-[4/5] w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      <PriorityBadge
        priority={item.priority}
        className="pointer-events-none absolute right-2 top-2 border border-white/30 bg-black/50 px-1.5 py-0.5 text-white backdrop-blur-sm"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">
          {item.selectionReason}
        </p>
        <h3 className="mt-1 font-display text-base font-semibold leading-snug text-white line-clamp-2">
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
      className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-slate-900 bg-white text-slate-900 transition-all hover:bg-slate-900 hover:text-white dark:border-neutral-100 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
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
  const directionRef = useRef(1); // 1 = forward, -1 = backward
  const resumeAtRef = useRef(0); // timestamp (ms) when autoplay may resume
  const draggingRef = useRef(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function pauseAutoplay(ms = RESUME_DELAY_MS) {
      resumeAtRef.current = performance.now() + ms;
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      el!.scrollLeft += e.deltaY + e.deltaX;
      pauseAutoplay();
    }

    function onPointerDown() {
      draggingRef.current = true;
      pauseAutoplay(999999);
    }
    function onPointerUp() {
      draggingRef.current = false;
      pauseAutoplay();
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onPointerDown, { passive: true });
    el.addEventListener("touchend", onPointerUp, { passive: true });
    el.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mouseup", onPointerUp);

    let raf: number;
    let last = performance.now();

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (now >= resumeAtRef.current && !draggingRef.current && el) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          el.scrollLeft += AUTO_SPEED * directionRef.current * dt;
          if (el.scrollLeft >= max) {
            el.scrollLeft = max;
            directionRef.current = -1;
          } else if (el.scrollLeft <= 0) {
            el.scrollLeft = 0;
            directionRef.current = 1;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onPointerDown);
      el.removeEventListener("touchend", onPointerUp);
      el.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mouseup", onPointerUp);
    };
  }, [items]);

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
    resumeAtRef.current = performance.now() + RESUME_DELAY_MS;
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
        className="flex flex-1 gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <PaperTile key={item.paperId} item={item} onOpen={() => onOpen(item)} />
        ))}
      </div>
      <ArrowButton direction="right" onClick={() => scrollBy(320)} />
    </div>
  );
}
