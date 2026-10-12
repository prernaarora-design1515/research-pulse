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

export function useActivePaper() {
  const ctx = useContext(ActivePaperCtx);
  if (!ctx) throw new Error("useActivePaper must be used within ActivePaperProvider");
  return ctx;
}
