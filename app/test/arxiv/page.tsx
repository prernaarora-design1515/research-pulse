import { db } from "@/lib/db/client";
import { domains } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { fetchArxivPapersForDomain, sleep, ARXIV_REQUEST_DELAY_MS } from "@/lib/arxiv";
import { isAuthenticated } from "@/lib/auth";
import LoginForm from "@/app/settings/LoginForm";

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
  if (!(await isAuthenticated())) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="mb-2 text-2xl font-semibold">Admin login required</h1>
        <p className="mb-6 text-sm text-slate-600">
          This page calls the live arXiv API on every load, so it&apos;s gated behind the
          admin password like other operations that hit external services.
        </p>
        <LoginForm />
      </div>
    );
  }

  const results = await loadAllDomains();
  const totalPapers = results.reduce((sum, r) => sum + (r.papers?.length ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">arXiv live data test</h1>
        <p className="mt-1 text-sm text-slate-600">
          Proves the pipeline pulls real, current papers per domain from the arXiv API
          (last 7 days). Fetched {totalPapers} papers across {results.length} active
          domains just now.
        </p>
      </div>

      {results.map((r) => (
        <section key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-medium">{r.name}</h2>
          <p className="mb-3 text-xs text-slate-500">
            Categories: {r.categories.join(", ")} &middot; Keywords: {r.keywords.join(", ")}
          </p>

          {r.error && (
            <p className="text-sm text-red-600">Failed to fetch: {r.error}</p>
          )}

          {!r.error && r.papers && r.papers.length === 0 && (
            <p className="text-sm text-slate-500">No papers found in the last 7 days.</p>
          )}

          {!r.error && r.papers && r.papers.length > 0 && (
            <ul className="space-y-3">
              {r.papers.map((p) => (
                <li key={p.arxivId} className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {p.title}
                  </a>
                  <p className="text-xs text-slate-500">
                    {p.authors.slice(0, 4).join(", ")}
                    {p.authors.length > 4 ? " et al." : ""} &middot;{" "}
                    {p.publishedAt.toISOString().slice(0, 10)}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
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
