import { parseStringPromise } from "xml2js";

const ARXIV_API_URL = "http://export.arxiv.org/api/query";
// arXiv etiquette: ~1 request every 3 seconds
export const ARXIV_REQUEST_DELAY_MS = 3000;

export type FetchedPaper = {
  arxivId: string;
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  publishedAt: Date;
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSearchQuery(categories: string[], keywords: string[]) {
  const catClause = categories.map((c) => `cat:${c}`).join(" OR ");
  const kwClause = keywords
    .map((k) => `abs:"${k.replace(/"/g, "")}"`)
    .join(" OR ");
  return `(${catClause}) AND (${kwClause})`;
}

function extractArxivId(rawId: string): string {
  // rawId looks like "http://arxiv.org/abs/2502.12345v2"
  const match = rawId.match(/abs\/([^/]+)$/);
  const idWithVersion = match ? match[1] : rawId;
  return idWithVersion.replace(/v\d+$/, "");
}

type ArxivAuthor = { name?: string[] };
type ArxivEntry = {
  id?: string[];
  title?: string[];
  summary?: string[];
  published?: string[];
  author?: ArxivAuthor[];
};
type ArxivFeed = { feed?: { entry?: ArxivEntry[] } };

function parseEntries(parsed: ArxivFeed): FetchedPaper[] {
  const entries = parsed?.feed?.entry;
  if (!entries || !Array.isArray(entries)) return [];

  return entries
    .map((entry): FetchedPaper | null => {
      const rawId = entry.id?.[0];
      const title = entry.title?.[0];
      const abstract = entry.summary?.[0];
      const published = entry.published?.[0];
      if (!rawId || !title || !abstract || !published) return null;

      const authors = (entry.author ?? [])
        .map((a) => a.name?.[0])
        .filter((n): n is string => Boolean(n));

      const arxivId = extractArxivId(rawId);

      return {
        arxivId,
        title: title.replace(/\s+/g, " ").trim(),
        authors,
        abstract: abstract.replace(/\s+/g, " ").trim(),
        url: `https://arxiv.org/abs/${arxivId}`,
        publishedAt: new Date(published),
      };
    })
    .filter((p): p is FetchedPaper => p !== null);
}

/**
 * Fetches recent papers from arXiv for a single domain. Caller is responsible
 * for spacing calls ~3s apart to respect arXiv's rate etiquette.
 */
export async function fetchArxivPapersForDomain(
  categories: string[],
  keywords: string[],
  { maxResults = 75, sinceDays = 7 }: { maxResults?: number; sinceDays?: number } = {}
): Promise<FetchedPaper[]> {
  const searchQuery = buildSearchQuery(categories, keywords);
  const params = new URLSearchParams({
    search_query: searchQuery,
    sortBy: "submittedDate",
    sortOrder: "descending",
    start: "0",
    max_results: String(maxResults),
  });

  const res = await fetch(`${ARXIV_API_URL}?${params.toString()}`, {
    headers: { "User-Agent": "ResearchPulse/1.0 (weekly research brief tool)" },
  });

  if (!res.ok) {
    throw new Error(`arXiv API returned ${res.status}: ${res.statusText}`);
  }

  const xml = await res.text();
  const parsed: ArxivFeed = await parseStringPromise(xml);
  const papers = parseEntries(parsed);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - sinceDays);

  return papers.filter((p) => p.publishedAt >= cutoff);
}
