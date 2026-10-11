import { NextResponse } from "next/server";
import { runBriefPipeline } from "@/lib/pipeline";

export const maxDuration = 300;

export async function POST() {
  try {
    const summary = await runBriefPipeline();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("run-brief pipeline failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}

// Vercel Cron sends GET requests by default.
export async function GET() {
  return POST();
}
