export default function EmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in-up rounded-2xl bg-neutral-50 p-10 text-center dark:bg-neutral-900">
      <h1 className="mb-2 font-display text-xl font-semibold text-neutral-700 dark:text-neutral-300">
        {title}
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-500">{children}</p>
    </div>
  );
}
