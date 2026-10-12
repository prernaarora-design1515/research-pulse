import { desc, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import { briefs, briefItems, papers, domains, bookmarks } from "./schema";
import type { RunSummary } from "../pipeline";

export type BriefItemView = {
  briefItemId: number;
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
  priority: string;
  isSelected: boolean;
  isBookmarked: boolean;
  tags: string[];
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

async function getAbsoluteLatestBriefId(): Promise<number | null> {
  const [row] = await db
    .select({ id: briefs.id })
    .from(briefs)
    .orderBy(desc(briefs.createdAt))
    .limit(1);
  return row?.id ?? null;
}

/**
 * Picks which brief the homepage should show. Prefers the most recent run
 * that actually has any papers (selected or filtered-out) over the literal
 * latest attempt, so a run that came back fully empty (e.g. arXiv itself
 * was unreachable) doesn't bury a good brief behind a blank page. A run
 * where the AI provider failed but arXiv papers were still fetched counts
 * as "has content" here — those papers are real and visible, just missing
 * an AI score, which the UI surfaces honestly rather than hiding.
 */
export async function getHomepageBrief(): Promise<{
  id: number | null;
  isFallback: boolean;
  newerEmptyRunAt: string | null;
}> {
  const [withResults] = await db
    .selectDistinct({ id: briefs.id, createdAt: briefs.createdAt })
    .from(briefs)
    .innerJoin(briefItems, eq(briefItems.briefId, briefs.id))
    .orderBy(desc(briefs.createdAt))
    .limit(1);

  const absoluteLatestId = await getAbsoluteLatestBriefId();

  if (!withResults) {
    return { id: absoluteLatestId, isFallback: false, newerEmptyRunAt: null };
  }

  if (absoluteLatestId === withResults.id) {
    return { id: withResults.id, isFallback: false, newerEmptyRunAt: null };
  }

  const [newer] = await db
    .select({ createdAt: briefs.createdAt })
    .from(briefs)
    .where(eq(briefs.id, absoluteLatestId!))
    .limit(1);

  return {
    id: withResults.id,
    isFallback: true,
    newerEmptyRunAt: newer?.createdAt.toISOString() ?? null,
  };
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

export async function getAllTags(): Promise<string[]> {
  const rows = await db.select({ tags: bookmarks.tags }).from(bookmarks);
  const set = new Set<string>();
  for (const r of rows) for (const t of r.tags) set.add(t);
  return Array.from(set).sort();
}

export async function getBriefDetail(briefId: number): Promise<BriefDetail | null> {
  const [brief] = await db.select().from(briefs).where(eq(briefs.id, briefId));
  if (!brief) return null;

  const rows = await db
    .select({
      briefItemId: briefItems.id,
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
      priority: briefItems.priority,
      isSelected: briefItems.isSelected,
    })
    .from(briefItems)
    .innerJoin(papers, eq(briefItems.paperId, papers.id))
    .innerJoin(domains, eq(briefItems.domainId, domains.id))
    .where(eq(briefItems.briefId, briefId))
    .orderBy(domains.id, desc(briefItems.significanceScore));

  const paperIds = [...new Set(rows.map((r) => r.paperId))];
  const bookmarkByPaperId = new Map<number, { tags: string[] }>();
  if (paperIds.length > 0) {
    const bookmarkRows = await db
      .select({ paperId: bookmarks.paperId, tags: bookmarks.tags })
      .from(bookmarks)
      .where(inArray(bookmarks.paperId, paperIds));
    for (const b of bookmarkRows) bookmarkByPaperId.set(b.paperId, { tags: b.tags });
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
    const bookmark = bookmarkByPaperId.get(r.paperId);
    const item: BriefItemView = {
      briefItemId: r.briefItemId,
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
      priority: r.priority,
      isSelected: r.isSelected,
      isBookmarked: bookmark !== undefined,
      tags: bookmark?.tags ?? [],
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
