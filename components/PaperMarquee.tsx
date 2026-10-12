"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";
import PdfThumbnail from "./PdfThumbnail";

function pdfUrlFor(absUrl: string): string {
  return absUrl.replace("/abs/", "/pdf/");
}

const COLUMN_COUNT = 3;
const BASE_SPEED = 14; // px/sec ambient drift
const SPEED_MULTIPLIERS = [0.85, 1.1, 0.95];
const WHEEL_SENSITIVITY = 0.6;
const VELOCITY_FRICTION = 0.92;
const MAX_VELOCITY = 500;

function distribute<T>(items: T[], columns: number): T[][] {
  const cols: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => cols[i % columns].push(item));
  return cols;
}

function MiniCard({ item, onOpen }: { item: BriefItemView; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      draggable={false}
      className="group relative mb-4 block w-full select-none overflow-hidden rounded-xl text-left"
    >
      <PdfThumbnail
        pdfUrl={pdfUrlFor(item.url)}
        alt={item.title}
        className="aspect-[4/5] w-full transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">
          {item.selectionReason}
        </p>
        <h3 className="mt-1 font-semibold leading-snug text-white line-clamp-2">{item.title}</h3>
        <p className="mt-1 text-xs text-white/70">
          {item.authors[0]}
          {item.authors.length > 1 ? " et al." : ""} &middot; {item.publishedAt.slice(0, 10)}
        </p>
      </div>
    </button>
  );
}

function MarqueeColumn({
  items,
  speedMultiplier,
  direction,
  globalVelocityRef,
  onOpen,
  className = "",
}: {
  items: BriefItemView[];
  speedMultiplier: number;
  direction: number;
  globalVelocityRef: React.MutableRefObject<number>;
  onOpen: (item: BriefItemView) => void;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const [setHeight, setSetHeight] = useState(0);

  const repeated = useMemo(() => {
    if (items.length === 0) return [];
    const minCount = 10;
    const reps = Math.max(2, Math.ceil(minCount / items.length));
    return Array.from({ length: reps }, () => items).flat();
  }, [items]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (setRef.current) setSetHeight(setRef.current.offsetHeight);
    });
    return () => cancelAnimationFrame(id);
  }, [repeated]);

  useEffect(() => {
    if (setHeight === 0) return;
    let raf: number;
    let last = performance.now();

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!pausedRef.current) {
        const speed = (BASE_SPEED * direction + globalVelocityRef.current) * speedMultiplier;
        offsetRef.current += speed * dt;
        let off = offsetRef.current % setHeight;
        if (off < 0) off += setHeight;
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(0, -${off}px, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHeight, speedMultiplier, direction]);

  if (items.length === 0) return <div className={`flex-1 ${className}`} />;

  return (
    <div
      className={`h-full flex-1 overflow-hidden ${className}`}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div ref={trackRef} className="will-change-transform">
        <div ref={setRef}>
          {repeated.map((item, i) => (
            <MiniCard key={`a-${i}`} item={item} onOpen={() => onOpen(item)} />
          ))}
        </div>
        <div aria-hidden="true">
          {repeated.map((item, i) => (
            <MiniCard key={`b-${i}`} item={item} onOpen={() => onOpen(item)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PaperMarquee({
  items,
  onOpen,
}: {
  items: BriefItemView[];
  onOpen: (item: BriefItemView) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const velocityRef = useRef(0);

  const columns = useMemo(() => distribute(items, COLUMN_COUNT), [items]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      velocityRef.current += e.deltaY * WHEEL_SENSITIVITY;
      velocityRef.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocityRef.current));
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    let raf: number;
    function decay() {
      velocityRef.current *= VELOCITY_FRICTION;
      raf = requestAnimationFrame(decay);
    }
    raf = requestAnimationFrame(decay);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-400 dark:text-neutral-600">
        Nothing significant surfaced this week in this domain.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-[70vh] min-h-[420px] gap-4 overscroll-contain rounded-2xl bg-slate-100/50 p-4 dark:bg-neutral-900/50"
    >
      {columns.map((col, i) => (
        <MarqueeColumn
          key={i}
          items={col}
          speedMultiplier={SPEED_MULTIPLIERS[i % SPEED_MULTIPLIERS.length]}
          direction={i % 2 === 0 ? 1 : -1}
          globalVelocityRef={velocityRef}
          onOpen={onOpen}
          className={i === 1 ? "hidden sm:block" : i === 2 ? "hidden lg:block" : ""}
        />
      ))}
    </div>
  );
}
