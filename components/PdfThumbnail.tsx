"use client";

import { useEffect, useRef, useState } from "react";

// Renders the real first page of the paper's PDF as a thumbnail — the actual
// paper, not a stand-in graphic. arXiv's PDF endpoint sends CORS headers, so
// this runs entirely client-side with no backend involvement.

const cache = new Map<string, string>(); // pdfUrl -> data URL
const inflight = new Map<string, Promise<string>>();

let activeRenders = 0;
const MAX_CONCURRENT = 3;
const queue: (() => void)[] = [];

function runWithLimit<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const run = () => {
      activeRenders++;
      fn()
        .then(resolve, reject)
        .finally(() => {
          activeRenders--;
          const next = queue.shift();
          if (next) next();
        });
    };
    if (activeRenders < MAX_CONCURRENT) run();
    else queue.push(run);
  });
}

async function renderFirstPage(pdfUrl: string): Promise<string> {
  const cached = cache.get(pdfUrl);
  if (cached) return cached;

  const existing = inflight.get(pdfUrl);
  if (existing) return existing;

  const promise = runWithLimit(async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const page = await pdf.getPage(1);
    const unscaled = page.getViewport({ scale: 1 });
    const targetWidth = 500;
    const scale = targetWidth / unscaled.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not supported");

    await page.render({ canvasContext: context, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    cache.set(pdfUrl, dataUrl);
    return dataUrl;
  });

  inflight.set(pdfUrl, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(pdfUrl);
  }
}

export default function PdfThumbnail({
  pdfUrl,
  alt,
  className = "",
}: {
  pdfUrl: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(cache.get(pdfUrl) ?? null);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (src) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  useEffect(() => {
    if (!visible || src || failed) return;
    let cancelled = false;
    renderFirstPage(pdfUrl)
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, pdfUrl, src, failed]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-100 dark:bg-neutral-900 ${className}`}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      )}
      {!src && !failed && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 to-slate-100 dark:from-neutral-800 dark:to-neutral-900" />
      )}
      {!src && failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300 dark:bg-neutral-900 dark:text-neutral-700">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
            <path d="M15 2v5h5" />
          </svg>
        </div>
      )}
    </div>
  );
}
