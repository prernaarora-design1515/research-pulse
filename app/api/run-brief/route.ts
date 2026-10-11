import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { runBriefPipeline } from "@/lib/pipeline";

export const maxDuration = 300;

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  return isAuthenticated();
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
export async function GET(req: NextRequest) {
  return POST(req);
}
