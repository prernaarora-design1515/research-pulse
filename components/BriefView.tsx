"use client";

import { useState } from "react";
import type { BriefDetail, BriefItemView } from "@/lib/db/briefQueries";
import type { Priority } from "./PriorityDropdown";
import DomainPlacards from "./DomainPlacards";
import FilteredOutList from "./FilteredOutList";
import PaperRow from "./PaperRow";
import PaperDetailModal from "./PaperDetailModal";

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function BriefView({
  brief,
  allTags,
}: {
  brief: BriefDetail;
  allTags: string[];
}) {
  const totalShown = brief.domains.reduce((sum, d) => sum + d.selected.length, 0);
  const totalUnscored = brief.domains.reduce(
    (sum, d) => sum + (d.selected.length === 0 ? d.filteredOut.length : 0),
    0
  );
  const [activeId, setActiveId] = useState(brief.domains[0]?.domainId);
  const activeDomain = brief.domains.find((d) => d.domainId === activeId) ?? brief.domains[0];
  const [openItem, setOpenItem] = useState<BriefItemView | null>(null);
  // Priority changes made in the modal are saved to the DB, but the brief
  // data here is a server-rendered snapshot -- without this, a changed
  // priority would never show up anywhere until a full page reload.
  const [priorityOverrides, setPriorityOverrides] = useState<Record<number, Priority>>({});

  function applyOverride(item: BriefItemView): BriefItemView {
    const override = priorityOverrides[item.briefItemId];
    return override ? { ...item, priority: override } : item;
  }

  function handlePriorityChanged(briefItemId: number, next: Priority) {
    setPriorityOverrides((prev) => ({ ...prev, [briefItemId]: next }));
    setOpenItem((prev) =>
      prev && prev.briefItemId === briefItemId ? { ...prev, priority: next } : prev
    );
  }

  // If nothing was AI-selected but real papers were scanned, show them
  // directly instead of hiding real content behind an extra click and a
  // "nothing significant" message that reads as broken/empty.
  const hasSelected = (activeDomain?.selected.length ?? 0) > 0;
  const hasAnyPapers = hasSelected || (activeDomain?.filteredOut.length ?? 0) > 0;
  const rawMainRowItems = hasSelected ? activeDomain?.selected ?? [] : activeDomain?.filteredOut ?? [];

  // High-priority picks surface at the front of the row -- otherwise marking
  // something "high priority" had no visible effect anywhere on the page.
  const mainRowItems = rawMainRowItems.map(applyOverride).sort((a, b) => {
    const rankDiff = (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
    if (rankDiff !== 0) return rankDiff;
    return b.significanceScore - a.significanceScore;
  });
  const filteredOutItems = (activeDomain?.filteredOut ?? []).map(applyOverride);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-4xl font-black italic tracking-tight text-slate-900 sm:text-5xl dark:text-neutral-100">
          Week of {brief.weekStart}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-neutral-500">
          {brief.papersScanned} scanned &middot; {totalShown} AI-surfaced
          {totalUnscored > 0 && ` (+${totalUnscored} shown unscored)`} &middot;{" "}
          {brief.domains.length} domains
        </p>
      </div>

      {activeDomain ? (
        <>
          <DomainPlacards
            domains={brief.domains.map((d) => ({
              domainId: d.domainId,
              domainName: d.domainName,
              count: d.selected.length > 0 ? d.selected.length : d.filteredOut.length,
              isUnscored: d.selected.length === 0,
            }))}
            activeId={activeDomain.domainId}
            onSelect={setActiveId}
          />

          <div key={activeDomain.domainId} className="animate-fade-in-up space-y-4">
            <p className="text-xs text-slate-400 dark:text-neutral-600">
              {activeDomain.scanned} scanned, {activeDomain.selected.length} shown
              {!hasSelected && hasAnyPapers && " · showing all scanned papers (none AI-scored yet)"}
            </p>

            {hasAnyPapers ? (
              <PaperRow items={mainRowItems} onOpen={setOpenItem} />
            ) : (
              <p className="py-10 text-sm text-slate-400 dark:text-neutral-600">
                Nothing found in this domain this week.
              </p>
            )}

            {hasSelected && <FilteredOutList items={filteredOutItems} onOpen={setOpenItem} />}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400 dark:text-neutral-600">No domains configured.</p>
      )}

      <PaperDetailModal
        item={openItem}
        allTags={allTags}
        onClose={() => setOpenItem(null)}
        onPriorityChanged={handlePriorityChanged}
      />
    </div>
  );
}
