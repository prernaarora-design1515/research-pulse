import type { Metadata } from "next";
import Link from "next/link";
import ThemeScript from "@/components/ThemeScript";
import ThemeToggle from "@/components/ThemeToggle";
import LiveClock from "@/components/LiveClock";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Pulse",
  description: "Weekly AI/ML research brief, scanned, scored and summarised by domain.",
};

const NAV_ITEMS = [
  { href: "/", label: "Brief" },
  { href: "/archive", label: "Archive" },
  { href: "/saved", label: "Saved" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-[#faf9f7]/90 backdrop-blur-sm dark:border-neutral-800/80 dark:bg-[#0a0b0d]/90">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-8">
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-neutral-100"
            >
              Research Pulse
            </Link>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500 dark:text-neutral-400">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative py-1 transition-colors hover:text-slate-900 dark:hover:text-neutral-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <LiveClock />
              <ThemeToggle />
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">{children}</main>
        <footer className="border-t border-slate-200/80 px-5 py-6 text-center text-xs text-slate-400 sm:px-8 dark:border-neutral-800/80 dark:text-neutral-600">
          The system narrows. Kavita chooses.
        </footer>
      </body>
    </html>
  );
}
