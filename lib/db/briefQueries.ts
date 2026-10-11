import { desc, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import { briefs, briefItems, papers, domains, bookmarks } from "./schema";
import type { RunSummary } from "../pipeline";

export type BriefItemView = {
  paperId: number;
  title: string;
  authors: string[];
  url: string;
  publishedAt: string;
  hfUpvotes: number | null;
  significanceScore: number;
  selectionReason: string;
  summary: string;
  whyItMatters: string;
  suggestion: string;
  isSelected: boolean;
  isBookmarked: boolean;
};

export type BriefDomainView = {
  domainId: number;
  domainName: string;
  scanned: number;
  selected: BriefItemView[];
  filteredOut: BriefItemView[];
};

export type BriefDetail = {
  id: number;
  weekStart: string;
  createdAt: string;
  status: string;
  papersScanned: number;
  domains: BriefDomainView[];
};

export async function getLatestBriefId(): Promise<number | null> {
  const [row] = await db
    .select({ id: briefs.id })
    .from(briefs)
    .orderBy(desc(briefs.createdAt))
    .limit(1);
  return row?.id ?? null;
}

export async function listBriefs() {
  return db
    .select({
      id: briefs.id,
      weekStart: briefs.weekStart,
      createdAt: briefs.createdAt,
      status: briefs.status,
      papersScanned: briefs.papersScanned,
    })
    .from(briefs)
    .orderBy(desc(briefs.createdAt));
}

export async function getBriefDetail(briefId: number): Promise<BriefDetail | null> {
  const [brief] = await db.select().from(briefs).where(eq(briefs.id, briefId));
  if (!brief) return null;

  const rows = await db
    .select({
      domainId: domains.id,
      domainName: domains.name,
      paperId: papers.id,
      title: papers.title,
      authors: papers.authors,
      url: papers.url,
      publishedAt: papers.publishedAt,
      hfUpvotes: papers.hfUpvotes,
      significanceScore: briefItems.significanceScore,
      selectionReason: briefItems.selectionReason,
      summary: briefItems.summary,
      whyItMatters: briefItems.whyItMatters,
      suggestion: briefItems.suggestion,
      isSelected: briefItems.isSelected,
    })
    .from(briefItems)
    .innerJoin(papers, eq(briefItems.paperId, papers.id))
    .innerJoin(domains, eq(briefItems.domainId, domains.id))
    .where(eq(briefItems.briefId, briefId))
    .orderBy(domains.id, desc(briefItems.significanceScore));

  const paperIds = [...new Set(rows.map((r) => r.paperId))];
  const bookmarkedPaperIds = new Set<number>();
  if (paperIds.length > 0) {
    const bookmarkRows = await db
      .select({ paperId: bookmarks.paperId })
      .from(bookmarks)
      .where(inArray(bookmarks.paperId, paperIds));
    for (const b of bookmarkRows) bookmarkedPaperIds.add(b.paperId);
  }

  const domainScanned = (brief.runSummary as RunSummary | null)?.domainScanned ?? {};

  const domainIds = new Set<number>([
    ...rows.map((r) => r.domainId),
    ...Object.keys(domainScanned).map(Number),
  ]);
  const domainNameLookup = new Map<number, string>(rows.map((r) => [r.domainId, r.domainName]));
  const missingIds = [...domainIds].filter((id) => !domainNameLookup.has(id));
  if (missingIds.length > 0) {
    const missingDomains = await db
      .select({ id: domains.id, name: domains.name })
      .from(domains)
      .where(inArray(domains.id, missingIds));
    for (const d of missingDomains) domainNameLookup.set(d.id, d.name);
  }

  const grouped = new Map<number, BriefDomainView>();
  for (const domainId of domainIds) {
    grouped.set(domainId, {
      domainId,
      domainName: domainNameLookup.get(domainId) ?? `Domain ${domainId}`,
      scanned: domainScanned[domainId] ?? 0,
      selected: [],
      filteredOut: [],
    });
  }

  for (const r of rows) {
    const item: BriefItemView = {
      paperId: r.paperId,
      title: r.title,
      authors: r.authors,
      url: r.url,
      publishedAt: r.publishedAt.toISOString(),
      hfUpvotes: r.hfUpvotes,
      significanceScore: r.significanceScore,
      selectionReason: r.selectionReason,
      summary: r.summary,
      whyItMatters: r.whyItMatters,
      suggestion: r.suggestion,
      isSelected: r.isSelected,
      isBookmarked: bookmarkedPaperIds.has(r.paperId),
    };
    const group = grouped.get(r.domainId)!;
    if (item.isSelected) group.selected.push(item);
    else group.filteredOut.push(item);
  }

  return {
    id: brief.id,
    weekStart: brief.weekStart,
    createdAt: brief.createdAt.toISOString(),
    status: brief.status,
    papersScanned: brief.papersScanned,
    domains: Array.from(grouped.values()).sort((a, b) => a.domainId - b.domainId),
  };
}
