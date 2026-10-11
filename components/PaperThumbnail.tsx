const PALETTES = [
  ["#0ea5e9", "#22c55e"],
  ["#a855f7", "#ec4899"],
  ["#f97316", "#eab308"],
  ["#22c55e", "#14b8a6"],
  ["#ef4444", "#f97316"],
  ["#6366f1", "#06b6d4"],
  ["#14b8a6", "#0ea5e9"],
  ["#ec4899", "#a855f7"],
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function PaperThumbnail({
  seed,
  score,
  domainName,
}: {
  seed: string;
  score: number;
  domainName: string;
}) {
  const [from, to] = PALETTES[hashString(seed) % PALETTES.length];
  const angle = hashString(seed + "angle") % 360;

  return (
    <div
      className="relative flex h-32 w-full items-end overflow-hidden rounded-t"
      style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})` }}
    >
      <span
        className="pointer-events-none absolute -right-2 -top-4 select-none font-bold text-white/25"
        style={{ fontSize: "5.5rem", lineHeight: 1 }}
      >
        {score}
      </span>
      <span className="relative z-10 m-2 rounded bg-black/25 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
        {domainName}
      </span>
    </div>
  );
}
