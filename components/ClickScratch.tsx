"use client";

import { useEffect } from "react";

// Every click leaves a quick burst of pencil scratches at the cursor.
export default function ClickScratch() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const NS = "http://www.w3.org/2000/svg";

    function onClick(e: MouseEvent) {
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("width", "60");
      svg.setAttribute("height", "60");
      svg.setAttribute("viewBox", "-30 -30 60 60");
      svg.setAttribute("class", "scratch pencil-line");
      Object.assign(svg.style, {
        position: "fixed",
        left: `${e.clientX - 30}px`,
        top: `${e.clientY - 30}px`,
        pointerEvents: "none",
        zIndex: "1000",
        color: "var(--graphite)",
      });
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
        const r1 = 8 + Math.random() * 3;
        const r2 = 17 + Math.random() * 7;
        const line = document.createElementNS(NS, "line");
        line.setAttribute("x1", String(Math.cos(a) * r1));
        line.setAttribute("y1", String(Math.sin(a) * r1));
        line.setAttribute("x2", String(Math.cos(a) * r2));
        line.setAttribute("y2", String(Math.sin(a) * r2));
        line.setAttribute("stroke", "currentColor");
        line.setAttribute("stroke-width", "1.6");
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
      }
      document.body.appendChild(svg);
      setTimeout(() => svg.remove(), 560);
    }

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return null;
}
