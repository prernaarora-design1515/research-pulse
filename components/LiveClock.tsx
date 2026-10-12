"use client";

import { useEffect, useState } from "react";

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Sync from the external clock immediately, then every second.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden items-center gap-2 text-xs text-neutral-500 sm:flex dark:text-neutral-400">
      <span className="tabular-nums">{now ? formatTime(now) : "--:--:--"}</span>
      <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
      <span>{now ? formatDate(now) : "---"}</span>
    </div>
  );
}
