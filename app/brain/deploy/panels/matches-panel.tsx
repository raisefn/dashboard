"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Panel } from "./use-panel-state";

/**
 * Matches list panel — the in-place replacement for /brain/matches.
 * Uses the same /v1/brain/matches/mine endpoint as the legacy page,
 * with the same batch selector + per-row Generate brief flow.
 *
 * Click an investor name → opens Investor detail panel (wired here as
 * onOpenInvestor; landing in Step 6).
 */

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

type Batch = {
  id: string;
  generated_at: string | null;
  request?: {
    sector?: string;
    stage?: string;
    raising_usd?: number | null;
    region?: string | null;
    country?: string | null;
    state?: string | null;
    investor_type?: string | null;
  } | null;
  individuals_to_target?: Investor[];
  firms_to_consider?: Investor[];
  count?: number;
};

type ExistingBrief = {
  token: string;
  investor_full_name: string | null;
  investor_first_name: string | null;
  created_at: string | null;
};

interface MatchesPanelProps {
  session: Session | null;
  impersonating: string;
  onOpenPanel: (p: Panel) => void;
}

function fmtMoney(n?: number | null): string | null {
  if (!n) return null;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function batchLabel(b: Batch, idx: number, total: number): string {
  const pos = total - idx;
  const when = b.generated_at ? new Date(b.generated_at) : null;
  const dateStr = when ? when.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  const r = b.request || {};
  const sector = r.sector || "";
  const stage = r.stage || "";
  // Surface the user-intent filters from the request, not just the
  // founder profile sector+stage. If the founder asked for "LATAM matches"
  // or "VC-only", the dropdown should say so — the batch IS the search.
  const geo = r.region || [r.country, r.state].filter(Boolean).join("/") || "";
  const itype = r.investor_type ? `${r.investor_type} only` : "";
  const meta = [sector, stage, geo, itype].filter(Boolean).join(" · ");
  const count = b.count != null ? `${b.count} match${b.count === 1 ? "" : "es"}` : "";
  const parts = [dateStr, count, meta].filter(Boolean);
  return `Batch ${pos} — ${parts.join(" · ")}`;
}

export function MatchesPanel({ session, impersonating, onOpenPanel }: MatchesPanelProps) {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<ExistingBrief[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ key: string; msg: string } | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/matches/mine", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load matches (${res.status})`);
      }
      const data = await res.json();
      const incomingBatches: Batch[] = data.batches || [];
      setBatches(incomingBatches);
      setActiveBatchId((prev) => {
        if (prev && incomingBatches.some((b) => b.id === prev)) return prev;
        return incomingBatches[0]?.id || null;
      });
      setBriefs(data.briefs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }, [session, impersonating]);

  useEffect(() => {
    void fetchMatches();
  }, [fetchMatches]);

  // Refresh when a new batch lands (chat fires match_investors).
  useEffect(() => {
    function onUpdate() { void fetchMatches(); }
    window.addEventListener("raisefn:matches_updated", onUpdate);
    window.addEventListener("raisefn:briefs_updated", onUpdate);
    return () => {
      window.removeEventListener("raisefn:matches_updated", onUpdate);
      window.removeEventListener("raisefn:briefs_updated", onUpdate);
    };
  }, [fetchMatches]);

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
      const founderEmail = (impersonating || session.user.email || "").toLowerCase();
      const firmName = inv.firm_name || (inv.kind === "firm" ? inv.name : null);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/generate-brief", {
        method: "POST",
        headers,
        body: JSON.stringify({
          founder_email: founderEmail,
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
      // Open the new brief in the in-app brief panel rather than a new tab.
      // The brief detail panel + markdown endpoint land in Step 8; until
      // then fall back to opening the public token URL in a new tab.
      const token = data.url ? String(data.url).split("/").pop() : null;
      if (token) {
        onOpenPanel({ kind: "brief", token, from: { kind: "matches" } });
      } else if (data.url) {
        window.open(data.url, "_blank", "noopener");
      }
      try { window.dispatchEvent(new CustomEvent("raisefn:briefs_updated")); } catch { /* defensive */ }
      await fetchMatches();
    } catch (e) {
      setRowError({ key, msg: e instanceof Error ? e.message : "Brief generation failed." });
    } finally {
      setGeneratingKey(null);
    }
  }

  if (loading) {
    return (
      <div className="mp-state">
        <p className="mp-state-text">Loading matches…</p>
      </div>
    );
  }

  const activeBatch = batches.find((b) => b.id === activeBatchId) || batches[0] || null;
  const individuals = activeBatch?.individuals_to_target || [];
  const firms = activeBatch?.firms_to_consider || [];
  const ordered: Investor[] = [...individuals, ...firms];

  return (
    <div className="matches-panel">
      <style>{MATCHES_PANEL_CSS}</style>

      {/* Batch selector + context */}
      {batches.length > 1 ? (
        <div className="mp-batch-row">
          <select
            value={activeBatchId || ""}
            onChange={(e) => setActiveBatchId(e.target.value)}
            className="mp-batch-select"
          >
            {batches.map((b, idx) => (
              <option key={b.id} value={b.id}>
                {batchLabel(b, idx, batches.length)}
              </option>
            ))}
          </select>
        </div>
      ) : activeBatch?.generated_at ? (
        <div className="mp-context-line">
          Generated {new Date(activeBatch.generated_at).toLocaleString()}
        </div>
      ) : null}

      {error && <div className="mp-error">{error}</div>}

      {!activeBatch || ordered.length === 0 ? (
        <div className="mp-empty">
          <p className="mp-empty-title">No matches yet.</p>
          <p className="mp-empty-sub">Head back to chat and ask raise(fn) to pull matches.</p>
        </div>
      ) : (
        <div className="mp-list">
          {ordered.map((inv, idx) => {
            const existing = findExistingBrief(inv.name);
            // Defensive cap at 100 — backend now caps `normalized` at 1.0
            // (brain 2e3bf6a) but some matcher paths still pass raw
            // final_score / composite_max which can overflow on strong matches.
            // Belt-and-suspenders so a future regression doesn't show >100% again.
            const score = inv.score && inv.score_max ? Math.min(100, Math.round((inv.score / inv.score_max) * 100)) : null;
            const key = rowKey(inv, idx);
            const isGenerating = generatingKey === key;
            const errMsg = rowError?.key === key ? rowError.msg : null;
            const subtitleParts: string[] = [];
            if (inv.kind === "individual" && inv.firm_name) subtitleParts.push(inv.firm_name);
            if (inv.title) subtitleParts.push(inv.title);
            const facts: string[] = [];
            if (inv.focus_stages && inv.focus_stages.length > 0) {
              facts.push(inv.focus_stages.slice(0, 2).join(", "));
            }
            if (inv.check_size_min || inv.check_size_max) {
              facts.push(`${fmtMoney(inv.check_size_min) || "?"}–${fmtMoney(inv.check_size_max) || "?"}`);
            }
            if (inv.focus_sectors && inv.focus_sectors.length > 0) {
              facts.push(inv.focus_sectors.slice(0, 2).join(" / "));
            }
            return (
              <div key={key} className="mp-card">
                <div className="mp-card-row">
                  <div className="mp-card-main">
                    <div className="mp-card-title-line">
                      <button
                        type="button"
                        className="mp-card-name"
                        onClick={() => {
                          if (inv.slug) {
                            onOpenPanel({ kind: "investor", slug: inv.slug, from: { kind: "matches" } });
                          }
                        }}
                        title={inv.slug ? "Click to view full profile" : undefined}
                      >
                        {inv.name || "Unknown"}
                      </button>
                      {subtitleParts.length > 0 && (
                        <span className="mp-card-subtitle">{subtitleParts.join(" · ")}</span>
                      )}
                    </div>
                    {(inv.thesis || inv.description) && (
                      <p className="mp-card-thesis">{inv.thesis || inv.description}</p>
                    )}
                    {facts.length > 0 && (
                      <div className="mp-card-facts">
                        {facts.map((f, i) => <span key={i}>{f}</span>)}
                      </div>
                    )}
                    {errMsg && <p className="mp-card-error">{errMsg}</p>}
                  </div>
                  <div className="mp-card-actions">
                    {score !== null && (
                      <span className="mp-card-fit">fit {score}%</span>
                    )}
                    {existing ? (
                      <button
                        type="button"
                        className="mp-btn mp-btn-secondary"
                        onClick={() => onOpenPanel({ kind: "brief", token: existing.token, from: { kind: "matches" } })}
                      >
                        View brief →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => generateForInvestor(inv, idx)}
                        disabled={isGenerating}
                        className="mp-btn mp-btn-primary"
                      >
                        {isGenerating ? "Generating…" : "Generate brief"}
                      </button>
                    )}
                    {inv.linkedin && (
                      <a
                        href={inv.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mp-card-linkedin"
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
    </div>
  );
}

const MATCHES_PANEL_CSS = `
  .matches-panel { color: #d4d4d8; }

  .mp-state { padding: 32px 8px; }
  .mp-state-text { font-size: 13px; color: #71717a; margin: 0; }

  .mp-batch-row { margin-bottom: 16px; }
  .mp-batch-select {
    width: 100%;
    background: rgba(24, 24, 27, 0.6);
    border: 1px solid #3f3f46;
    color: #e4e4e7;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-family: inherit;
    outline: none;
    cursor: pointer;
  }
  .mp-batch-select:focus { border-color: #2dd4bf; }

  .mp-context-line {
    margin-bottom: 16px;
    font-size: 11px;
    color: #71717a;
  }

  .mp-error {
    margin-bottom: 16px;
    padding: 10px 14px;
    border: 1px solid rgba(127, 29, 29, 0.6);
    background: rgba(69, 10, 10, 0.4);
    color: #fca5a5;
    border-radius: 6px;
    font-size: 13px;
  }

  .mp-empty {
    margin-top: 32px;
    padding: 32px 16px;
    border: 1px solid #27272a;
    background: rgba(24, 24, 27, 0.4);
    border-radius: 8px;
    text-align: center;
  }
  .mp-empty-title { margin: 0 0 6px; font-size: 14px; color: #d4d4d8; }
  .mp-empty-sub { margin: 0; font-size: 12px; color: #71717a; }

  .mp-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mp-card {
    border: 1px solid #27272a;
    background: rgba(24, 24, 27, 0.4);
    border-radius: 8px;
    padding: 14px 16px;
    transition: border-color 150ms ease;
  }
  .mp-card:hover { border-color: #3f3f46; }

  .mp-card-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }
  .mp-card-main { flex: 1; min-width: 0; }
  .mp-card-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }

  .mp-card-title-line {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6px;
  }
  .mp-card-name {
    background: none;
    border: none;
    color: #f4f4f5;
    font-size: 14px;
    font-weight: 600;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
    transition: color 150ms ease;
  }
  .mp-card-name:hover {
    color: #2dd4bf;
    text-decoration: underline;
  }
  .mp-card-subtitle {
    font-size: 12px;
    color: #71717a;
  }
  .mp-card-thesis {
    margin: 6px 0 0;
    font-size: 13px;
    color: #a1a1aa;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .mp-card-facts {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
    font-size: 11px;
    color: #71717a;
  }
  .mp-card-error { margin: 6px 0 0; font-size: 11px; color: #fca5a5; }

  .mp-card-fit {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #71717a;
  }

  .mp-btn {
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
    border: 1px solid transparent;
    transition: all 150ms ease;
  }
  .mp-btn:disabled { opacity: 0.6; cursor: wait; }
  .mp-btn-primary {
    background: #14b8a6;
    color: #f4f4f5;
  }
  .mp-btn-primary:hover:not(:disabled) {
    background: #0d9488;
  }
  .mp-btn-secondary {
    background: transparent;
    color: #2dd4bf;
    border-color: rgba(45, 212, 191, 0.4);
  }
  .mp-btn-secondary:hover {
    background: rgba(45, 212, 191, 0.08);
    border-color: rgba(45, 212, 191, 0.6);
  }

  .mp-card-linkedin {
    font-size: 10px;
    color: #71717a;
    text-decoration: none;
    transition: color 150ms ease;
  }
  .mp-card-linkedin:hover { color: #a1a1aa; }
`;
