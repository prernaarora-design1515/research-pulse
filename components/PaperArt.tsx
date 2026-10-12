// Deliberately not a photo of any kind -- every pixel here is drawn in code.
// A generic identification silhouette plus a height-ruler edge, styled like
// an old intake/evidence card, with a stamped file number derived from the
// paper's own id so the same paper always gets the same "file".
export default function PaperArt({
  seed,
  alt,
  className = "",
}: {
  seed: string | number;
  alt: string;
  className?: string;
}) {
  const fileNo = String(seed).replace(/\D/g, "").padStart(5, "0").slice(-5);
  const ticks = Array.from({ length: 11 });

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden rounded-2xl bg-[#ece7df] dark:bg-neutral-800 ${className}`}
    >
      <svg
        viewBox="0 0 300 400"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {ticks.map((_, i) => (
          <line
            key={i}
            x1="0"
            x2={i % 5 === 0 ? 18 : 10}
            y1={(i * 400) / 10}
            y2={(i * 400) / 10}
            className="stroke-slate-400/70 dark:stroke-neutral-500/60"
            strokeWidth="2"
          />
        ))}
        <g transform="translate(160,235)">
          <circle cx="0" cy="-78" r="48" className="fill-slate-400/50 dark:fill-neutral-600/60" />
          <path
            d="M -85 95 Q -85 -10 0 -10 Q 85 -10 85 95 Z"
            className="fill-slate-400/50 dark:fill-neutral-600/60"
          />
        </g>
      </svg>

      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-multiply" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-black/[0.06] px-3 py-1.5 dark:bg-white/[0.06]">
        <span className="font-mono text-[9px] tracking-wider text-slate-600 dark:text-neutral-400">
          FILE Nº {fileNo}
        </span>
      </div>
    </div>
  );
}
