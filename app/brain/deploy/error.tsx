"use client";

export default function BrainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h2 className="text-xl font-semibold text-zinc-200 mb-2">
        Brain went down
      </h2>
      <p className="text-zinc-400 mb-6 text-sm">
        {error.message || "Something broke in the brain. Give it another shot."}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md bg-teal-400 text-zinc-950 text-sm font-medium hover:bg-teal-300 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
