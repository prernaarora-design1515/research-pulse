export default function Loading() {
  return (
    <div className="space-y-4">
      <p className="animate-pulse text-xs text-accent">{"// loading_"}</p>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded border border-slate-200 bg-slate-200/50 dark:border-neutral-800 dark:bg-neutral-800/50"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}
