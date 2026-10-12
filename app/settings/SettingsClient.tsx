"use client";

import { useState } from "react";

type Domain = {
  id: number;
  name: string;
  arxivCategories: string[];
  keywords: string[];
  papersToShow: number;
  isActive: boolean;
};

const emptyForm = {
  name: "",
  arxivCategories: "",
  keywords: "",
  papersToShow: 4,
};

const inputClass =
  "w-full border-2 border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-accent focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

const primaryButtonClass =
  "bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-all hover:bg-accent active:scale-95 disabled:opacity-50 disabled:active:scale-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-accent dark:hover:text-accent-foreground";

export default function SettingsClient({
  initialDomains,
  initialRecipientEmail,
}: {
  initialDomains: Domain[];
  initialRecipientEmail: string;
}) {
  const [domainsList, setDomainsList] = useState(initialDomains);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [recipientEmail, setRecipientEmail] = useState(initialRecipientEmail);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const [runningBrief, setRunningBrief] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);

  async function handleRunNow() {
    setRunningBrief(true);
    setRunResult(null);
    try {
      const res = await fetch("/api/run-brief", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setRunResult(`Failed: ${data.error ?? "unknown error"}`);
        return;
      }
      const errorNote = data.errors?.length ? ` (${data.errors.length} error(s) logged)` : "";
      setRunResult(
        `Done. Scanned ${data.papersScanned} papers across ${data.domainsProcessed} domains, selected ${data.papersSelected}.${errorNote} Check the home page and your inbox.`
      );
    } catch {
      setRunResult("Something went wrong triggering the run.");
    } finally {
      setRunningBrief(false);
    }
  }

  async function refreshDomains() {
    const res = await fetch("/api/domains");
    if (res.ok) setDomainsList(await res.json());
  }

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          arxivCategories: form.arxivCategories.split(",").map((s) => s.trim()),
          keywords: form.keywords.split(",").map((s) => s.trim()),
          papersToShow: Number(form.papersToShow),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to add domain");
        return;
      }
      setForm(emptyForm);
      await refreshDomains();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(d: Domain) {
    await fetch("/api/domains", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: d.id, isActive: !d.isActive }),
    });
    await refreshDomains();
  }

  async function deleteDomain(id: number) {
    if (!confirm("Delete this domain? This cannot be undone.")) return;
    await fetch(`/api/domains?id=${id}`, { method: "DELETE" });
    await refreshDomains();
  }

  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailStatus(null);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "recipient_email", value: recipientEmail }),
    });
    const data = await res.json();
    setEmailStatus(res.ok ? "Saved." : data.error ?? "Failed to save");
  }

  return (
    <div className="animate-fade-in-up space-y-10">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-neutral-100">
        Settings
      </h1>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-500 dark:text-neutral-400">
          Recipient email
        </h2>
        <form onSubmit={handleSaveEmail} className="flex max-w-md gap-2">
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="kavita@example.com"
            required
            className={inputClass}
          />
          <button type="submit" className={primaryButtonClass}>
            Save
          </button>
        </form>
        {emailStatus && (
          <p className="animate-fade-in-up text-sm text-slate-600 dark:text-neutral-400">
            {emailStatus}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-500 dark:text-neutral-400">Run now</h2>
        <button
          onClick={handleRunNow}
          disabled={runningBrief}
          title="Scans active domains, scores with Gemini, emails the result. Takes 1-4 min."
          className={primaryButtonClass}
        >
          {runningBrief ? "Running…" : "Run now"}
        </button>
        {runResult && (
          <p className="animate-fade-in-up text-sm text-slate-600 dark:text-neutral-400">
            {runResult}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-500 dark:text-neutral-400">Domains</h2>
        <div className="divide-y divide-slate-200 border-2 border-slate-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {domainsList.length === 0 && (
            <p className="p-4 text-sm text-slate-500 dark:text-neutral-500">
              No domains yet. Add one below.
            </p>
          )}
          {domainsList.map((d, i) => (
            <div
              key={d.id}
              className="animate-fade-in-up flex flex-col gap-2 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-neutral-800/50"
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-neutral-100">
                  {d.name}{" "}
                  {!d.isActive && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-neutral-800 dark:text-neutral-500">
                      inactive
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500 dark:text-neutral-500">
                  Categories: {d.arxivCategories.join(", ")} &middot; Keywords:{" "}
                  {d.keywords.join(", ")} &middot; Shows top {d.papersToShow}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => toggleActive(d)}
                  className="text-slate-600 transition-colors hover:text-accent dark:text-neutral-400"
                >
                  {d.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => deleteDomain(d.id)}
                  className="text-red-600 transition-colors hover:text-red-500 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleAddDomain}
          className="space-y-3 border-2 border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h3 className="font-medium text-slate-800 dark:text-neutral-200">Add a domain</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-neutral-400">
                Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-neutral-400">
                Papers to show
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.papersToShow}
                onChange={(e) => setForm({ ...form, papersToShow: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-neutral-400">
                arXiv categories (comma-separated)
              </label>
              <input
                value={form.arxivCategories}
                onChange={(e) => setForm({ ...form, arxivCategories: e.target.value })}
                placeholder="cs.AI, cs.CL"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-neutral-400">
                Keywords (comma-separated)
              </label>
              <input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="agent, planning"
                required
                className={inputClass}
              />
            </div>
          </div>
          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? "Adding…" : "Add domain"}
          </button>
        </form>
      </section>
    </div>
  );
}
