"use client";

import { useEffect, useState } from "react";
import { useActivePaper } from "./ActivePaperContext";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function NotesWidget() {
  const { activePaper } = useActivePaper();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [state, setState] = useState<SaveState>("idle");

  // Load the existing note whenever the panel opens on a (new) active paper.
  useEffect(() => {
    if (!open || !activePaper) return;
    let cancelled = false;
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((rows: { paperId: number; note: string | null }[]) => {
        if (cancelled) return;
        const match = rows.find((r) => r.paperId === activePaper.paperId);
        setNote(match?.note ?? "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activePaper?.paperId]);

  async function save() {
    if (!activePaper) return;
    setState("saving");
    try {
      const res = await fetch("/api/bookmarks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId: activePaper.paperId, note }),
      });
      setState(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="animate-fade-in-up w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-neutral-600">
              Notes
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close notes"
              className="text-slate-400 transition-colors hover:text-accent dark:text-neutral-600"
            >
              ×
            </button>
          </div>

          {activePaper ? (
            <>
              <p className="mb-2 line-clamp-2 font-display text-sm italic text-slate-800 dark:text-neutral-200">
                {activePaper.title}
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Jot down a thought on this paper…"
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 transition-colors focus:border-accent focus:outline-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  onClick={save}
                  disabled={state === "saving"}
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition-all hover:bg-accent active:scale-95 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-accent dark:hover:text-white"
                >
                  {state === "saving" ? "Saving…" : "Save"}
                </button>
                {state === "saved" && (
                  <span className="text-xs font-medium text-accent">Saved</span>
                )}
                {state === "error" && (
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    Failed to save
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 dark:text-neutral-600">
              Open an article to start taking notes on it.
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close notes widget" : "Open notes widget"}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform hover:scale-105 active:scale-95 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {open ? "×" : "✎"}
      </button>
    </div>
  );
}
