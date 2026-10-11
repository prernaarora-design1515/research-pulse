import { GoogleGenAI } from "@google/genai";
import type { ScoredPaper } from "./prefilter";

export type GeminiVerdict = {
  paper_id: string; // arxivId
  significance_score: number; // 1-10
  selection_reason: string;
  summary: string;
  why_it_matters: string;
  suggestion: "read" | "flag_for_client" | "skip";
};

const BATCH_SIZE = 12;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

function buildPrompt(papers: ScoredPaper[]): string {
  const paperBlocks = papers
    .map(
      (p, i) =>
        `[${i + 1}] paper_id: ${p.arxivId}\nTitle: ${p.title}\nAbstract: ${p.abstract}`
    )
    .join("\n\n");

  return `You are helping a senior AI/ML technology advisory consultant triage this week's research papers.

For EACH paper below, assess its significance using these criteria:
- New benchmarks or datasets
- Surprising or contradicting evaluation results
- Papers that change how a problem is framed
- Strong evidence over hype / real-world or industrial applicability
Penalise incremental tweaks and vague claims.

Base your summary and "why it matters" ONLY on the title and abstract given. Do NOT invent
results, numbers, or claims that are not stated in the text.

Return ONLY a JSON array (no markdown fences, no prose), one object per paper, in this exact shape:
[
  {
    "paper_id": "<the paper_id given above>",
    "significance_score": <integer 1-10>,
    "selection_reason": "<short tag, e.g. 'New benchmark', 'Surprising evaluation result', 'Reframes the problem', 'Strong SOTA evidence', 'High community attention', 'Incremental'>",
    "summary": "<2 lines, technical, for an expert reader>",
    "why_it_matters": "<1-2 lines: practical / client relevance>",
    "suggestion": "<one of: read, flag_for_client, skip>"
  }
]

Papers:

${paperBlocks}`;
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function isValidVerdict(v: unknown): v is GeminiVerdict {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.paper_id === "string" &&
    typeof obj.significance_score === "number" &&
    typeof obj.selection_reason === "string" &&
    typeof obj.summary === "string" &&
    typeof obj.why_it_matters === "string" &&
    ["read", "flag_for_client", "skip"].includes(obj.suggestion as string)
  );
}

async function callGemini(prompt: string): Promise<string> {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL;
  if (!model) throw new Error("GEMINI_MODEL is not set");

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

function parseVerdicts(rawText: string): GeminiVerdict[] | null {
  try {
    const cleaned = stripJsonFences(rawText);
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return null;
    const valid = parsed.filter(isValidVerdict);
    return valid.length > 0 ? valid : null;
  } catch {
    return null;
  }
}

/**
 * Scores one batch of papers. Retries once on a parse failure, then gives up
 * on just this batch (returns []) rather than crashing the whole run.
 */
async function scoreBatch(batch: ScoredPaper[]): Promise<GeminiVerdict[]> {
  const prompt = buildPrompt(batch);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const rawText = await callGemini(prompt);
      const verdicts = parseVerdicts(rawText);
      if (verdicts) return verdicts;
    } catch (err) {
      if (attempt === 1) {
        console.error("Gemini batch failed after retry:", err);
      }
    }
  }

  return [];
}

export async function scorePapers(
  papers: ScoredPaper[]
): Promise<Map<string, GeminiVerdict>> {
  const verdictsByArxivId = new Map<string, GeminiVerdict>();

  for (let i = 0; i < papers.length; i += BATCH_SIZE) {
    const batch = papers.slice(i, i + BATCH_SIZE);
    const verdicts = await scoreBatch(batch);
    for (const v of verdicts) {
      verdictsByArxivId.set(v.paper_id, v);
    }
  }

  return verdictsByArxivId;
}
