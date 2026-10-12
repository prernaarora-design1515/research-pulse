"use client";

import { useState } from "react";

export type Priority = "low" | "medium" | "high";

const textClass: Record<string, string> = {
  high: "text-red-700 dark:text-red-400",
  medium: "text-amber-700 dark:text-amber-400",
  low: "text-slate-500 dark:text-neutral-400",
};

export default function PriorityDropdown({
  briefItemId,
  initialPriority,
  onChanged,
}: {
  briefItemId: number;
  initialPriority: string;
  onChanged?: (next: Priority) => void;
}) {
  const [priority, setPriority] = useState(initialPriority);
  const [saving, setSaving] = useState(false);

  async function choose(next: Priority) {
    const prev = priority;
    setPriority(next);
    setSaving(true);
    try {
      const res = await fetch("/api/brief-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: briefItemId, priority: next }),
      });
      if (!res.ok) {
        setPriority(prev);
      } else {
        onChanged?.(next);
      }
    } catch {
      setPriority(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={priority}
      disabled={saving}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => choose(e.target.value as Priority)}
      className={`cursor-pointer rounded border-none bg-transparent px-1 py-0.5 text-[11px] font-medium transition-colors hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 dark:hover:bg-neutral-800 ${
        textClass[priority] ?? ""
      }`}
    >
      <option value="high">● high</option>
      <option value="medium">● medium</option>
      <option value="low">● low</option>
    </select>
  );
}
