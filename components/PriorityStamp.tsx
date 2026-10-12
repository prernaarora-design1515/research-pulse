import { Circled } from "./Motion";

export default function PriorityStamp({
  priority,
  className = "",
}: {
  priority: string;
  className?: string;
}) {
  const high = priority === "high";
  const pill = (
    <span
      className={`inline-block select-none rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
        high
          ? "bg-[#f1f1f1] text-[#121212]"
          : "border border-[#f1f1f1]/40 bg-[#141816]/70 text-[#f1f1f1]/80 backdrop-blur-sm"
      }`}
    >
      ({priority})
    </span>
  );

  return (
    <span className={`text-[#f1f1f1] ${className}`}>{high ? <Circled>{pill}</Circled> : pill}</span>
  );
}
