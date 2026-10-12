"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Full-bleed wordmark: measured and sized so it spans the container exactly
 * at any viewport. Letters drop in on load and jiggle on hover.
 */
export function Wordmark({ text }: { text: string }) {
  const boxRef = useRef<HTMLHeadingElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;
    const BASE = 100;
    function fit() {
      if (!box || !inner) return;
      inner.style.fontSize = `${BASE}px`;
      const natural = inner.getBoundingClientRect().width;
      if (natural > 0) inner.style.fontSize = `${(BASE * box.clientWidth * 0.985) / natural}px`;
    }
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  return (
    <h1
      ref={boxRef}
      aria-label={text}
      className="w-full overflow-hidden font-display font-extrabold uppercase leading-[0.8] tracking-[-0.06em] text-[#121212] dark:text-[#f1f1f1]"
    >
      <span ref={innerRef} className="inline-flex whitespace-nowrap pb-[0.04em]" style={{ fontSize: "20vw" }}>
        {text.split("").map((ch, i) => (
          <span key={i} aria-hidden className="jiggle inline-block">
            <span className="letter-in" style={{ animationDelay: `${i * 70}ms` }}>
              {ch}
            </span>
          </span>
        ))}
      </span>
    </h1>
  );
}

/** Endless handwritten ticker; pauses under the cursor. */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee relative -mx-5 overflow-hidden border-y border-dashed border-neutral-300 py-3 sm:-mx-8 dark:border-neutral-700">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap font-hand text-3xl text-neutral-700 dark:text-neutral-300">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="transition-transform duration-300 hover:-rotate-3 hover:scale-110">{t}</span>
            <span aria-hidden className="text-neutral-400">✎</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Pulls its child a little toward the pointer, springs back on leave. */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={ref}
      className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </span>
  );
}

/** Tilts toward the pointer like a sheet of paper being picked up. */
export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ease-out [transform-style:preserve-3d] ${className}`}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) rotate(${px * -1.5}deg)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </div>
  );
}

/** A wobbly pencil underline that draws itself in on hover (or when `on`). */
export function Scribble({ on = false, className = "" }: { on?: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 10"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute -bottom-1.5 left-0 h-2.5 w-full overflow-visible ${className}`}
    >
      <path
        d="M2 6 C 20 2, 40 9, 60 5 S 100 3, 118 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={`pencil-line draw-on-hover ${on ? "is-on" : ""}`}
        style={{ ["--len" as string]: 130 }}
      />
    </svg>
  );
}

/** Hand-drawn loop around its child, drawn in on mount. */
export function Circled({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -inset-x-2 -inset-y-1.5 h-[calc(100%+12px)] w-[calc(100%+16px)] overflow-visible"
      >
        <path
          d="M8 22 C 6 6, 90 2, 94 18 S 40 40, 12 30 S 30 4, 60 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="pencil-line draw-in"
          style={{ ["--len" as string]: 320 }}
        />
      </svg>
    </span>
  );
}
