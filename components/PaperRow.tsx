"use client";

import type { BriefItemView } from "@/lib/db/briefQueries";
import PaperArt from "./PaperArt";
import PriorityStamp from "./PriorityStamp";
import { Tilt } from "./Motion";

function PaperTile({
  item,
  featured,
  onOpen,
}: {
  item: BriefItemView;
  featured: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className={`group flex flex-col gap-3 rounded-2xl p-2.5 text-left ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
    >
      <Tilt className="sketch-frame relative rounded-2xl">
        <PaperArt
          seed={item.paperId}
          alt={item.title}
          className={featured ? "aspect-[16/10] w-full" : "aspect-[4/3] w-full"}
        />
        <PriorityStamp priority={item.priority} className="absolute bottom-3 right-3" />
      </Tilt>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
          {item.selectionReason}
        </p>
        <h3
          className={`mt-0.5 font-display leading-snug text-neutral-900 group-hover:text-accent dark:text-neutral-100 line-clamp-2 ${
            featured ? "text-xl" : "text-sm"
          }`}
        >
          {item.title}
        </h3>
        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-500">
          {item.authors[0]}
          {item.authors.length > 1 ? " et al." : ""} &middot; {item.publishedAt.slice(0, 10)}
        </p>
      </div>
    </button>
  );
}

export default function PaperRow({
  items,
  onOpen,
}: {
  items: BriefItemView[];
  onOpen: (item: BriefItemView) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="py-10 text-sm text-neutral-400 dark:text-neutral-600">
        Nothing significant surfaced this week in this domain.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, i) => (
        <PaperTile key={item.paperId} item={item} featured={i === 0} onOpen={() => onOpen(item)} />
      ))}
    </div>
  );
}
