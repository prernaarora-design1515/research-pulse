"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Brief" },
  { href: "/archive", label: "Archive" },
  { href: "/saved", label: "Saved" },
  { href: "/settings", label: "Settings" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative py-1 transition-colors ${
              active
                ? "font-medium text-accent"
                : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            {item.label}
            {active && (
              <span className="absolute -bottom-[1px] left-0 h-[2px] w-full bg-accent" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
