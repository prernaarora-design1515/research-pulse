export default function PriorityStamp({
  priority,
  className = "",
}: {
  priority: string;
  className?: string;
}) {
  const high = priority === "high";
  return (
    <span
      className={`select-none rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
        high
          ? "bg-[#f1f1f1] text-[#121212]"
          : "border border-[#f1f1f1]/40 bg-[#141816]/70 text-[#f1f1f1]/80 backdrop-blur-sm"
      } ${className}`}
    >
      ({priority})
    </span>
  );
}
