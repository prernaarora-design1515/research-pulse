import type { FetchedPaper } from "./arxiv";

export type DomainWithPapers = {
  domainId: number;
  domainName: string;
  keywords: string[];
  papers: FetchedPaper[];
};

export type ScoredPaper = FetchedPaper & {
  domainId: number;
  domainName: string;
  relevanceScore: number;
  hfUpvotes?: number;
};

function keywordRelevance(paper: FetchedPaper, keywords: string[]): number {
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
  return keywords.reduce(
    (score, kw) => (text.includes(kw.toLowerCase()) ? score + 1 : score),
    0
  );
}

/**
 * Cross-domain dedup: if the same arxivId was fetched for multiple domains,
 * keep it only in the domain where it scores highest on keyword relevance.
 * Also drops any paper whose arxivId was already shown in a previous brief.
 */
export function dedupeAndAssignBestDomain(
  domainResults: DomainWithPapers[],
  alreadyShownArxivIds: Set<string>,
  hfUpvotesByArxivId: Map<string, number>
): { scoredByDomain: Map<number, ScoredPaper[]>; totalScannedByDomain: Map<number, number> } {
  const bestForPaper = new Map<string, ScoredPaper>();
  const totalScannedByDomain = new Map<number, number>();

  for (const { domainId, domainName, keywords, papers } of domainResults) {
    totalScannedByDomain.set(domainId, papers.length);

    for (const paper of papers) {
      if (alreadyShownArxivIds.has(paper.arxivId)) continue;

      const relevanceScore = keywordRelevance(paper, keywords);
      const hfUpvotes = hfUpvotesByArxivId.get(paper.arxivId);
      const candidate: ScoredPaper = {
        ...paper,
        domainId,
        domainName,
        relevanceScore,
        hfUpvotes,
      };

      const existing = bestForPaper.get(paper.arxivId);
      if (!existing || candidate.relevanceScore > existing.relevanceScore) {
        bestForPaper.set(paper.arxivId, candidate);
      }
    }
  }

  const scoredByDomain = new Map<number, ScoredPaper[]>();
  for (const paper of bestForPaper.values()) {
    const list = scoredByDomain.get(paper.domainId) ?? [];
    list.push(paper);
    scoredByDomain.set(paper.domainId, list);
  }

  return { scoredByDomain, totalScannedByDomain };
}

/**
 * Caps candidates per domain to keep Gemini calls and function time bounded.
 * Ranks by keyword relevance first, then Hugging Face upvotes as a tiebreaker.
 */
export function capCandidatesPerDomain(
  scoredByDomain: Map<number, ScoredPaper[]>,
  cap = 25
): Map<number, ScoredPaper[]> {
  const capped = new Map<number, ScoredPaper[]>();
  for (const [domainId, papers] of scoredByDomain) {
    const sorted = [...papers].sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
      return (b.hfUpvotes ?? 0) - (a.hfUpvotes ?? 0);
    });
    capped.set(domainId, sorted.slice(0, cap));
  }
  return capped;
}
