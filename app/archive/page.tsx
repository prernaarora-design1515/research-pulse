import Link from "next/link";
import { listBriefs } from "@/lib/db/briefQueries";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const briefs = await listBriefs();

  if (briefs.length === 0) {
    return (
      <EmptyState title="No briefs yet">
        Past weekly briefs will be listed here once the pipeline has run at least once.
      </EmptyState>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-neutral-100">
        Archive
      </h1>
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {briefs.map((b, i) => (
          <Link
            key={b.id}
            href={`/archive/${b.id}`}
            className="animate-fade-in-up flex items-center justify-between p-5 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/60"
            style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-neutral-100">
                Week of {b.weekStart}
              </p>
              <p className="text-xs text-slate-500 dark:text-neutral-500">
                {b.papersScanned} papers scanned &middot; {b.status}
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-neutral-600">
              {b.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
