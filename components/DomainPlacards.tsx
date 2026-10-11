"use client";

export type PlacardDomain = {
  domainId: number;
  domainName: string;
  count: number;
};

export default function DomainPlacards({
  domains,
  activeId,
  onSelect,
}: {
  domains: PlacardDomain[];
  activeId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8">
      {domains.map((d) => {
        const active = d.domainId === activeId;
        return (
          <button
            key={d.domainId}
            onClick={() => onSelect(d.domainId)}
            className={`group flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
              active
                ? "border-slate-900 bg-slate-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-100"
            }`}
          >
            {d.domainName}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                active
                  ? "bg-white/20"
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-500"
              }`}
            >
              {d.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
