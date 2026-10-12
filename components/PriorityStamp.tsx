const LABEL: Record<string, string> = {
  high: "Priority",
  medium: "Routine",
  low: "Low Grade",
};

export default function PriorityStamp({
  priority,
  className = "",
}: {
  priority: string;
  className?: string;
}) {
  const label = LABEL[priority] ?? priority;
  const faint = priority !== "high";

  return (
    <div
      style={{ transform: "rotate(-8deg)" }}
      className={`select-none rounded-lg border-2 px-2 py-1 font-display text-[10px] font-black uppercase tracking-wider ${
        faint
          ? "border-slate-400/60 text-slate-400/80 dark:border-neutral-600/60 dark:text-neutral-600"
          : "border-accent text-accent"
      } bg-white/90 backdrop-blur-sm dark:bg-neutral-900/90 ${className}`}
    >
      {label}
    </div>
  );
}
