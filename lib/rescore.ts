import { and, eq } from "drizzle-orm";
import { db } from "./db/client";
import { briefItems, papers, domains } from "./db/schema";
import { scorePapers } from "./gemini";
import type { ScoredPaper } from "./prefilter";

export type RescoreResult = { scored: number; remaining: number; errors: string[] };

/**
 * Scores the papers in a brief that the AI never got to (score 0, usually
 * because Gemini's quota ran out mid-run). Re-running the whole pipeline
 * wouldn't help: it deliberately skips papers already shown in a brief.
 */
export async function rescoreUnscored(briefId: number): Promise<RescoreResult> {
  const rows = await db
    .select({
      itemId: briefItems.id,
      domainId: briefItems.domainId,
      priority: briefItems.priority,
      arxivId: papers.arxivId,
      title: papers.title,
      authors: papers.authors,
      abstract: papers.abstract,
      url: papers.url,
      publishedAt: papers.publishedAt,
    })
    .from(briefItems)
    .innerJoin(papers, eq(briefItems.paperId, papers.id))
    .where(and(eq(briefItems.briefId, briefId), eq(briefItems.significanceScore, 0)));

  if (rows.length === 0) return { scored: 0, remaining: 0, errors: [] };

  const candidates: ScoredPaper[] = rows.map((r) => ({
    arxivId: r.arxivId,
    title: r.title,
    authors: r.authors,
    abstract: r.abstract,
    url: r.url,
    publishedAt: r.publishedAt,
    domainId: r.domainId,
    domainName: "",
    relevanceScore: 0,
  }));

  const { verdicts, batchErrors } = await scorePapers(candidates);

  let scored = 0;
  for (const r of rows) {
    const v = verdicts.get(r.arxivId);
    if (!v) continue;
    await db
      .update(briefItems)
      .set({
        significanceScore: v.significance_score,
        selectionReason: v.selection_reason,
        summary: v.summary,
        whyItMatters: v.why_it_matters,
        // "medium" is the fallback the pipeline writes for unscored papers;
        // anything else was set by Kavita and stays hers.
        ...(r.priority === "medium" ? { priority: v.priority } : {}),
      })
      .where(eq(briefItems.id, r.itemId));
    scored++;
  }

  // Domains that had nothing AI-selected now get their top picks marked.
  const activeDomains = await db.select({ id: domains.id, papersToShow: domains.papersToShow }).from(domains);
  for (const d of activeDomains) {
    const items = await db
      .select({ id: briefItems.id, score: briefItems.significanceScore, selected: briefItems.isSelected })
      .from(briefItems)
      .where(and(eq(briefItems.briefId, briefId), eq(briefItems.domainId, d.id)));
    if (items.length === 0 || items.some((i) => i.selected)) continue;
    const top = items
      .filter((i) => i.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, d.papersToShow);
    for (const t of top) {
      await db.update(briefItems).set({ isSelected: true }).where(eq(briefItems.id, t.id));
    }
  }

  return { scored, remaining: rows.length - scored, errors: batchErrors };
}
