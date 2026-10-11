import type { BriefDetail, BriefItemView } from "@/lib/db/briefQueries";
import FilteredOutList from "./FilteredOutList";
import BookmarkButton from "./BookmarkButton";

const suggestionStyles: Record<string, string> = {
  read: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  flag_for_client: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  skip: "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400",
};

const suggestionLabel: Record<string, string> = {
  read: "read",
  flag_for_client: "flag_for_client",
  skip: "skip",
};

function PaperCard({ item, index }: { item: BriefItemView; index: number }) {
  return (
    <div
      className="animate-fade-in-up group rounded border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-slate-900 underline decoration-transparent decoration-2 underline-offset-2 transition-colors hover:decoration-accent dark:text-neutral-100"
        >
          {item.title}
        </a>
        <div className="flex shrink-0 items-center gap-2">
          <BookmarkButton paperId={item.paperId} initialBookmarked={item.isBookmarked} />
          <span
            className={`whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-medium ${
              suggestionStyles[item.suggestion] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {suggestionLabel[item.suggestion] ?? item.suggestion}
          </span>
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
        {item.authors.slice(0, 4).join(", ")}
        {item.authors.length > 4 ? " et al." : ""} &middot;{" "}
        {item.publishedAt.slice(0, 10)}
        {item.hfUpvotes != null && <> &middot; {item.hfUpvotes} hf_upvotes</>}
      </p>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-accent">
        {item.selectionReason} &middot; score {item.significanceScore}/10
      </p>
      <p className="mt-2 text-sm text-slate-700 dark:text-neutral-300">{item.summary}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-neutral-400">
        <span className="font-medium text-slate-800 dark:text-neutral-200">why_it_matters: </span>
        {item.whyItMatters}
      </p>
    </div>
  );
}

export default function BriefView({ brief }: { brief: BriefDetail }) {
  const totalShown = brief.domains.reduce((sum, d) => sum + d.selected.length, 0);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <p className="mb-1 text-xs text-accent">{"// brief"}</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-neutral-100">
          week of {brief.weekStart}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-neutral-400">
          {brief.papersScanned} papers scanned &middot; {totalShown} surfaced as significant
          across {brief.domains.length} domains. readable in under 10 minutes.
        </p>
      </div>

      {brief.domains.map((domain, domainIndex) => (
        <section
          key={domain.domainId}
          className="animate-fade-in-up space-y-3"
          style={{ animationDelay: `${Math.min(domainIndex, 6) * 60}ms` }}
        >
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-1 dark:border-neutral-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-neutral-100">
              {domain.domainName}
            </h2>
            <span className="text-xs text-slate-500 dark:text-neutral-500">
              {domain.scanned} scanned, {domain.selected.length} shown
            </span>
          </div>

          {domain.selected.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-neutral-500">
              nothing significant surfaced this week in this domain.
            </p>
          )}

          <div className="space-y-3">
            {domain.selected.map((item, i) => (
              <PaperCard key={item.paperId} item={item} index={i} />
            ))}
          </div>

          <FilteredOutList items={domain.filteredOut} />
        </section>
      ))}
    </div>
  );
}
