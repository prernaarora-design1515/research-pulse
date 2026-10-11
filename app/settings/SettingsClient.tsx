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
        setRunResult(`Failed: ${data.error ?? "Unknown error"}`);
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

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-slate-800 hover:underline"
        >
          Log out
        </button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Recipient email</h2>
        <p className="text-sm text-slate-600">
          Weekly briefs and on-demand runs are emailed here.
        </p>
        <form onSubmit={handleSaveEmail} className="flex max-w-md gap-2">
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="kavita@example.com"
            required
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Save
          </button>
        </form>
        {emailStatus && <p className="text-sm text-slate-600">{emailStatus}</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Run now</h2>
        <p className="text-sm text-slate-600">
          Scans all active domains for papers from the last 7 days, scores them with Gemini,
          builds a fresh brief, and emails it to the recipient above. This can take a minute
          or two (arXiv is queried politely, a few seconds per domain).
        </p>
        <button
          onClick={handleRunNow}
          disabled={runningBrief}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {runningBrief ? "Running..." : "Run now"}
        </button>
        {runResult && <p className="text-sm text-slate-600">{runResult}</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Domains</h2>
        <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {domainsList.length === 0 && (
            <p className="p-4 text-sm text-slate-500">No domains yet. Add one below.</p>
          )}
          {domainsList.map((d) => (
            <div key={d.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {d.name}{" "}
                  {!d.isActive && (
                    <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      inactive
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500">
                  Categories: {d.arxivCategories.join(", ")} &middot; Keywords: {d.keywords.join(", ")} &middot; Shows top {d.papersToShow}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => toggleActive(d)}
                  className="text-slate-600 hover:underline"
                >
                  {d.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => deleteDomain(d.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddDomain} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-medium text-slate-800">Add a domain</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Papers to show</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.papersToShow}
                onChange={(e) => setForm({ ...form, papersToShow: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">arXiv categories (comma-separated)</label>
              <input
                value={form.arxivCategories}
                onChange={(e) => setForm({ ...form, arxivCategories: e.target.value })}
                placeholder="cs.AI, cs.CL"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Keywords (comma-separated)</label>
              <input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="agent, planning"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add domain"}
          </button>
        </form>
      </section>
    </div>
  );
}
