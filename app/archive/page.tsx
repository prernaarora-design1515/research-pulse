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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {briefs.map((b, i) => (
          <Reveal key={b.id} delay={Math.min(i, 10) * 40}>
            <Link
              href={`/archive/${b.id}`}
              className="group flex h-full items-center gap-5 rounded-2xl bg-slate-50 p-5 transition-colors hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <span className="font-display text-3xl font-black italic text-slate-300 transition-colors group-hover:text-accent dark:text-neutral-700">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg italic text-slate-900 dark:text-neutral-100">
                  Week of {b.weekStart}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-neutral-500">
                  {b.papersScanned} papers scanned &middot; {b.status}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-neutral-600">
                  {b.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
