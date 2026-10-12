const DOT_CLASS: Record<string, string> = {
  high: "bg-accent",
  medium: "bg-amber-500",
  low: "bg-slate-400 dark:bg-neutral-600",
};

export default function PriorityBadge({
  priority,
  className = "",
}: {
  priority: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${className}`}
      title={`${priority} priority`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[priority] ?? DOT_CLASS.low}`} />
      {priority}
    </span>
  );
}
