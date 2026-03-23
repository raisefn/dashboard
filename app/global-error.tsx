"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-zinc-950 text-zinc-100 min-h-screen">
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <h2 className="text-xl font-semibold text-zinc-200 mb-2">
            Something went seriously wrong
          </h2>
          <p className="text-zinc-400 mb-6 text-sm">
            {error.message || "A critical error occurred."}
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-teal-400 text-zinc-950 text-sm font-medium hover:bg-teal-300 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
