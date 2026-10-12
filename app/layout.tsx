import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import Link from "next/link";
import ThemeScript from "@/components/ThemeScript";
import ThemeToggle from "@/components/ThemeToggle";
import LiveClock from "@/components/LiveClock";
import NavLinks from "@/components/NavLinks";
import CursorBlob from "@/components/CursorBlob";
import Footer from "@/components/Footer";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Research Pulse",
  description: "Weekly AI/ML research brief, scanned, scored and summarised by domain.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${bodoni.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <div
          aria-hidden
          className="grain-overlay pointer-events-none fixed inset-0 z-[999] opacity-[0.07] mix-blend-overlay"
        />
        <CursorBlob />
        <header className="sticky top-0 z-10 border-b-2 border-slate-900 bg-white/90 backdrop-blur-sm dark:border-neutral-100 dark:bg-black/90">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-8">
            <Link
              href="/"
              className="font-display text-xl font-black italic tracking-tight text-slate-900 dark:text-neutral-100"
            >
              Research Pulse
            </Link>
            <NavLinks />
            <div className="flex items-center gap-3">
              <LiveClock />
              <ThemeToggle />
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
