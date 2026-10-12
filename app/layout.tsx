import type { Metadata } from "next";
import { Inter_Tight, Azeret_Mono } from "next/font/google";
import Link from "next/link";
import ThemeScript from "@/components/ThemeScript";
import ThemeToggle from "@/components/ThemeToggle";
import LiveClock from "@/components/LiveClock";
import NavLinks from "@/components/NavLinks";
import Footer from "@/components/Footer";
import NotesWidget from "@/components/NotesWidget";
import { ActivePaperProvider } from "@/components/ActivePaperContext";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const azeret = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
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
      className={`h-full antialiased ${interTight.variable} ${azeret.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col font-display">
        <ActivePaperProvider>
          <header className="sticky top-0 z-10 bg-[#f9f9f9]/85 backdrop-blur-md dark:bg-[#121412]/85">
            <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 font-mono text-[13px] uppercase sm:px-8">
              <Link href="/" className="font-medium tracking-tight text-[#121212] dark:text-[#f1f1f1]">
                &copy;Research Pulse
              </Link>
              <NavLinks />
              <div className="flex items-center gap-3">
                <LiveClock />
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">{children}</main>
          <Footer />
          <NotesWidget />
        </ActivePaperProvider>
      </body>
    </html>
  );
}
