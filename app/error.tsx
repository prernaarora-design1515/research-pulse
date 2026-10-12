"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="animate-fade-in-up border-2 border-red-800 bg-red-50 p-8 text-center dark:border-red-500/40 dark:bg-red-500/10">
      <h1 className="mb-2 font-display text-xl font-semibold text-red-800 dark:text-red-300">
        Something went wrong
      </h1>
      <p className="mb-4 text-sm text-red-700 dark:text-red-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="bg-red-800 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-transform hover:bg-red-900 active:scale-95"
      >
        Try again
      </button>
    </div>
  );
}
