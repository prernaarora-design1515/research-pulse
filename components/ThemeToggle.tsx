"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "system" | "light" | "dark";

const MODES: { value: Mode; label: string; icon: string }[] = [
  { value: "system", label: "system", icon: "◧" },
  { value: "light", label: "light", icon: "☼" },
  { value: "dark", label: "dark", icon: "☾" },
];

function resolve(mode: Mode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function applyTheme(mode: Mode) {
  document.documentElement.setAttribute("data-theme", resolve(mode));
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = (localStorage.getItem("rp-theme") as Mode | null) ?? "system";
    // Sync from localStorage (unavailable during SSR, so this can't be initial state).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(stored);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if ((localStorage.getItem("rp-theme") as Mode | null ?? "system") === "system") {
        applyTheme("system");
      }
    };
    mql.addEventListener("change", onSystemChange);
    return () => mql.removeEventListener("change", onSystemChange);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function choose(next: Mode) {
    setMode(next);
    localStorage.setItem("rp-theme", next);
    applyTheme(next);
    setOpen(false);
  }

  const current = MODES.find((m) => m.value === mode) ?? MODES[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme"
        className="flex h-7 w-7 items-center justify-center rounded border border-neutral-300 text-sm hover:border-accent hover:text-accent transition-transform active:scale-90 dark:border-neutral-700"
      >
        {current.icon}
      </button>
      {open && (
        <div className="animate-fade-in-up absolute right-0 top-9 z-20 w-36 overflow-hidden rounded border border-neutral-300 bg-white text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => choose(m.value)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-accent/10 ${
                mode === m.value ? "text-accent" : ""
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
              {mode === m.value && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
