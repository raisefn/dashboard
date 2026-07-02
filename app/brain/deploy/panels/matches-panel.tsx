"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
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
  // M3 (2026-06-30) — bucket A = observed-truth-backed, B = stated-only,
  // C is reserved for the recommended_investors (LLM-augmented) list.
  bucket?: "A" | "B" | "C";
};

// LLM-augmented recommendation — investor pulled from broad market
// knowledge (not from our catalog). See brain/match_augmentation.py.
type Recommendation = {
  name: string;
  firm?: string | null;
  thesis_summary: string;
  why_fit: string;
  recent_activity?: string | null;
  confidence: "recent_verified" | "pattern_inferred" | "historical";
  contact_hint?: string | null;
  requires_warm_intro: boolean;
  source?: string;
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
  recommended_investors?: Recommendation[];
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
  // Session-local dismissals. Optimistic: the card disappears immediately,
  // brain logs the action asynchronously. Refresh restores the card (V1
  // doesn't persist hide state — the dismiss is a TRAINING signal, not a
  // permanent founder preference). Future could add an undo toast.
  const [dismissedSlugs, setDismissedSlugs] = useState<Set<string>>(new Set());

  const dismissInvestor = useCallback(async (slug: string) => {
    if (!slug || !session) return;
    setDismissedSlugs((prev) => {
      const next = new Set(prev);
      next.add(slug);
      return next;
    });
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      await fetch("/v1/brain/outcomes/dismiss-match", {
        method: "POST",
        headers,
        body: JSON.stringify({ investor_slug: slug }),
      });
    } catch {
      // Best-effort; founder UX shouldn't depend on logging success.
    }
  }, [session, impersonating]);

  const fetchMatches = useCallback(async (signal?: AbortSignal) => {
    if (!session) return;
    setLoading(true);
    setError(null);
    // Hard client-side timeout — 30s. Backgrounded tabs sometimes leave
    // the in-flight fetch pending indefinitely; the timeout guarantees
    // we exit the loading state and the user can retry. Caught
    // 2026-06-29: matches panel got permanently stuck on "Loading
    // matches..." after a tab switch.
    const localCtl = signal ? null : new AbortController();
    const effective = signal || localCtl?.signal;
    const timeoutId = localCtl
      ? window.setTimeout(() => localCtl.abort(), 30_000)
      : null;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/matches/mine", {
        headers,
        signal: effective,
      });
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
      // AbortError fires on unmount + on our 30s timeout — both are
      // expected lifecycle events, not real errors. Surfacing them as
      // an error message would confuse the user when they navigate
      // away mid-fetch.
      if (e instanceof Error && e.name === "AbortError") {
        // Keep prior batches on screen; loading state still resets below.
      } else {
        setError(e instanceof Error ? e.message : "Failed to load matches.");
      }
    } finally {
      // GUARANTEED reset — even if fetch never resolved cleanly,
      // setLoading(false) runs so the user always escapes the loading state.
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [session, impersonating]);

  useEffect(() => {
    const ctl = new AbortController();
    void fetchMatches(ctl.signal);
    // Cancel the in-flight fetch on unmount or when deps change. Without
    // this, a backgrounded tab can leave a stale fetch lingering that
    // updates state on a now-unmounted component (React warning) or
    // gets stuck pending indefinitely.
    return () => ctl.abort();
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

  // Recover on tab return — when document becomes visible after being
  // hidden, refetch. Browsers (Safari especially) sometimes suspend
  // background fetches; this gives a clean way back. Refetches on EVERY
  // visibility change; cheap GET, no rate-limit concern.
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "visible") {
        void fetchMatches();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
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
  // Filter dismissed slugs out of the rendered list. Session-local; refresh
  // restores them since dismissals are a TRAINING signal for the matcher,
  // not a permanent founder preference.
  // M3 (2026-06-30): sort by bucket so A (observed-truth) renders before B
  // (stated-only). Within each bucket, preserve the matcher's score order.
  const ordered: Investor[] = [...individuals, ...firms]
    .filter((inv) => !inv.slug || !dismissedSlugs.has(inv.slug))
    .sort((a, b) => {
      const aIsA = a.bucket === "A" ? 0 : 1;
      const bIsA = b.bucket === "A" ? 0 : 1;
      return aIsA - bIsA;
    });
  // LLM-augmented recommendations (Phase A — 2026-06-29). Surfaced when
  // the catalog was thin for the founder's sector. See
  // brain/match_augmentation.py + .claude/plans/llm_augmented_matching.md.
  const recommended: Recommendation[] = activeBatch?.recommended_investors || [];
  // Sort recommendations by confidence: recent_verified → pattern_inferred → historical.
  // Higher-confidence rows surface first; historical buries at the bottom.
  const CONFIDENCE_RANK: Record<string, number> = {
    recent_verified: 0,
    pattern_inferred: 1,
    historical: 2,
  };
  const sortedRecommendations = [...recommended].sort(
    (a, b) => (CONFIDENCE_RANK[a.confidence] ?? 3) - (CONFIDENCE_RANK[b.confidence] ?? 3),
  );
  const hasAnyContent = ordered.length > 0 || sortedRecommendations.length > 0;

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

      {!activeBatch || !hasAnyContent ? (
        <div className="mp-empty">
          <p className="mp-empty-title">Your investor matches will show up here.</p>
          <p className="mp-empty-sub">Ranked by fit against your sector, stage, and geography. Head back to chat and ask raise(fn) to &quot;pull matches&quot; to get started.</p>
        </div>
      ) : (
        <>{ordered.length > 0 && (<div className="mp-list">
          {/* M3 (2026-06-30): bucket section markers. A = observed-truth-
              backed (real portfolio data confirms thesis). B = stated-only
              (matched on the investor's declared focus, no portfolio
              backing yet). C is the augmentation block below (recommended_
              investors). Headers only render when both A and B are
              present so the surface stays clean for single-bucket lists. */}
          {(() => {
            const buckA = ordered.filter((i) => i.bucket === "A").length;
            const buckB = ordered.filter((i) => i.bucket === "B" || !i.bucket).length;
            const showHeaders = buckA > 0 && buckB > 0;
            if (!showHeaders) return null;
            return (
              <div className="mp-bucket-intro">
                <span className="mp-bucket-label">High confidence</span>
                <span className="mp-bucket-hint">
                  Backed by real portfolio data — these investors actually deploy here.
                </span>
              </div>
            );
          })()}
          {ordered.map((inv, idx) => {
            // M3 bucket divider — emit a small label row between A and B
            // sections within the single-loop render.
            const prev = idx > 0 ? ordered[idx - 1] : null;
            const prevIsA = prev?.bucket === "A";
            const currIsB = inv.bucket === "B" || !inv.bucket;
            const showBucketBreak = prevIsA && currIsB;
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
              <Fragment key={key}>
              {showBucketBreak && (
                <div className="mp-bucket-intro mp-bucket-intro-b">
                  <span className="mp-bucket-label mp-bucket-label-b">Stated focus</span>
                  <span className="mp-bucket-hint">
                    Matched on declared thesis — verify the investor is actively deploying before reaching out.
                  </span>
                </div>
              )}
              <div className="mp-card">
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
                    {inv.bucket === "A" && (
                      <span className="mp-card-bucket mp-card-bucket-a" title="Backed by real portfolio data">High confidence</span>
                    )}
                    {(inv.bucket === "B" || (!inv.bucket && score !== null)) && (
                      <span className="mp-card-bucket mp-card-bucket-b" title="Matched on stated thesis — verify before reaching out">Stated focus</span>
                    )}
                    {inv.bucket === "C" && (
                      <span className="mp-card-bucket mp-card-bucket-c" title="Pulled from broad market knowledge — not in our catalog yet">Broader knowledge</span>
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
                    {inv.slug && (
                      <button
                        type="button"
                        className="mp-card-dismiss"
                        onClick={() => dismissInvestor(inv.slug!)}
                        title="Hide this match and tell raise(fn) it wasn't a fit"
                      >
                        ✕ Not a fit
                      </button>
                    )}
                  </div>
                </div>
              </div>
              </Fragment>
            );
          })}
        </div>)}
        {sortedRecommendations.length > 0 && (
          <div className="mp-aug-section">
            <div className="mp-aug-header">
              <h3 className="mp-aug-title">
                Recommended — not yet in our catalog
              </h3>
              <p className="mp-aug-sub">
                Pulled from broad market knowledge. Generate a brief to bring
                them into raise(fn).
              </p>
            </div>
            <div className="mp-aug-list">
              {sortedRecommendations.map((rec, idx) => {
                const key = `rec-${idx}`;
                const isGen = generatingKey === key;
                const errMsg = rowError?.key === key ? rowError.msg : null;
                const existing = findExistingBrief(rec.name);
                return (
                  <RecommendationCard
                    key={key}
                    rec={rec}
                    isGenerating={isGen}
                    errMsg={errMsg}
                    existingBrief={existing}
                    onGenerateBrief={async () => {
                      if (!session || isGen) return;
                      setGeneratingKey(key);
                      setRowError(null);
                      try {
                        const founderEmail = (impersonating || session.user.email || "").toLowerCase();
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
                              name: rec.name,
                              firm: rec.firm || null,
                              title: null,
                              // Combine thesis + founder-specific fit so the
                              // brief generator has both lenses. Existing
                              // endpoint takes a single thesis string today;
                              // joining is the lowest-risk way to surface
                              // the why_fit signal without a schema change.
                              thesis: [rec.thesis_summary, `Why fit for this founder: ${rec.why_fit}`].join(" — "),
                              website: null,
                              // Phase C v1 — tag this stub as auto-promoted from
                              // augmentation so admin can review the brief-acted
                              // set at /admin/users. See
                              // .claude/plans/llm_augmented_matching.md.
                              is_aug_recommendation: true,
                              aug_confidence: rec.confidence,
                            },
                          }),
                        });
                        if (!res.ok) {
                          const body = await res.json().catch(() => ({}));
                          throw new Error(body.detail || `Brief generation failed (${res.status})`);
                        }
                        const data = await res.json();
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
                    }}
                    onViewBrief={(token) => onOpenPanel({ kind: "brief", token, from: { kind: "matches" } })}
                  />
                );
              })}
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}

function RecommendationCard({
  rec,
  isGenerating,
  errMsg,
  existingBrief,
  onGenerateBrief,
  onViewBrief,
}: {
  rec: Recommendation;
  isGenerating: boolean;
  errMsg: string | null;
  existingBrief: ExistingBrief | null;
  onGenerateBrief: () => void;
  onViewBrief: (token: string) => void;
}) {
  const confidenceLabel: Record<Recommendation["confidence"], string> = {
    recent_verified: "Recent verified",
    pattern_inferred: "Pattern inferred",
    historical: "Historical",
  };
  // Compact subtitle line — combine firm + recent + contact into one
  // muted line below the primary name. Reduces vertical density without
  // hiding information.
  const subtitleParts: string[] = [];
  if (rec.firm) subtitleParts.push(rec.firm);
  if (rec.recent_activity) subtitleParts.push(rec.recent_activity);
  if (rec.contact_hint) subtitleParts.push(rec.contact_hint);

  return (
    <div className={`mp-aug-card mp-aug-${rec.confidence}`}>
      <div className="mp-aug-row">
        <div className="mp-aug-main">
          <div className="mp-aug-name-row">
            <span className="mp-aug-name">{rec.name}</span>
            <span className={`mp-aug-conf mp-aug-conf-${rec.confidence}`}>
              {confidenceLabel[rec.confidence]}
            </span>
            {rec.requires_warm_intro && (
              <span className="mp-aug-warm">warm intro needed</span>
            )}
          </div>
          {subtitleParts.length > 0 && (
            <p className="mp-aug-subtitle">{subtitleParts.join(" · ")}</p>
          )}
          <p className="mp-aug-thesis">{rec.thesis_summary}</p>
          <p className="mp-aug-fit">{rec.why_fit}</p>
          {errMsg && <p className="mp-aug-error">{errMsg}</p>}
        </div>
        <div className="mp-aug-actions">
          {existingBrief ? (
            <button
              type="button"
              className="mp-btn mp-btn-secondary"
              onClick={() => onViewBrief(existingBrief.token)}
            >
              View brief
            </button>
          ) : (
            <button
              type="button"
              className="mp-btn mp-btn-primary"
              disabled={isGenerating}
              onClick={onGenerateBrief}
            >
              {isGenerating ? "Generating…" : "Generate brief"}
            </button>
          )}
        </div>
      </div>
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
  /* M3 per-card bucket badge — distinct color per bucket so founders
     instantly recognize confidence tier on each row. Replaces the
     uniform "FIT N%" pill (all matches at same fit% looked broken). */
  .mp-card-bucket {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .mp-card-bucket-a {
    color: #34d399;
    background: rgba(16, 185, 129, 0.12);
    border-color: rgba(16, 185, 129, 0.35);
  }
  .mp-card-bucket-b {
    color: #a3a3a3;
    background: rgba(161, 161, 170, 0.08);
    border-color: rgba(161, 161, 170, 0.25);
  }
  .mp-card-bucket-c {
    color: #fbbf24;
    background: rgba(245, 158, 11, 0.10);
    border-color: rgba(245, 158, 11, 0.35);
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
  .mp-card-dismiss {
    background: transparent;
    border: none;
    color: #71717a;
    font-size: 11px;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
    margin-left: 4px;
    text-decoration: none;
  }
  .mp-card-dismiss:hover { color: #fca5a5; text-decoration: underline; }
  /* M3 bucket markers — split list visually so founders see "high
     confidence" matches ahead of "stated only" matches. Quiet styling
     by design; the goal is honest labeling, not a loud taxonomy lesson. */
  .mp-bucket-intro {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 6px 2px 10px;
    border-bottom: 1px solid rgba(82, 82, 91, 0.3);
    margin-bottom: 6px;
  }
  .mp-bucket-intro-b {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid rgba(82, 82, 91, 0.3);
  }
  .mp-bucket-label {
    font-size: 11px;
    font-weight: 600;
    color: #2dd4bf;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .mp-bucket-label-b { color: #a1a1aa; }
  .mp-bucket-hint {
    font-size: 11px;
    color: #71717a;
    line-height: 1.45;
  }

  /* ── LLM-augmented recommendations ────────────────────────────────── */
  .mp-aug-section {
    margin-top: 24px;
    padding-top: 18px;
    border-top: 1px dashed #27272a;
  }
  .mp-aug-header { margin-bottom: 12px; }
  .mp-aug-title {
    margin: 0 0 4px;
    font-size: 13px;
    font-weight: 600;
    color: #e4e4e7;
    letter-spacing: 0.02em;
  }
  .mp-aug-sub {
    margin: 0;
    font-size: 11px;
    color: #71717a;
    line-height: 1.5;
  }
  .mp-aug-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .mp-aug-card {
    border: 1px solid #27272a;
    background: rgba(24, 24, 27, 0.3);
    border-radius: 8px;
    padding: 12px 14px;
    transition: border-color 150ms ease;
  }
  .mp-aug-historical {
    opacity: 0.65;
  }
  .mp-aug-row {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    justify-content: space-between;
  }
  .mp-aug-main { flex: 1; min-width: 0; }
  .mp-aug-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }
  .mp-aug-subtitle {
    margin: 0 0 6px;
    font-size: 11px;
    color: #71717a;
    line-height: 1.5;
  }
  .mp-aug-error {
    margin: 6px 0 0;
    font-size: 11px;
    color: #fca5a5;
    line-height: 1.5;
  }
  .mp-aug-name-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 6px;
  }
  .mp-aug-name {
    color: #f4f4f5;
    font-size: 13px;
    font-weight: 600;
  }
  .mp-aug-firm {
    color: #a1a1aa;
    font-size: 12px;
  }
  .mp-aug-conf {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid;
  }
  .mp-aug-conf-recent_verified {
    color: #2dd4bf;
    border-color: rgba(45, 212, 191, 0.4);
    background: rgba(45, 212, 191, 0.08);
  }
  .mp-aug-conf-pattern_inferred {
    color: #a1a1aa;
    border-color: rgba(161, 161, 170, 0.3);
  }
  .mp-aug-conf-historical {
    color: #71717a;
    border-color: rgba(113, 113, 122, 0.25);
  }
  .mp-aug-warm {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #f97316;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid rgba(249, 115, 22, 0.4);
    background: rgba(249, 115, 22, 0.06);
  }
  .mp-aug-thesis {
    margin: 0 0 6px;
    font-size: 12px;
    color: #d4d4d8;
    line-height: 1.5;
  }
  .mp-aug-fit {
    margin: 0;
    font-size: 11px;
    color: #a1a1aa;
    line-height: 1.5;
    font-style: italic;
  }
`;
