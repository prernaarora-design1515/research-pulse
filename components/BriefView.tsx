"use client";

import { useState } from "react";
import type { BriefDetail, BriefItemView } from "@/lib/db/briefQueries";
import DomainPlacards from "./DomainPlacards";
import FilteredOutList from "./FilteredOutList";
import PaperRow from "./PaperRow";
import PaperDetailModal from "./PaperDetailModal";

export default function BriefView({
  brief,
  allTags,
}: {
  brief: BriefDetail;
  allTags: string[];
}) {
  const totalShown = brief.domains.reduce((sum, d) => sum + d.selected.length, 0);
  const [activeId, setActiveId] = useState(brief.domains[0]?.domainId);
  const activeDomain = brief.domains.find((d) => d.domainId === activeId) ?? brief.domains[0];
  const [openItem, setOpenItem] = useState<BriefItemView | null>(null);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-neutral-100">
          Week of {brief.weekStart}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-neutral-500">
          {brief.papersScanned} scanned &middot; {totalShown} surfaced &middot;{" "}
          {brief.domains.length} domains
        </p>
      </div>

      {activeDomain ? (
        <>
          <DomainPlacards
            domains={brief.domains.map((d) => ({
              domainId: d.domainId,
              domainName: d.domainName,
              count: d.selected.length,
            }))}
            activeId={activeDomain.domainId}
            onSelect={setActiveId}
          />

          <div key={activeDomain.domainId} className="animate-fade-in-up space-y-4">
            <p className="text-xs text-slate-400 dark:text-neutral-600">
              {activeDomain.scanned} scanned, {activeDomain.selected.length} shown
            </p>

            <PaperRow items={activeDomain.selected} onOpen={setOpenItem} />

            <FilteredOutList items={activeDomain.filteredOut} />
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400 dark:text-neutral-600">No domains configured.</p>
      )}

      <PaperDetailModal item={openItem} allTags={allTags} onClose={() => setOpenItem(null)} />
    </div>
  );
}
