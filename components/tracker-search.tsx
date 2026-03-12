"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface Result {
  entity_type: string;
  id: string;
  name: string;
  slug: string;
  score: number;
  extra: Record<string, string>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function TrackerSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/v1/search?q=${encodeURIComponent(value)}&limit=8`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function navigate(result: Result) {
    setOpen(false);
    setQuery("");
    setResults([]);
    if (result.entity_type === "project") {
      router.push(`/tracker/projects/${result.slug}`);
    } else if (result.entity_type === "investor") {
      router.push(`/tracker/investors/${result.slug}`);
    }
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search projects & investors..."
        className="w-40 sm:w-56 rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-zinc-600 focus:bg-zinc-800 transition-colors"
      />
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="h-3 w-3 animate-spin rounded-full border border-zinc-600 border-t-zinc-400" />
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl z-50 overflow-hidden">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(r)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-zinc-800 transition-colors"
            >
              <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-500">
                {r.entity_type === "project" ? "proj" : "inv"}
              </span>
              <span className="flex-1 truncate text-sm text-zinc-200">
                {r.name}
              </span>
              {r.extra?.sector && (
                <span className="text-xs text-zinc-600 capitalize">
                  {r.extra.sector.replace(/_/g, " ")}
                </span>
              )}
              {r.extra?.type && (
                <span className="text-xs text-zinc-600">
                  {r.extra.type}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl z-50 p-3 text-center text-xs text-zinc-500">
          No results
        </div>
      )}
    </div>
  );
}
