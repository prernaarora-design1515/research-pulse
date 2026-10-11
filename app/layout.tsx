import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import ThemeScript from "@/components/ThemeScript";
import ThemeToggle from "@/components/ThemeToggle";
import LiveClock from "@/components/LiveClock";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Research Pulse",
  description: "Weekly AI/ML research brief, scanned, scored and summarised by domain.",
};

const NAV_ITEMS = [
  { href: "/", label: "brief" },
  { href: "/archive", label: "archive" },
  { href: "/saved", label: "saved" },
  { href: "/settings", label: "settings" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col font-mono">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80 sticky top-0 z-10">
          <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900 dark:text-neutral-100"
              >
                <span className="text-accent">●</span>
                research_pulse
                <span className="animate-caret text-accent">_</span>
              </Link>
              <div className="flex flex-wrap items-center gap-x-1 text-xs text-slate-500 dark:text-neutral-400">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded px-2 py-1 transition-colors hover:text-accent"
                  >
                    <span className="text-slate-300 group-hover:text-accent dark:text-neutral-700">
                      /
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LiveClock />
              <ThemeToggle />
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-slate-200 px-4 py-4 text-center text-[11px] text-slate-400 sm:px-6 dark:border-neutral-800 dark:text-neutral-600">
          the system narrows. kavita chooses.
        </footer>
      </body>
    </html>
  );
}
