"use client";

import { useState } from "react";
import Link from "next/link";

export default function TrackerCTA() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-900/30 bg-zinc-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <p className="text-sm text-zinc-300">
          <span className="text-orange-400 font-medium">Raising capital?</span>{" "}
          Get matched with the right investors for your raise.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-orange-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-orange-500"
          >
            Get matched with investors
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-zinc-600 hover:text-zinc-400 transition-colors text-lg leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}
