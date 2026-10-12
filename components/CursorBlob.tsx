"use client";

import { useEffect, useRef, useState } from "react";

const TRAIL_SIZES = [30, 25, 21, 17, 13, 10, 7];
const LEAD_LERP = 0.35;
const FOLLOW_LERP = 0.28;
const BOX = 220; // bounds how much area the blur filter has to repaint each frame

export default function CursorBlob() {
  const [enabled, setEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const target = useRef({ x: -9999, y: -9999 });
  const trail = useRef(TRAIL_SIZES.map(() => ({ x: -9999, y: -9999 })));

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(!coarse && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function onMove(e: MouseEvent) {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    }
    window.addEventListener("mousemove", onMove);

    let raf: number;
    function tick() {
      const pts = trail.current;
      pts[0].x += (target.current.x - pts[0].x) * LEAD_LERP;
      pts[0].y += (target.current.y - pts[0].y) * LEAD_LERP;
      for (let i = 1; i < pts.length; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * FOLLOW_LERP;
        pts[i].y += (pts[i - 1].y - pts[i].y) * FOLLOW_LERP;
      }

      const lead = pts[0];
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${lead.x - BOX / 2}px, ${lead.y - BOX / 2}px)`;
      }
      pts.forEach((p, i) => {
        const el = dotsRef.current[i];
        if (el) {
          const relX = p.x - lead.x + BOX / 2;
          const relY = p.y - lead.y + BOX / 2;
          el.style.transform = `translate(${relX}px, ${relY}px) translate(-50%, -50%)`;
        }
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-30"
      style={{ width: BOX, height: BOX, opacity: 0.55, filter: "url(#ink-goo)" }}
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="ink-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
            />
          </filter>
        </defs>
      </svg>
      {TRAIL_SIZES.map((size, i) => (
        <div
          key={i}
          ref={(el) => {
            dotsRef.current[i] = el;
          }}
          className="absolute rounded-full bg-accent"
          style={{ width: size, height: size, left: 0, top: 0 }}
        />
      ))}
    </div>
  );
}
