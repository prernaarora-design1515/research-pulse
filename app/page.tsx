import { getLatestBriefId, getBriefDetail, getAllTags } from "@/lib/db/briefQueries";
import BriefView from "@/components/BriefView";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latestId = await getLatestBriefId();

  if (!latestId) {
    return (
      <EmptyState title="no brief yet">
        the latest weekly brief will appear here once the pipeline runs.
      </EmptyState>
    );
  }

  const [brief, allTags] = await Promise.all([getBriefDetail(latestId), getAllTags()]);
  if (!brief) {
    return <EmptyState title="could not load brief">try refreshing the page.</EmptyState>;
  }

  return <BriefView brief={brief} allTags={allTags} />;
}
