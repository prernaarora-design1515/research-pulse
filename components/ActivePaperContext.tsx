"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type ActivePaper = { paperId: number; title: string } | null;

const ActivePaperCtx = createContext<{
  activePaper: ActivePaper;
  setActivePaper: (p: ActivePaper) => void;
} | null>(null);

export function ActivePaperProvider({ children }: { children: ReactNode }) {
  const [activePaper, setActivePaper] = useState<ActivePaper>(null);
  return (
    <ActivePaperCtx.Provider value={{ activePaper, setActivePaper }}>
      {children}
    </ActivePaperCtx.Provider>
  );
}

const noop = { activePaper: null as ActivePaper, setActivePaper: () => {} };

// Degrades to a no-op instead of throwing: a missing provider should only
// disable the notes link-up, never take the whole page down.
export function useActivePaper() {
  return useContext(ActivePaperCtx) ?? noop;
}
