import type { BriefDetail } from "@/lib/db/briefQueries";
import FilteredOutList from "./FilteredOutList";
import PaperCard from "./PaperCard";

export default function BriefView({
  brief,
  allTags,
}: {
  brief: BriefDetail;
  allTags: string[];
}) {
  const totalShown = brief.domains.reduce((sum, d) => sum + d.selected.length, 0);

  return (
    <div className="space-y-10">
      <div className="animate-fade-in-up">
        <p className="mb-1 text-xs text-accent">{"// brief"}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
          week of {brief.weekStart}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-neutral-500">
          {brief.papersScanned} scanned &middot; {totalShown} surfaced &middot;{" "}
          {brief.domains.length} domains
        </p>
      </div>

      {brief.domains.map((domain, domainIndex) => (
        <section
          key={domain.domainId}
          className="animate-fade-in-up space-y-3"
          style={{ animationDelay: `${Math.min(domainIndex, 6) * 60}ms` }}
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
              {domain.domainName}
            </h2>
            <span className="text-xs text-slate-400 dark:text-neutral-600">
              {domain.scanned} scanned, {domain.selected.length} shown
            </span>
          </div>

          {domain.selected.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-neutral-600">nothing significant this week.</p>
          ) : (
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
              {domain.selected.map((item, i) => (
                <PaperCard
                  key={item.paperId}
                  item={item}
                  domainName={domain.domainName}
                  allTags={allTags}
                  index={i}
                />
              ))}
            </div>
          )}

          <FilteredOutList items={domain.filteredOut} />
        </section>
      ))}
    </div>
  );
}
