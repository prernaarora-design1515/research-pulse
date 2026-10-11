# Research Pulse

A weekly AI/ML research brief for Kavita, a senior consultant who needs to stay
current on 8–10 research domains without spending 45 minutes to two hours a day
reading arXiv. Every Monday morning (07:00 IST), the system scans her monitored
domains for papers published in the last 7 days, scores them with Gemini Flash,
and emails a brief organised by domain — readable in under 10 minutes.

**Core principle: "The system narrows. Kavita chooses."** The AI suggests
significance and a read/flag/skip label; it never hides anything. Every paper
that was scanned but not selected stays visible on the web page, with its score
and the reason it wasn't picked.

## What it does

- Scans arXiv (and optionally Hugging Face Daily Papers for an upvote signal)
  for each active domain, once a week on a schedule or on demand.
- Scores every candidate paper with Gemini Flash: a 1–10 significance score, a
  short reason tag, a 2-line technical summary, a "why it matters" line, and a
  read / flag-for-client / skip suggestion — based only on the title and
  abstract (no invented claims).
- Picks the top N papers per domain (configurable, default 4) for the brief;
  everything else stays visible as "filtered out" with its score and reason.
- Saves every brief to Postgres so past weeks are browsable in `/archive`.
- Emails the brief via Resend, with a link back to the full web version.
- Lets Kavita bookmark papers and tag them for later (`/saved`).
- Lets Kavita edit her domain list (name, arXiv categories, keywords, how many
  papers to show) from `/settings`, without touching code.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Hosting | Vercel |
| Scheduler | Vercel Cron (`vercel.json`) |
| Database | Neon (Postgres), via Drizzle ORM |
| AI | Google Gemini Flash (`@google/genai`) — **never Claude** |
| Email | Resend + React Email |
| Live data | arXiv API (required), Hugging Face Daily Papers (optional) |
| Styling | Tailwind CSS |

## Architecture

```
app/
  page.tsx                   latest brief (public)
  archive/page.tsx           list of past briefs (public)
  archive/[id]/page.tsx      one past brief (public)
  saved/page.tsx             bookmarks + tags
  settings/page.tsx          domain CRUD, recipient email, Run now
  test/arxiv/page.tsx        proves live arXiv data per domain
  api/
    run-brief/route.ts       the pipeline (callable by anyone or Vercel Cron)
    domains/route.ts         domain CRUD
    settings/route.ts        recipient email
    bookmarks/route.ts       bookmarks + tags
lib/
  arxiv.ts                   fetch + parse arXiv Atom XML, 7-day filter
  huggingface.ts              best-effort Daily Papers upvote signal
  prefilter.ts                cross-domain dedup, keyword relevance, per-domain cap
  gemini.ts                   batched Gemini Flash calls, strict JSON parsing + one retry
  pipeline.ts                  orchestrates the whole run-brief pipeline
  email.tsx / emailTemplate.tsx   Resend + React Email template
  db/schema.ts                 Drizzle schema (see below)
```

### Pipeline (`/api/run-brief`)

1. **Load context** — active domains, and every arXiv id that's ever appeared
   in a previous brief (for de-duplication).
2. **Fetch live papers** — per domain, from the arXiv API, limited to the last
   7 days, ~1 request every 3 seconds (arXiv etiquette).
3. **Pre-filter** — drop already-shown papers, dedupe the same paper across
   domains (kept in its best-matching domain), cap each domain at 25
   candidates ranked by keyword relevance + Hugging Face upvotes.
4. **Score with Gemini Flash** — batches of ~12 papers per call, strict
   JSON-only output, one retry on a parse failure, skip the batch (not the
   whole run) if it still fails.
5. **Assemble** — top N per domain (by score) become the brief; everything
   else is saved as "filtered out" but stays queryable.
6. **Save and deliver** — brief + items saved to Postgres, email sent via
   Resend with a link to the full web version.

One domain or data source failing never kills the whole run — errors are
logged into the run's summary and shown in the UI/response.

### Database schema (Neon Postgres, via Drizzle)

- `domains` — name, arXiv categories, keywords, papers_to_show, is_active
- `briefs` — one row per run: week_start, status, papers_scanned, run_summary (JSON)
- `papers` — deduped by `arxiv_id`: title, authors, abstract, url, published_at, hf_upvotes
- `brief_items` — one row per (brief, paper, domain): score, reason, summary,
  why_it_matters, suggestion, `is_selected` (false = filtered out, still viewable)
- `bookmarks` — paper_id, tags (text[]), note
- `settings` — key/value (currently just `recipient_email`)

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Create a Neon database

1. Go to [console.neon.tech](https://console.neon.tech), sign in, and create a
   new project.
2. Copy the connection string shown on the project dashboard (click
   **Connect**) — it looks like
   `postgresql://user:pass@host/neondb?sslmode=require`.

### 3. Get a Gemini API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and
   create a key.
2. Check [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
   for the current Flash model name (model names change over time — that's
   why it's an env var, not hardcoded).

### 4. Get a Resend API key

1. Go to [resend.com/api-keys](https://resend.com/api-keys) and create a key.
2. **Important for the demo:** without a verified sending domain, Resend's
   test sender (`onboarding@resend.dev`) can only deliver email to the address
   on your Resend account. Set the recipient email in `/settings` to that
   same address, or [verify a domain](https://resend.com/domains) if you want
   to send to Kavita's real inbox.

### 5. Fill in your environment file

```bash
cp .env.example .env.local
```

Fill in every value in `.env.local`:

| Variable | What it's for |
|---|---|
| `GEMINI_API_KEY` | from AI Studio |
| `GEMINI_MODEL` | current Gemini Flash model name |
| `DATABASE_URL` | your Neon connection string |
| `RESEND_API_KEY` | from Resend |
| `EMAIL_FROM` | e.g. `Research Pulse <onboarding@resend.dev>` |
| `APP_URL` | `http://localhost:3000` locally, your Vercel URL in production |

### 6. Push the schema and seed the default domains

```bash
npm run db:push
npm run db:seed
```

This creates the tables and seeds 8 starter domains (AI Agents, RAG, LLMs for
Code, Computer Vision for Industrial Applications, LLM Evaluation and
Benchmarks, Efficient/Small Language Models, Multimodal Models, AI Safety and
Alignment). Edit or replace them any time from `/settings`.

### 7. Run it locally

```bash
npm run dev
```

Visit `http://localhost:3000/settings`, set a recipient email, and click
**Run now** to generate a real brief from live arXiv data (takes 1–4 minutes
depending on how many domains are active — arXiv is queried politely at one
request per 3 seconds).

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel, and add every variable from `.env.example` as a
   Production environment variable (use your real Neon/Gemini/Resend values,
   and set `APP_URL` to the Vercel URL Vercel gives you).
3. Deploy.
4. `vercel.json` already configures the Monday 07:00 IST cron
   (`30 1 * * 1` UTC). **Vercel Cron only runs on the production
   deployment**, and on the free (Hobby) plan the exact trigger time can
   drift within the hour — check current Vercel docs if exact timing matters.
5. The Hobby plan also caps serverless function duration; a full run across 8
   domains (arXiv's 3-second etiquette delay × domains, plus Gemini calls)
   can take a few minutes. If you hit the time limit, either upgrade the plan
   or reduce the number of active domains / `papers_to_show`.

## Access

There is no login anywhere in this app, by design (per request): `/settings`,
`/saved`, and `/api/run-brief` are all public. Anyone with the URL can edit
domains, add/remove bookmarks, change the recipient email, and trigger a full
pipeline run (which calls the Gemini and Resend APIs and emails the
configured recipient). If you deploy this somewhere people other than Kavita
can reach, be aware a public "Run now" means anyone can trigger paid API
calls and emails on demand, with no rate limiting.

## What's deliberately not built

Per the brief: no automatic sending of papers to clients (Kavita decides), no
hidden filtering (every filtered-out paper stays visible with its reason), no
AI-written client strategy advice, and bookmarks don't change the ranking —
it stays transparent.
