"use client";

export type PlacardDomain = {
  domainId: number;
  domainName: string;
  count: number;
  isUnscored?: boolean;
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
    <div className="-mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="inline-flex gap-1 rounded-full border-2 border-slate-900 bg-white p-1 dark:border-neutral-100 dark:bg-neutral-900">
        {domains.map((d) => {
          const active = d.domainId === activeId;
          return (
            <button
              key={d.domainId}
              onClick={() => onSelect(d.domainId)}
              className={`flex shrink-0 items-baseline gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all ${
                active
                  ? "bg-accent text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-neutral-500 dark:hover:text-neutral-100"
              }`}
            >
              {d.domainName}
              <sup
                className={`text-[10px] font-normal normal-case tracking-normal ${
                  active ? "text-white/80" : "text-slate-400 dark:text-neutral-600"
                }`}
                title={d.isUnscored && d.count > 0 ? "Scanned, not yet AI-scored" : "AI-selected papers"}
              >
                {d.count}
                {d.isUnscored && d.count > 0 ? "*" : ""}
              </sup>
            </button>
          );
        })}
      </div>
    </div>
  );
}
