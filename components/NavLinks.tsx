"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scribble } from "./Motion";

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
            className={`group relative py-1 transition-colors ${
              active
                ? "font-medium text-accent"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            <span className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:-rotate-2">
              {item.label}
            </span>
            <Scribble on={active} />
          </Link>
        );
      })}
    </div>
  );
}
