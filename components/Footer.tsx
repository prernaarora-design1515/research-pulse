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
    <footer className="mt-16 bg-[#141816] text-[#f1f1f1]">
      <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
        <p className="text-justify-last font-display text-4xl font-bold uppercase leading-[0.95] tracking-[-0.04em] sm:text-6xl">
          A system that narrows your weekly research reading. Nothing is hidden, only ranked.
        </p>

        <div className="mt-14 grid grid-cols-2 gap-8 font-mono text-[12px] uppercase sm:grid-cols-4">
          <div>
            <p className="mb-3 text-[#f1f1f1]/50">(Navigate)</p>
            <ul className="space-y-1.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-opacity hover:opacity-60">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[#f1f1f1]/50">(Resources)</p>
            <ul className="space-y-1.5">
              {RESOURCE_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-opacity hover:opacity-60"
                  >
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[#f1f1f1]/50">(Schedule)</p>
            <p>Every Monday</p>
            <p>07:00 IST</p>
          </div>
          <div>
            <p className="mb-3 text-[#f1f1f1]/50">(Stack)</p>
            <p>Next.js · Neon</p>
            <p>Gemini · Resend</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden pt-10">
        <p
          className="select-none whitespace-nowrap text-center font-display text-[19vw] font-extrabold uppercase leading-[0.78] tracking-[-0.06em] text-transparent"
          style={{ WebkitTextStroke: "1px rgba(241,241,241,0.35)" }}
        >
          Research
        </p>
      </div>

      <div className="mx-auto flex max-w-6xl justify-between px-5 py-5 font-mono text-[11px] uppercase text-[#f1f1f1]/50 sm:px-8">
        <span>&copy;{new Date().getFullYear()} Research Pulse</span>
        <span>The system narrows · Kavita chooses</span>
      </div>
    </footer>
  );
}
