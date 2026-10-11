type HfPaper = {
  paper?: { id?: string };
  upvotes?: number;
};

/**
 * Best-effort fetch of Hugging Face's Daily Papers upvote counts, keyed by
 * arXiv id. Never throws: callers get an empty map if HF is unreachable or
 * its response shape changes, and the brief continues without this signal.
 */
export async function fetchHuggingFaceUpvotes(): Promise<Map<string, number>> {
  const upvotes = new Map<string, number>();

  try {
    const res = await fetch("https://huggingface.co/api/daily_papers", {
      headers: { "User-Agent": "ResearchPulse/1.0 (weekly research brief tool)" },
    });
    if (!res.ok) return upvotes;

    const data: HfPaper[] = await res.json();
    if (!Array.isArray(data)) return upvotes;

    for (const item of data) {
      const arxivId = item.paper?.id;
      if (arxivId && typeof item.upvotes === "number") {
        upvotes.set(arxivId, item.upvotes);
      }
    }
  } catch {
    // Optional signal only — continue without it.
  }

  return upvotes;
}
