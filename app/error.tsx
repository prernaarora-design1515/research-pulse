"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <h1 className="mb-2 text-lg font-semibold text-red-800">Something went wrong</h1>
      <p className="mb-4 text-sm text-red-700">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
      >
        Try again
      </button>
    </div>
  );
}
