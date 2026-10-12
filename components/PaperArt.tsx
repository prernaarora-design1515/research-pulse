// Drawn entirely in code: the paper's own initials, set huge in outlined
// grotesk and repeated like a type specimen, on a dark lab panel.
function initialsFrom(text: string): string {
  const words = text
    .replace(/[^A-Za-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w.length > 2);
  return (words.slice(0, 3).map((w) => w[0]).join("") || "RP").toUpperCase();
}

export default function PaperArt({
  seed,
  alt,
  className = "",
}: {
  seed: string | number;
  alt: string;
  className?: string;
}) {
  const word = initialsFrom(alt);
  const fileNo = String(seed).replace(/\D/g, "").padStart(4, "0").slice(-4);
  const rows = [0, 1, 2, 3, 4];

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden rounded-2xl bg-[#141816] ${className}`}
    >
      <svg
        viewBox="0 0 300 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {rows.map((r) => (
          <text
            key={r}
            x="150"
            y={70 + r * 62}
            textAnchor="middle"
            fontFamily="var(--font-display), Helvetica, Arial, sans-serif"
            fontWeight="800"
            fontSize="92"
            letterSpacing="-4"
            fill={r === 2 ? "#f1f1f1" : "none"}
            stroke="#f1f1f1"
            strokeWidth="1.1"
            opacity={r === 2 ? 1 : 0.45 - Math.abs(r - 2) * 0.1}
          >
            {word}
          </text>
        ))}
      </svg>
      <span className="absolute left-3 top-2.5 font-mono text-[9px] uppercase tracking-wider text-[#f1f1f1]/60">
        ({fileNo})
      </span>
    </div>
  );
}
