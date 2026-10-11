import { db } from "@/lib/db/client";
import { domains } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { fetchArxivPapersForDomain, sleep, ARXIV_REQUEST_DELAY_MS } from "@/lib/arxiv";

export const dynamic = "force-dynamic";

type DomainResult = {
  id: number;
  name: string;
  categories: string[];
  keywords: string[];
  papers?: Awaited<ReturnType<typeof fetchArxivPapersForDomain>>;
  error?: string;
};

async function loadAllDomains(): Promise<DomainResult[]> {
  const activeDomains = await db
    .select()
    .from(domains)
    .where(eq(domains.isActive, true))
    .orderBy(domains.id);

  const results: DomainResult[] = [];

  for (let i = 0; i < activeDomains.length; i++) {
    const d = activeDomains[i];
    try {
      const papers = await fetchArxivPapersForDomain(d.arxivCategories, d.keywords);
      results.push({
        id: d.id,
        name: d.name,
        categories: d.arxivCategories,
        keywords: d.keywords,
        papers,
      });
    } catch (err) {
      results.push({
        id: d.id,
        name: d.name,
        categories: d.arxivCategories,
        keywords: d.keywords,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
    if (i < activeDomains.length - 1) await sleep(ARXIV_REQUEST_DELAY_MS);
  }

  return results;
}

export default async function ArxivTestPage() {
  const results = await loadAllDomains();
  const totalPapers = results.reduce((sum, r) => sum + (r.papers?.length ?? 0), 0);

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <p className="mb-1 text-xs text-accent">{"// test/arxiv"}</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-neutral-100">
          arxiv live data test
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-neutral-400">
          proves the pipeline pulls real, current papers per domain from the arxiv api
          (last 7 days). fetched {totalPapers} papers across {results.length} active
          domains just now.
        </p>
      </div>

      {results.map((r) => (
        <section
          key={r.id}
          className="rounded border border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2 className="text-lg font-medium text-slate-900 dark:text-neutral-100">{r.name}</h2>
          <p className="mb-3 text-xs text-slate-500 dark:text-neutral-500">
            categories: {r.categories.join(", ")} &middot; keywords: {r.keywords.join(", ")}
          </p>

          {r.error && (
            <p className="text-sm text-red-600 dark:text-red-400">failed to fetch: {r.error}</p>
          )}

          {!r.error && r.papers && r.papers.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-neutral-500">
              no papers found in the last 7 days.
            </p>
          )}

          {!r.error && r.papers && r.papers.length > 0 && (
            <ul className="space-y-3">
              {r.papers.map((p) => (
                <li
                  key={p.arxivId}
                  className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0 dark:border-neutral-800"
                >
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-slate-900 hover:underline dark:text-neutral-100"
                  >
                    {p.title}
                  </a>
                  <p className="text-xs text-slate-500 dark:text-neutral-500">
                    {p.authors.slice(0, 4).join(", ")}
                    {p.authors.length > 4 ? " et al." : ""} &middot;{" "}
                    {p.publishedAt.toISOString().slice(0, 10)}
                  </p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-neutral-300">
                    {p.abstract.slice(0, 220)}
                    {p.abstract.length > 220 ? "..." : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
