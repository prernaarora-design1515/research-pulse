import type { BriefDetail, BriefItemView } from "@/lib/db/briefQueries";
import FilteredOutList from "./FilteredOutList";
import BookmarkButton from "./BookmarkButton";

const suggestionStyles: Record<string, string> = {
  read: "bg-blue-100 text-blue-800",
  flag_for_client: "bg-amber-100 text-amber-800",
  skip: "bg-slate-100 text-slate-600",
};

const suggestionLabel: Record<string, string> = {
  read: "Read",
  flag_for_client: "Flag for client",
  skip: "Skip",
};

function PaperCard({ item }: { item: BriefItemView }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-slate-900 hover:underline"
        >
          {item.title}
        </a>
        <div className="flex shrink-0 items-center gap-2">
          <BookmarkButton paperId={item.paperId} initialBookmarked={item.isBookmarked} />
          <span
            className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${
              suggestionStyles[item.suggestion] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {suggestionLabel[item.suggestion] ?? item.suggestion}
          </span>
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {item.authors.slice(0, 4).join(", ")}
        {item.authors.length > 4 ? " et al." : ""} &middot;{" "}
        {item.publishedAt.slice(0, 10)}
        {item.hfUpvotes != null && <> &middot; {item.hfUpvotes} HF upvotes</>}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {item.selectionReason} &middot; score {item.significanceScore}/10
      </p>
      <p className="mt-2 text-sm text-slate-700">{item.summary}</p>
      <p className="mt-2 text-sm text-slate-600">
        <span className="font-medium">Why it matters: </span>
        {item.whyItMatters}
      </p>
    </div>
  );
}

export default function BriefView({ brief }: { brief: BriefDetail }) {
  const totalShown = brief.domains.reduce((sum, d) => sum + d.selected.length, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Week of {brief.weekStart}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {brief.papersScanned} papers scanned &middot; {totalShown} surfaced as significant
          across {brief.domains.length} domains. Readable in under 10 minutes.
        </p>
      </div>

      {brief.domains.map((domain) => (
        <section key={domain.domainId} className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{domain.domainName}</h2>
            <span className="text-xs text-slate-500">
              {domain.scanned} scanned, {domain.selected.length} shown
            </span>
          </div>

          {domain.selected.length === 0 && (
            <p className="text-sm text-slate-500">
              Nothing significant surfaced this week in this domain.
            </p>
          )}

          <div className="space-y-3">
            {domain.selected.map((item) => (
              <PaperCard key={item.paperId} item={item} />
            ))}
          </div>

          <FilteredOutList items={domain.filteredOut} />
        </section>
      ))}
    </div>
  );
}
