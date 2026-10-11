export default function Loading() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-200/70" />
      ))}
    </div>
  );
}
