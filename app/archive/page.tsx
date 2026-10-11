import Link from "next/link";
import { listBriefs } from "@/lib/db/briefQueries";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const briefs = await listBriefs();

  if (briefs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        <h1 className="mb-2 text-xl font-semibold text-slate-700">No briefs yet</h1>
        <p>Past weekly briefs will be listed here once the pipeline has run at least once.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Archive</h1>
      <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {briefs.map((b) => (
          <Link
            key={b.id}
            href={`/archive/${b.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <div>
              <p className="font-medium text-slate-900">Week of {b.weekStart}</p>
              <p className="text-xs text-slate-500">
                {b.papersScanned} papers scanned &middot; {b.status}
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {b.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
