import { getLatestBriefId, getBriefDetail } from "@/lib/db/briefQueries";
import BriefView from "@/components/BriefView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latestId = await getLatestBriefId();

  if (!latestId) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        <h1 className="mb-2 text-xl font-semibold text-slate-700">No brief yet</h1>
        <p>The latest weekly brief will appear here once the pipeline runs.</p>
      </div>
    );
  }

  const brief = await getBriefDetail(latestId);
  if (!brief) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        <p>Could not load the latest brief.</p>
      </div>
    );
  }

  return <BriefView brief={brief} />;
}
