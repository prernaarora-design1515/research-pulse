import { notFound } from "next/navigation";
import { getBriefDetail } from "@/lib/db/briefQueries";
import BriefView from "@/components/BriefView";

export const dynamic = "force-dynamic";

export default async function ArchiveBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const briefId = Number(id);
  if (!Number.isInteger(briefId)) notFound();

  const brief = await getBriefDetail(briefId);
  if (!brief) notFound();

  return <BriefView brief={brief} />;
}
