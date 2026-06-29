"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { formatMarkdown } from "@/lib/format-markdown";

/**
 * Brief detail panel — renders an investor brief's markdown inline.
 *
 * Uses /v1/brain/briefs/<token>/inapp (auth-gated, founder-owned, does
 * NOT increment view_count) — so the founder reading their own brief
 * inside raise(fn) doesn't inflate the engagement signal that should
 * track investor reads only.
 */

interface BriefData {
  token: string;
  markdown: string;
  founder_company: string | null;
  founder_name: string | null;
  investor_first_name: string | null;
  investor_full_name: string | null;
  generated_at: string | null;
  last_edited_at: string | null;
  status: string;
  view_count: number;
  // Brand-gating (migration 031). show_raisefn_brand drives the toggle
  // value; founder_tier drives whether the toggle is interactive
  // (free=locked, pro/advisor=interactive). Optional for back-compat
  // with any cached responses from before this lands.
  show_raisefn_brand?: boolean;
  founder_tier?: string;
}

interface BriefDetailPanelProps {
  token: string;
  session: Session | null;
  impersonating: string;
}

function formatDateLong(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BriefDetailPanel({ token, session, impersonating }: BriefDetailPanelProps) {
  const [data, setData] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [brandUpdating, setBrandUpdating] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);

  async function toggleBrand(next: boolean) {
    if (!session || !token || !data) return;
    setBrandUpdating(true);
    setBrandError(null);
    // Optimistic UI — flip immediately, rollback on error.
    const prev = data.show_raisefn_brand;
    setData({ ...data, show_raisefn_brand: next });
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch(`/v1/brain/briefs/${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ show_raisefn_brand: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Update failed (${res.status})`);
      }
    } catch (e) {
      // Roll back optimistic update
      setData(d => d ? { ...d, show_raisefn_brand: prev } : d);
      setBrandError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBrandUpdating(false);
    }
  }

  const load = useCallback(async () => {
    if (!session || !token) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch(`/v1/brain/briefs/${encodeURIComponent(token)}/inapp`, { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load brief (${res.status})`);
      }
      const json: BriefData = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load brief.");
    } finally {
      setLoading(false);
    }
  }, [session, token, impersonating]);

  useEffect(() => { void load(); }, [load]);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/brief/${token}`
    : `/brief/${token}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Older browsers / iframe blocked — fall back to selection prompt.
      window.prompt("Copy this link to share with the investor:", publicUrl);
    }
  }

  if (loading) {
    return (
      <div className="bdp-state">
        <p className="bdp-state-text">Loading brief…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bdp-state">
        <style>{BRIEF_DETAIL_CSS}</style>
        <p className="bdp-state-error">{error || "Brief unavailable."}</p>
      </div>
    );
  }

  const investorName = data.investor_full_name || data.investor_first_name || "Investor";
  // Brand-gating: tier gates whether the toggle is interactive.
  // Default-true on the flag for back-compat with older briefs.
  const tier = (data.founder_tier || "free").toLowerCase();
  const canEditBrand = tier === "pro" || tier === "advisor";
  const brandOn = data.show_raisefn_brand !== false;

  return (
    <div className="brief-detail-panel">
      <style>{BRIEF_DETAIL_CSS}</style>

      <header className="bdp-header">
        <div className="bdp-meta">
          <div className="bdp-recipient">{investorName}</div>
          <div className="bdp-meta-line">
            <span>{formatDateLong(data.generated_at)}</span>
            {data.view_count > 0 && (
              <>
                <span className="bdp-sep">·</span>
                <span className="bdp-views">
                  {data.view_count} view{data.view_count === 1 ? "" : "s"}
                </span>
              </>
            )}
            {data.status && data.status !== "draft" && (
              <>
                <span className="bdp-sep">·</span>
                <span className="bdp-status">{data.status}</span>
              </>
            )}
          </div>
        </div>
        <div className="bdp-actions">
          <button
            type="button"
            className="bdp-action"
            onClick={copyLink}
          >
            {copied ? "Copied!" : "Copy share link"}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bdp-action bdp-action-secondary"
          >
            Open in new tab ↗
          </a>
        </div>
      </header>

      {/* Brand-gating toggle. Free tier: locked + upgrade hint.
          Pro/Advisor: interactive with optimistic flip. */}
      <div className="bdp-brand-row">
        <div className="bdp-brand-label">
          <span className="bdp-brand-title">Show raise(fn) brand</span>
          {!canEditBrand && (
            <span className="bdp-brand-hint">Upgrade to remove</span>
          )}
          {brandError && (
            <span className="bdp-brand-error">{brandError}</span>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={brandOn}
          disabled={!canEditBrand || brandUpdating}
          onClick={() => canEditBrand && toggleBrand(!brandOn)}
          className={`bdp-brand-switch${brandOn ? " is-on" : ""}${!canEditBrand ? " is-locked" : ""}`}
          title={canEditBrand ? (brandOn ? "Click to hide brand" : "Click to show brand") : "Upgrade to Pro or Advisor to remove"}
        >
          <span className="bdp-brand-knob" />
        </button>
      </div>


      <article
        className="bdp-content"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(data.markdown || "") }}
      />
    </div>
  );
}

const BRIEF_DETAIL_CSS = `
  .brief-detail-panel { color: #d4d4d8; }

  .bdp-state { padding: 32px 8px; }
  .bdp-state-text { font-size: 13px; color: #71717a; margin: 0; }
  .bdp-state-error { font-size: 13px; color: #fca5a5; margin: 0; }

  .bdp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #27272a;
  }
  .bdp-meta { flex: 1; min-width: 0; }
  .bdp-recipient {
    font-size: 18px;
    font-weight: 600;
    color: #f4f4f5;
    margin-bottom: 4px;
  }
  .bdp-meta-line {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 11px;
    color: #71717a;
  }
  .bdp-views { color: #2dd4bf; }
  .bdp-status {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 2px 7px;
    border-radius: 999px;
    background: rgba(45, 212, 191, 0.1);
    color: #2dd4bf;
    font-size: 10px;
  }
  .bdp-sep { color: #3f3f46; }

  .bdp-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  .bdp-action {
    background: #14b8a6;
    color: #f4f4f5;
    border: 1px solid transparent;
    border-radius: 6px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    cursor: pointer;
    text-decoration: none;
    transition: all 150ms ease;
  }
  .bdp-action:hover { background: #0d9488; }
  .bdp-action-secondary {
    background: transparent;
    color: #d4d4d8;
    border-color: #3f3f46;
  }
  .bdp-action-secondary:hover {
    background: rgba(63, 63, 70, 0.4);
    border-color: #52525b;
  }

  .bdp-brand-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 0 20px;
    padding: 10px 14px;
    background: rgba(24, 24, 27, 0.4);
    border: 1px solid #27272a;
    border-radius: 8px;
  }
  .bdp-brand-label {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
    min-width: 0;
  }
  .bdp-brand-title {
    font-size: 13px;
    color: #d4d4d8;
  }
  .bdp-brand-hint {
    font-size: 11px;
    color: #a1a1aa;
  }
  .bdp-brand-error { font-size: 11px; color: #fca5a5; }
  .bdp-brand-switch {
    position: relative;
    width: 36px;
    height: 20px;
    border-radius: 999px;
    background: #3f3f46;
    border: 1px solid #52525b;
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;
    padding: 0;
    flex-shrink: 0;
  }
  .bdp-brand-switch.is-on {
    background: #14b8a6;
    border-color: #0d9488;
  }
  .bdp-brand-switch:disabled,
  .bdp-brand-switch.is-locked {
    cursor: not-allowed;
    opacity: 0.55;
  }
  .bdp-brand-knob {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 16px;
    height: 16px;
    background: #f4f4f5;
    border-radius: 50%;
    transition: transform 150ms ease;
  }
  .bdp-brand-switch.is-on .bdp-brand-knob {
    transform: translateX(16px);
  }

  .bdp-content {
    color: #e4e4e7;
    font-size: 14px;
    line-height: 1.65;
  }
  .bdp-content h1, .bdp-content h2, .bdp-content h3 {
    color: #f4f4f5;
    font-weight: 600;
    margin: 24px 0 12px;
  }
  .bdp-content h1 { font-size: 22px; }
  .bdp-content h2 { font-size: 18px; }
  .bdp-content h3 { font-size: 15px; }
  .bdp-content p { margin: 0 0 14px; }
  .bdp-content strong { color: #f4f4f5; font-weight: 600; }
  .bdp-content em { color: #a1a1aa; }
  .bdp-content a {
    color: #2dd4bf;
    text-decoration: none;
  }
  .bdp-content a:hover { text-decoration: underline; }
  .bdp-content ul, .bdp-content ol {
    margin: 0 0 14px;
    padding-left: 22px;
  }
  .bdp-content li { margin-bottom: 4px; }
  .bdp-content blockquote {
    margin: 14px 0;
    padding: 8px 16px;
    border-left: 3px solid #2dd4bf;
    color: #a1a1aa;
    font-style: italic;
  }
  .bdp-content code {
    background: rgba(39, 39, 42, 0.6);
    color: #e4e4e7;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
`;
