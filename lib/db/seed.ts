import { db } from "./client";
import { domains } from "./schema";

const SEED_DOMAINS = [
  {
    name: "AI Agents",
    arxivCategories: ["cs.AI", "cs.MA"],
    keywords: ["agent", "autonomous agent", "tool use", "multi-agent", "planning"],
  },
  {
    name: "Retrieval-Augmented Generation (RAG)",
    arxivCategories: ["cs.CL", "cs.IR"],
    keywords: ["retrieval-augmented", "RAG", "retrieval augmented generation", "vector search"],
  },
  {
    name: "LLMs for Code",
    arxivCategories: ["cs.SE", "cs.CL"],
    keywords: ["code generation", "coding agent", "program synthesis", "code LLM"],
  },
  {
    name: "Computer Vision for Industrial Applications",
    arxivCategories: ["cs.CV"],
    keywords: ["industrial inspection", "defect detection", "manufacturing", "anomaly detection"],
  },
  {
    name: "LLM Evaluation and Benchmarks",
    arxivCategories: ["cs.CL", "cs.LG"],
    keywords: ["benchmark", "evaluation", "LLM evaluation", "leaderboard"],
  },
  {
    name: "Efficient / Small Language Models",
    arxivCategories: ["cs.CL", "cs.LG"],
    keywords: ["small language model", "distillation", "quantization", "efficient inference"],
  },
  {
    name: "Multimodal Models",
    arxivCategories: ["cs.CV", "cs.CL"],
    keywords: ["multimodal", "vision-language", "VLM", "image-text"],
  },
  {
    name: "AI Safety and Alignment",
    arxivCategories: ["cs.AI", "cs.CL"],
    keywords: ["alignment", "AI safety", "RLHF", "red teaming", "jailbreak"],
  },
];

async function seed() {
  for (const d of SEED_DOMAINS) {
    await db.insert(domains).values(d).onConflictDoNothing();
  }
  console.log(`Seeded ${SEED_DOMAINS.length} domains.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
