"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";

type Investor = {
  kind?: "firm" | "individual";
  slug?: string;
  name?: string;
  firm_name?: string | null;
  title?: string | null;
  thesis?: string | null;
  focus_sectors?: string[] | null;
  focus_stages?: string[] | null;
  focus_countries?: string[] | null;
  check_size_min?: number | null;
  check_size_max?: number | null;
  is_deploying?: boolean | null;
  hq_location?: string | null;
  score?: number;
  score_max?: number;
  score_breakdown?: Record<string, number>;
  match_reasons?: string[];
  data_source?: string;
  openvc_url?: string | null;
  type?: string | null;
  description?: string | null;
  linkedin?: string | null;
};

type MatchListPayload = {
  generated_at?: string;
  request?: { sector?: string; stage?: string; raising_usd?: number | null };
  company?: { sector?: string; stage?: string; raising_usd?: number | null };
  individuals_to_target?: Investor[];
  firms_to_consider?: Investor[];
  data_quality?: { candidate_investors_found?: number; note?: string };
};

type ExistingBrief = {
  token: string;
  investor_full_name: string | null;
  investor_first_name: string | null;
  created_at: string | null;
};

function fmtMoney(n?: number | null): string | null {
  if (!n) return null;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

export default function MatchesPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchListPayload | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<ExistingBrief[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ key: string; msg: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) { router.replace("/login"); return; }
      setSession(s);
    });
  }, [router]);

  const fetchMatches = useCallback(async (s: Session) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/v1/brain/matches/mine", {
        headers: { Authorization: `Bearer ${s.access_token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load matches (${res.status})`);
      }
      const data = await res.json();
      setMatches(data.match_list);
      setGeneratedAt(data.generated_at);
      setBriefs(data.briefs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchMatches(session);
  }, [session, fetchMatches]);

  function findExistingBrief(name?: string | null): ExistingBrief | null {
    if (!name) return null;
    const want = name.toLowerCase().trim();
    return briefs.find((b) => (b.investor_full_name || "").toLowerCase().trim() === want) || null;
  }

  function rowKey(inv: Investor, idx: number): string {
    return inv.slug || `${inv.name || "unknown"}-${idx}`;
  }

  async function generateForInvestor(inv: Investor, idx: number) {
    if (!session) return;
    const key = rowKey(inv, idx);
    setGeneratingKey(key);
    setRowError(null);
    try {
      const founderEmail = (session.user.email || "").toLowerCase();
      const firmName = inv.firm_name || (inv.kind === "firm" ? inv.name : null);
      const res = await fetch("/v1/brain/generate-brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          founder_email: founderEmail,
          // No investor_email — server synthesizes a stable internal address
          // from inline.name + firm so repeat clicks dedupe to the same stub.
          investor_inline: {
            name: inv.name || "",
            firm: firmName || null,
            title: inv.title || null,
            thesis: inv.thesis || inv.description || null,
            website: inv.openvc_url || null,
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Brief generation failed (${res.status})`);
      }
      const data = await res.json();
      // Open the brief in a new tab and refresh the list so this row flips
      // to "View brief" via the briefs[] dedupe by investor name.
      window.open(data.url, "_blank", "noopener");
      if (session) await fetchMatches(session);
    } catch (e) {
      setRowError({ key, msg: e instanceof Error ? e.message : "Brief generation failed." });
    } finally {
      setGeneratingKey(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-300 flex items-center justify-center">
        <p className="text-sm text-zinc-500">Loading matches…</p>
      </main>
    );
  }

  const individuals = matches?.individuals_to_target || [];
  const firms = matches?.firms_to_consider || [];
  const ordered: Investor[] = [...individuals, ...firms];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold text-zinc-100">
            raise<span className="text-teal-400">(fn)</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs text-zinc-400">
            <Link href="/brain/deploy" className="hover:text-zinc-200">Chat</Link>
            <Link href="/brain/matches" className="text-teal-300">Matches</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-100">Your matches</h1>
          {generatedAt && (
            <span className="text-xs text-zinc-500">Generated {new Date(generatedAt).toLocaleString()}</span>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!matches || ordered.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-10 text-center">
            <p className="text-sm text-zinc-400 mb-3">No matches yet.</p>
            <p className="text-xs text-zinc-500 mb-5">Head back to chat and ask the brain to pull matches.</p>
            <Link href="/brain/deploy" className="inline-block rounded-md bg-teal-600 hover:bg-teal-500 px-4 py-2 text-sm font-medium text-white">
              Open chat
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {ordered.map((inv, idx) => {
              const existing = findExistingBrief(inv.name);
              const score = inv.score && inv.score_max ? Math.round((inv.score / inv.score_max) * 100) : null;
              const key = rowKey(inv, idx);
              const isGenerating = generatingKey === key;
              const errMsg = rowError?.key === key ? rowError.msg : null;
              return (
                <div
                  key={key}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-zinc-100">{inv.name || "Unknown"}</span>
                        {inv.firm_name && inv.kind === "individual" && (
                          <span className="text-xs text-zinc-500">@ {inv.firm_name}</span>
                        )}
                        {inv.title && (
                          <span className="text-xs text-zinc-500">· {inv.title}</span>
                        )}
                        {score !== null && (
                          <span className="text-[11px] uppercase tracking-wide rounded bg-zinc-800 text-zinc-300 px-1.5 py-0.5">
                            fit {score}%
                          </span>
                        )}
                        {inv.kind === "firm" && (
                          <span className="text-[11px] uppercase tracking-wide rounded bg-zinc-800 text-zinc-400 px-1.5 py-0.5">
                            firm
                          </span>
                        )}
                        {inv.data_source && inv.data_source !== "raisefn_network" && (
                          <span className="text-[11px] text-zinc-600">via {inv.data_source}</span>
                        )}
                      </div>
                      {(inv.thesis || inv.description) && (
                        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{inv.thesis || inv.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-zinc-500">
                        {(inv.check_size_min || inv.check_size_max) && (
                          <span>
                            check {fmtMoney(inv.check_size_min) || "?"}–{fmtMoney(inv.check_size_max) || "?"}
                          </span>
                        )}
                        {inv.focus_sectors && inv.focus_sectors.length > 0 && (
                          <span>sectors {inv.focus_sectors.slice(0, 3).join(", ")}</span>
                        )}
                        {inv.focus_stages && inv.focus_stages.length > 0 && (
                          <span>stages {inv.focus_stages.slice(0, 3).join(", ")}</span>
                        )}
                        {inv.hq_location && <span>{inv.hq_location}</span>}
                      </div>
                      {inv.match_reasons && inv.match_reasons.length > 0 && (
                        <ul className="text-[11px] text-zinc-500 mt-2 space-y-0.5">
                          {inv.match_reasons.slice(0, 2).map((r, i) => (
                            <li key={i}>· {r}</li>
                          ))}
                        </ul>
                      )}
                      {errMsg && (
                        <p className="text-[11px] text-red-400 mt-2">{errMsg}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {existing ? (
                        <a
                          href={`/brief/${existing.token}`}
                          target="_blank"
                          rel="noopener"
                          className="text-xs rounded-md border border-teal-700/60 hover:border-teal-500 text-teal-300 px-3 py-1.5"
                        >
                          View brief
                        </a>
                      ) : (
                        <button
                          onClick={() => generateForInvestor(inv, idx)}
                          disabled={isGenerating}
                          className="text-xs rounded-md bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-wait text-white px-3 py-1.5"
                        >
                          {isGenerating ? "Generating…" : "Generate brief"}
                        </button>
                      )}
                      {inv.linkedin && (
                        <a
                          href={inv.linkedin}
                          target="_blank"
                          rel="noopener"
                          className="text-[11px] text-zinc-500 hover:text-zinc-300"
                        >
                          LinkedIn ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {briefs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-medium text-zinc-300 mb-2">Briefs you&apos;ve generated</h2>
            <ul className="space-y-1.5">
              {briefs.map((b) => (
                <li key={b.token} className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-1.5">
                  <span>{b.investor_full_name || "(unnamed)"}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-zinc-600">{b.created_at ? new Date(b.created_at).toLocaleDateString() : ""}</span>
                    <a href={`/brief/${b.token}`} target="_blank" rel="noopener" className="text-teal-300 hover:text-teal-200">
                      Open
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

    </main>
  );
}
