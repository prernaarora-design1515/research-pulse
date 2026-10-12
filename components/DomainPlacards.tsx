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
    <div className="-mx-5 flex gap-7 overflow-x-auto border-b-2 border-slate-900 px-5 pb-0 sm:-mx-8 sm:px-8 dark:border-neutral-100">
      {domains.map((d) => {
        const active = d.domainId === activeId;
        return (
          <button
            key={d.domainId}
            onClick={() => onSelect(d.domainId)}
            className={`group relative -mb-0.5 flex shrink-0 items-baseline gap-1.5 whitespace-nowrap border-b-2 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors ${
              active
                ? "border-accent text-slate-900 dark:text-neutral-100"
                : "border-transparent text-slate-400 hover:text-slate-700 dark:text-neutral-600 dark:hover:text-neutral-300"
            }`}
          >
            {d.domainName}
            <sup
              className={`text-[10px] font-normal normal-case tracking-normal ${
                active ? "text-accent" : "text-slate-400 dark:text-neutral-600"
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
  );
}
