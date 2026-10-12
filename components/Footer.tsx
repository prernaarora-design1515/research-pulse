import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Brief" },
  { href: "/archive", label: "Archive" },
  { href: "/saved", label: "Saved" },
  { href: "/settings", label: "Settings" },
];

const RESOURCE_LINKS = [
  { href: "https://arxiv.org", label: "arXiv.org" },
  { href: "https://github.com/prernaarora-design1515/research-pulse", label: "Source on GitHub" },
];

export default function Footer() {
  return (
    <footer className="border-t-2 border-slate-900 dark:border-neutral-100">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-5 py-12 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-slate-900 dark:text-neutral-100">
            An AI system that narrows your weekly research reading.
          </p>
          <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-neutral-500">
            Nothing is ever hidden — only ranked. Every scanned paper stays one click away.
          </p>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-600">
            Navigate
          </p>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-slate-600 transition-colors hover:text-accent dark:text-neutral-400"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-600">
            Resources
          </p>
          <ul className="space-y-2 text-sm">
            {RESOURCE_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 transition-colors hover:text-accent dark:text-neutral-400"
                >
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-600">
            Runs every Monday · 07:00 IST
          </p>
        </div>
      </div>

      <div className="overflow-hidden border-t border-slate-200 py-2 dark:border-neutral-800">
        <p className="select-none whitespace-nowrap text-center font-display text-[18vw] font-black uppercase leading-none tracking-tighter text-slate-900/[0.06] dark:text-neutral-100/[0.06]">
          Research Pulse
        </p>
      </div>

      <div className="border-t border-slate-200 px-5 py-5 text-center text-xs uppercase tracking-[0.15em] text-slate-400 sm:px-8 dark:border-neutral-800 dark:text-neutral-600">
        &copy; {new Date().getFullYear()} Research Pulse — the system narrows, Kavita chooses.
      </div>
    </footer>
  );
}
