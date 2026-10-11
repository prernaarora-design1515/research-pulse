"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="animate-fade-in-up rounded border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
      <p className="mb-1 text-xs text-red-500">{"// error"}</p>
      <h1 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-300">
        something went wrong
      </h1>
      <p className="mb-4 text-sm text-red-700 dark:text-red-400">
        {error.message || "an unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-red-800 active:scale-95"
      >
        try again
      </button>
    </div>
  );
}
