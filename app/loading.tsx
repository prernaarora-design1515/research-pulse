export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200/60 dark:bg-neutral-800/60" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-200/50 dark:bg-neutral-800/50"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
