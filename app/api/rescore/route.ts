import { NextRequest, NextResponse } from "next/server";
import { getHomepageBrief } from "@/lib/db/briefQueries";
import { rescoreUnscored } from "@/lib/rescore";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const briefId = Number.isInteger(Number(body?.briefId))
    ? Number(body.briefId)
    : (await getHomepageBrief()).id;

  if (!briefId) {
    return NextResponse.json({ error: "No brief to score" }, { status: 404 });
  }

  try {
    const result = await rescoreUnscored(briefId);
    return NextResponse.json({ briefId, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scoring failed" },
      { status: 502 }
    );
  }
}
