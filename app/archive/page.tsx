import Link from "next/link";
import { listBriefs } from "@/lib/db/briefQueries";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";

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
      <h1 className="font-display text-4xl font-black italic tracking-tight text-slate-900 dark:text-neutral-100">
        Archive
      </h1>
      <div className="divide-y divide-slate-200 border-2 border-slate-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {briefs.map((b, i) => (
          <Reveal key={b.id} delay={Math.min(i, 10) * 40}>
            <Link
              href={`/archive/${b.id}`}
              className="group flex items-center gap-5 p-5 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/60"
            >
              <span className="font-display text-3xl font-black italic text-slate-200 transition-colors group-hover:text-accent dark:text-neutral-800">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg italic text-slate-900 dark:text-neutral-100">
                  Week of {b.weekStart}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-neutral-500">
                  {b.papersScanned} papers scanned &middot; {b.status}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400 dark:text-neutral-600">
                {b.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
