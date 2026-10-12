import Link from "next/link";
import { getHomepageBrief, getBriefDetail, getAllTags } from "@/lib/db/briefQueries";
import BriefView from "@/components/BriefView";
import EmptyState from "@/components/EmptyState";
import Hero, { type HeroItem } from "@/components/Hero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { id, isFallback, newerEmptyRunAt } = await getHomepageBrief();

  if (!id) {
    return (
      <EmptyState title="No brief yet">
        The latest weekly brief will appear here once the pipeline runs.
      </EmptyState>
    );
  }

  const [brief, allTags] = await Promise.all([getBriefDetail(id), getAllTags()]);
  if (!brief) {
    return <EmptyState title="Could not load brief">Try refreshing the page.</EmptyState>;
  }

  const heroItems: HeroItem[] = brief.domains
    .map((d) => {
      const pick = d.selected[0] ?? d.filteredOut[0];
      return pick ? { ...pick, domainName: d.domainName } : null;
    })
    .filter((x): x is HeroItem => x !== null)
    .sort((a, b) => b.significanceScore - a.significanceScore)
    .slice(0, 6);

  return (
    <div className="space-y-4">
      <Hero items={heroItems} domainsCount={brief.domains.length} allTags={allTags} />

      <div id="brief" className="scroll-mt-20 space-y-4">
        {isFallback && newerEmptyRunAt && (
          <p className="border-2 border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            A more recent run ({new Date(newerEmptyRunAt).toISOString().slice(0, 10)}) found
            nothing — likely an AI provider error, not a quiet week. Showing the last brief with
            results instead. See the full history in{" "}
            <Link href="/archive" className="underline">
              Archive
            </Link>
            .
          </p>
        )}
        <BriefView brief={brief} allTags={allTags} />
      </div>
    </div>
  );
}
