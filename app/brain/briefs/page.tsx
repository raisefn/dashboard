"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";
import BrainTabs from "@/components/brain-tabs";

type Brief = {
  token: string;
  investor_full_name: string | null;
  investor_first_name: string | null;
  created_at: string | null;
};

export default function BriefsPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) {
        router.replace("/login");
        return;
      }
      setSession(s);
    });
  }, [router]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/v1/brain/matches/mine", {
          headers: { Authorization: `Bearer ${session!.access_token}` },
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || `Failed to load briefs (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) {
          setBriefs(Array.isArray(data.briefs) ? data.briefs : []);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load briefs.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-300 flex items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <BrainTabs />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
            Your briefs
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            One-page briefs you&apos;ve generated. Each lives at a stable URL — share with the investor or keep for outreach prep.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {briefs.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-6 py-10 text-center">
            <p className="text-sm text-zinc-300 mb-3">No briefs yet.</p>
            <p className="text-xs text-zinc-500 mb-5 max-w-md mx-auto leading-relaxed">
              Briefs are generated from your matches. Open the chat, ask the brain for investor matches, then click <span className="text-zinc-300">+ brief</span> next to any name.
            </p>
            <Link
              href="/brain/matches"
              className="inline-block rounded-md bg-teal-600 hover:bg-teal-500 px-4 py-2 text-sm font-medium text-white"
            >
              Go to matches
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {briefs.map((b) => (
              <li
                key={b.token}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors px-5 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-base font-medium text-zinc-100 truncate">
                      {b.investor_full_name || "(unnamed)"}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {b.created_at
                        ? `Generated ${new Date(b.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
                        : ""}
                    </div>
                  </div>
                  <a
                    href={`/brief/${b.token}`}
                    target="_blank"
                    rel="noopener"
                    className="text-sm rounded-md border border-teal-700/60 hover:border-teal-500 text-teal-300 px-4 py-2 font-medium shrink-0"
                  >
                    Open →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
