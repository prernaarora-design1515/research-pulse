import { eq } from "drizzle-orm";
import { db } from "./db/client";
import { domains, briefs, papers, briefItems } from "./db/schema";
import { fetchArxivPapersForDomain, sleep, ARXIV_REQUEST_DELAY_MS } from "./arxiv";
import { fetchHuggingFaceUpvotes } from "./huggingface";
import { dedupeAndAssignBestDomain, capCandidatesPerDomain, type ScoredPaper } from "./prefilter";
import { scorePapers, type GeminiVerdict } from "./gemini";
import { sendBriefEmail } from "./email";

export type RunSummary = {
  domainsProcessed: number;
  papersScanned: number;
  papersSelected: number;
  domainScanned: Record<number, number>;
  errors: { domain: string; message: string }[];
};

function weekStartISO(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diffToMonday);
  return monday.toISOString().slice(0, 10);
}

async function getAlreadyShownArxivIds(): Promise<Set<string>> {
  const rows = await db
    .selectDistinct({ arxivId: papers.arxivId })
    .from(papers)
    .innerJoin(briefItems, eq(briefItems.paperId, papers.id));
  return new Set(rows.map((r) => r.arxivId));
}

async function upsertPaper(paper: ScoredPaper): Promise<number> {
  const [row] = await db
    .insert(papers)
    .values({
      arxivId: paper.arxivId,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      url: paper.url,
      publishedAt: paper.publishedAt,
      hfUpvotes: paper.hfUpvotes ?? null,
    })
    .onConflictDoUpdate({
      target: papers.arxivId,
      set: { hfUpvotes: paper.hfUpvotes ?? null },
    })
    .returning({ id: papers.id });
  return row.id;
}

export async function runBriefPipeline(): Promise<RunSummary> {
  const summary: RunSummary = {
    domainsProcessed: 0,
    papersScanned: 0,
    papersSelected: 0,
    domainScanned: {},
    errors: [],
  };

  const activeDomains = await db
    .select()
    .from(domains)
    .where(eq(domains.isActive, true))
    .orderBy(domains.id);

  const [brief] = await db
    .insert(briefs)
    .values({ weekStart: weekStartISO(), status: "running" })
    .returning();

  const alreadyShown = await getAlreadyShownArxivIds();
  const hfUpvotes = await fetchHuggingFaceUpvotes().catch(() => new Map<string, number>());

  const domainResults: {
    domainId: number;
    domainName: string;
    keywords: string[];
    papers: Awaited<ReturnType<typeof fetchArxivPapersForDomain>>;
  }[] = [];

  for (let i = 0; i < activeDomains.length; i++) {
    const d = activeDomains[i];
    try {
      const fetched = await fetchArxivPapersForDomain(d.arxivCategories, d.keywords);
      domainResults.push({
        domainId: d.id,
        domainName: d.name,
        keywords: d.keywords,
        papers: fetched,
      });
      summary.domainsProcessed += 1;
    } catch (err) {
      summary.errors.push({
        domain: d.name,
        message: err instanceof Error ? err.message : "Failed to fetch papers",
      });
    }
    if (i < activeDomains.length - 1) await sleep(ARXIV_REQUEST_DELAY_MS);
  }

  const { scoredByDomain, totalScannedByDomain } = dedupeAndAssignBestDomain(
    domainResults,
    alreadyShown,
    hfUpvotes
  );
  // Capped lower than before (was 25) so a full 8-domain run stays well
  // under Gemini's free-tier 20 requests/day quota: 8 x 20 candidates / 20
  // per batch = 8 requests, leaving headroom for manual re-runs the same day.
  const cappedByDomain = capCandidatesPerDomain(scoredByDomain, 20);

  for (const [domainId, scanned] of totalScannedByDomain) {
    summary.papersScanned += scanned;
    summary.domainScanned[domainId] = scanned;
  }

  const allCandidates: ScoredPaper[] = [];
  for (const list of cappedByDomain.values()) allCandidates.push(...list);

  let verdicts = new Map<string, GeminiVerdict>();
  try {
    const result = await scorePapers(allCandidates);
    verdicts = result.verdicts;
    for (const message of result.batchErrors) {
      summary.errors.push({ domain: "gemini", message });
    }
  } catch (err) {
    summary.errors.push({
      domain: "gemini",
      message: err instanceof Error ? err.message : "AI scoring failed",
    });
  }

  for (const d of activeDomains) {
    const candidates = cappedByDomain.get(d.id) ?? [];
    const judged = candidates
      .map((c) => ({ candidate: c, verdict: verdicts.get(c.arxivId) }))
      .filter(
        (x): x is { candidate: ScoredPaper; verdict: GeminiVerdict } => x.verdict !== undefined
      );
    const unjudged = candidates.filter((c) => !verdicts.has(c.arxivId));

    judged.sort((a, b) => b.verdict.significance_score - a.verdict.significance_score);

    const selectedCount = d.papersToShow;

    for (let i = 0; i < judged.length; i++) {
      const { candidate, verdict } = judged[i];
      const paperId = await upsertPaper(candidate);
      const isSelected = i < selectedCount;

      await db.insert(briefItems).values({
        briefId: brief.id,
        paperId,
        domainId: d.id,
        significanceScore: verdict.significance_score,
        selectionReason: verdict.selection_reason,
        summary: verdict.summary,
        whyItMatters: verdict.why_it_matters,
        priority: verdict.priority,
        isSelected,
      });

      if (isSelected) summary.papersSelected += 1;
    }

    // Candidates the AI never got to (e.g. a provider outage) stay visible
    // instead of silently vanishing — "nothing hidden" applies to AI
    // failures too, not just low-significance papers.
    for (const candidate of unjudged) {
      const paperId = await upsertPaper(candidate);
      await db.insert(briefItems).values({
        briefId: brief.id,
        paperId,
        domainId: d.id,
        significanceScore: 0,
        selectionReason: "AI review unavailable",
        summary: candidate.abstract.slice(0, 280) + (candidate.abstract.length > 280 ? "…" : ""),
        whyItMatters:
          "Not yet assessed — the AI provider was unavailable during this run. The abstract above is shown as-is.",
        priority: "medium",
        isSelected: false,
      });
    }
  }

  await db
    .update(briefs)
    .set({
      status: summary.errors.length > 0 ? "completed_with_errors" : "completed",
      papersScanned: summary.papersScanned,
      runSummary: summary,
    })
    .where(eq(briefs.id, brief.id));

  try {
    await sendBriefEmail(brief.id);
  } catch (err) {
    summary.errors.push({
      domain: "email",
      message: err instanceof Error ? err.message : "Failed to send email",
    });
  }

  return summary;
}
