export default function EmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in-up rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <h1 className="mb-2 text-lg font-semibold text-slate-700 dark:text-neutral-300">{title}</h1>
      <p className="text-sm text-slate-500 dark:text-neutral-500">{children}</p>
    </div>
  );
}
