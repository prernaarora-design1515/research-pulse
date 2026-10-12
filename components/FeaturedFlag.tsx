"use client";

import { useEffect, useRef, useState } from "react";
import type { BriefItemView } from "@/lib/db/briefQueries";

type Featured = BriefItemView & { domainName: string };

/**
 * The week's featured paper, printed on a sheet of paper hung in a dark
 * band and waving like a flag. The wave is an SVG displacement map whose
 * noise frequency is animated, so the whole sheet -- edges and type --
 * ripples together. The sheet unfurls from its top edge as it scrolls
 * into view, tied to scroll position.
 */
export default function FeaturedFlag({ item }: { item: Featured }) {
  const [animate, setAnimate] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnimate(!reduced);
    const el = sheetRef.current;
    if (!el || reduced) return;

    function update() {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the sheet's top edge enters the bottom of the viewport,
      // 1 once it has risen to ~35% from the top.
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.65)));
      const e = 1 - Math.pow(1 - p, 3);
      el.style.transform = `perspective(1400px) rotateX(${(1 - e) * -78}deg) translateY(${(1 - e) * -40}px) scale(${0.9 + e * 0.1})`;
      el.style.opacity = String(Math.min(1, e * 1.4));
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const lead = item.authors[0] + (item.authors.length > 1 ? " et al." : "");
  const lines = [
    item.domainName,
    lead,
    `Filed ${item.publishedAt.slice(0, 10)}`,
    `Priority ${item.priority}`,
    item.selectionReason,
  ];

  return (
    <section className="relative left-1/2 my-20 w-screen -translate-x-1/2 bg-[#141816] py-20 text-[#f1f1f1]">
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <filter id="flag-wave" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.011" numOctaves="2" seed="7" result="wave">
              {animate && (
                <animate
                  attributeName="baseFrequency"
                  dur="7s"
                  values="0.0035 0.011; 0.0045 0.016; 0.003 0.009; 0.0035 0.011"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="wave" scale="14" />
          </filter>
        </defs>
      </svg>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <p className="font-mono text-[12px] uppercase text-[#f1f1f1]/60">(Featured) This week&rsquo;s pick</p>
          <p className="font-hand text-2xl text-[#f1f1f1]/80 float" style={{ ["--r" as string]: "-3deg" }}>
            if you read one thing &darr;
          </p>
        </div>

        <div ref={sheetRef} className="origin-top will-change-transform">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="group block origin-top transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-rotate-[0.6deg] hover:scale-[1.01]"
        >
          <div
            style={{ filter: "url(#flag-wave)" }}
            className="mx-auto max-w-5xl bg-[#f9f9f9] px-6 pb-14 pt-10 text-[#121212] sm:px-14"
          >
            <h2 className="font-display text-3xl font-bold uppercase leading-[0.95] tracking-[-0.03em] sm:text-5xl">
              {item.title}
            </h2>

            <ul className="mt-8 space-y-1">
              {lines.map((line, i) => (
                <li
                  key={i}
                  className="font-display text-2xl font-semibold capitalize leading-tight tracking-[-0.02em] sm:text-4xl"
                >
                  {line}
                  <sup className="ml-1.5 align-super font-mono text-[11px] font-normal">({i + 1})</sup>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t-2 border-dotted border-[#121212]/70" />

            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[#121212]/75">{item.whyItMatters}</p>
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-[12px] uppercase">
              Read on arXiv
              <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </p>
          </div>
        </a>
        </div>
      </div>
    </section>
  );
}
