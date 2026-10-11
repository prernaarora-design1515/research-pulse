import Link from "next/link";
import { listBriefs } from "@/lib/db/briefQueries";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const briefs = await listBriefs();

  if (briefs.length === 0) {
    return (
      <EmptyState title="no briefs yet">
        past weekly briefs will be listed here once the pipeline has run at least once.
      </EmptyState>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-4">
      <p className="text-xs text-accent">{"// archive"}</p>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-neutral-100">archive</h1>
      <div className="divide-y divide-slate-200 rounded border border-slate-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {briefs.map((b, i) => (
          <Link
            key={b.id}
            href={`/archive/${b.id}`}
            className="animate-fade-in-up flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/60"
            style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-neutral-100">
                week of {b.weekStart}
              </p>
              <p className="text-xs text-slate-500 dark:text-neutral-500">
                {b.papersScanned} papers scanned &middot; {b.status}
              </p>
            </div>
            <span className="text-xs text-slate-400 transition-transform group-hover:translate-x-0.5 dark:text-neutral-600">
              {b.createdAt.toISOString().slice(0, 16).replace("T", " ")} utc
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
