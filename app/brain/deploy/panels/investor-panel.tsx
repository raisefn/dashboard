"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Panel } from "./use-panel-state";

/**
 * Investor detail panel — single investor full profile + pipeline history +
 * brief if generated + action buttons.
 *
 * Backed by /v1/brain/investor/<slug>. Action buttons inject chat prompts
 * (never fire tools directly — chat is the verb).
 */

interface InvestorDetailData {
  slug: string;
  profile: {
    name?: string | null;
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
    kind?: string | null;
    type?: string | null;
    openvc_url?: string | null;
    linkedin?: string | null;
    data_source?: string | null;
  } | null;
  pipeline: {
    id: string;
    slug: string | null;
    name: string | null;
    firm: string | null;
    email: string | null;
    linkedin: string | null;
    status: string | null;
    outreach_channel: string | null;
    meeting_scheduled_for: string | null;
    first_contacted_at: string | null;
    last_contacted_at: string | null;
    notes: string | null;
    objections: string | null;
    what_resonated: string | null;
    next_action: string | null;
    next_action_at: string | null;
    updated_at: string | null;
  } | null;
  events: Array<{
    id: string;
    event_type: string;
    summary: string | null;
    investor_name: string | null;
    data: Record<string, unknown> | null;
    created_at: string | null;
  }>;
  brief: {
    token: string;
    investor_full_name: string | null;
    investor_first_name: string | null;
    created_at: string | null;
    view_count: number;
  } | null;
}

interface InvestorPanelProps {
  slug: string;
  session: Session | null;
  impersonating: string;
  injectChatPrompt: (prompt: string) => void;
  onOpenPanel: (p: Panel) => void;
}

const STATUS_LABEL: Record<string, string> = {
  outreached: "Outreached",
  meeting_scheduled: "Meeting scheduled",
  met: "Met",
  follow_up: "Following up",
  diligence: "Diligence",
  term_sheet: "Term sheet",
  committed: "Committed",
  soft_pass: "Soft pass",
  hard_pass: "Hard pass",
  passed: "Passed",
  ghosted: "Ghosted",
  rejected: "Rejected",
};

const STATUS_TONE: Record<string, "warm" | "active" | "cool"> = {
  committed: "warm",
  term_sheet: "warm",
  met: "warm",
  diligence: "warm",
  meeting_scheduled: "active",
  follow_up: "active",
  outreached: "active",
  ghosted: "cool",
  soft_pass: "cool",
  hard_pass: "cool",
  passed: "cool",
  rejected: "cool",
};

function fmtMoney(n?: number | null): string | null {
  if (!n) return null;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function formatEventType(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatDateRelative(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const ms = Date.now() - date.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatDateAbsolute(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function InvestorPanel({ slug, session, impersonating, injectChatPrompt, onOpenPanel }: InvestorPanelProps) {
  const [data, setData] = useState<InvestorDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session || !slug) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch(`/v1/brain/investor/${encodeURIComponent(slug)}`, { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load investor (${res.status})`);
      }
      const json: InvestorDetailData = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load investor.");
    } finally {
      setLoading(false);
    }
  }, [session, slug, impersonating]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    function onUpdate() { void load(); }
    window.addEventListener("raisefn:pipeline_updated", onUpdate);
    window.addEventListener("raisefn:briefs_updated", onUpdate);
    return () => {
      window.removeEventListener("raisefn:pipeline_updated", onUpdate);
      window.removeEventListener("raisefn:briefs_updated", onUpdate);
    };
  }, [load]);

  if (loading) {
    return (
      <div className="ip-state">
        <p className="ip-state-text">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ip-state">
        <style>{INVESTOR_PANEL_CSS}</style>
        <p className="ip-state-error">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const displayName =
    data.pipeline?.name
    || data.profile?.name
    || slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const firm = data.pipeline?.firm || data.profile?.firm_name || null;
  const title = data.profile?.title || null;
  const subtitle = [firm, title].filter(Boolean).join(" · ");
  const status = data.pipeline?.status || null;
  const statusLabel = status ? (STATUS_LABEL[status] || status) : null;
  const statusTone = status ? (STATUS_TONE[status] || null) : null;
  const ageLabel = formatDateRelative(data.pipeline?.last_contacted_at || data.pipeline?.updated_at || null);

  const checkRange =
    (data.profile?.check_size_min || data.profile?.check_size_max)
      ? `${fmtMoney(data.profile.check_size_min) || "?"}–${fmtMoney(data.profile.check_size_max) || "?"}`
      : null;
  const sectors = data.profile?.focus_sectors || [];
  const stages = data.profile?.focus_stages || [];
  const countries = data.profile?.focus_countries || [];

  return (
    <div className="investor-panel">
      <style>{INVESTOR_PANEL_CSS}</style>

      {/* Header */}
      <header className="ip-header">
        <div className="ip-header-text">
          <h2 className="ip-name">{displayName}</h2>
          {subtitle && <p className="ip-subtitle">{subtitle}</p>}
          <div className="ip-meta-row">
            {statusLabel && (
              <span className={`ip-status-pill ip-status-${statusTone || "cold"}`}>{statusLabel}</span>
            )}
            {ageLabel && <span className="ip-meta">{ageLabel}</span>}
            {data.profile?.is_deploying && <span className="ip-meta">Actively deploying</span>}
            {data.profile?.hq_location && <span className="ip-meta">HQ: {data.profile.hq_location}</span>}
          </div>
        </div>
        <div className="ip-header-links">
          {data.profile?.linkedin && (
            <a href={data.profile.linkedin} target="_blank" rel="noopener noreferrer" className="ip-link">
              LinkedIn ↗
            </a>
          )}
          {data.profile?.openvc_url && (
            <a href={data.profile.openvc_url} target="_blank" rel="noopener noreferrer" className="ip-link">
              OpenVC ↗
            </a>
          )}
        </div>
      </header>

      {/* Actions */}
      <div className="ip-actions">
        <button
          type="button"
          className="ip-action"
          onClick={() => injectChatPrompt(`Draft follow-up to ${displayName}`)}
        >
          Draft follow-up
        </button>
        {data.brief ? (
          <button
            type="button"
            className="ip-action"
            onClick={() => data.brief && onOpenPanel({ kind: "brief", token: data.brief.token, from: { kind: "investor", slug } })}
          >
            View brief
          </button>
        ) : (
          <button
            type="button"
            className="ip-action"
            onClick={() => injectChatPrompt(`Generate a brief on ${displayName}${firm ? ` (${firm})` : ""}`)}
          >
            Generate brief
          </button>
        )}
        {status !== "passed" && status !== "hard_pass" && status !== "soft_pass" && (
          <button
            type="button"
            className="ip-action ip-action-secondary"
            onClick={() => injectChatPrompt(`Mark ${displayName} as passed`)}
          >
            Mark passed
          </button>
        )}
        <button
          type="button"
          className="ip-action ip-action-secondary"
          onClick={() => injectChatPrompt(`Walk me through where I stand with ${displayName}`)}
        >
          Discuss in chat
        </button>
      </div>

      {/* Thesis + profile facts */}
      {(data.profile?.thesis || sectors.length || stages.length || checkRange || countries.length) && (
        <section className="ip-section">
          <h3 className="ip-section-title">Profile</h3>
          {data.profile?.thesis && <p className="ip-thesis">{data.profile.thesis}</p>}
          <div className="ip-facts">
            {sectors.length > 0 && (
              <div className="ip-fact">
                <span className="ip-fact-label">Sectors</span>
                <span className="ip-fact-value">{sectors.join(", ")}</span>
              </div>
            )}
            {stages.length > 0 && (
              <div className="ip-fact">
                <span className="ip-fact-label">Stages</span>
                <span className="ip-fact-value">{stages.join(", ")}</span>
              </div>
            )}
            {checkRange && (
              <div className="ip-fact">
                <span className="ip-fact-label">Check size</span>
                <span className="ip-fact-value">{checkRange}</span>
              </div>
            )}
            {countries.length > 0 && (
              <div className="ip-fact">
                <span className="ip-fact-label">Focus geo</span>
                <span className="ip-fact-value">{countries.join(", ")}</span>
              </div>
            )}
            {data.profile?.kind && (
              <div className="ip-fact">
                <span className="ip-fact-label">Type</span>
                <span className="ip-fact-value">{data.profile.type || data.profile.kind}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Pipeline notes */}
      {data.pipeline && (data.pipeline.notes || data.pipeline.objections || data.pipeline.what_resonated || data.pipeline.next_action) && (
        <section className="ip-section">
          <h3 className="ip-section-title">Pipeline</h3>
          {data.pipeline.what_resonated && (
            <div className="ip-pip-block">
              <div className="ip-pip-label">What resonated</div>
              <p className="ip-pip-text">{data.pipeline.what_resonated}</p>
            </div>
          )}
          {data.pipeline.objections && (
            <div className="ip-pip-block">
              <div className="ip-pip-label">Objections</div>
              <p className="ip-pip-text">{data.pipeline.objections}</p>
            </div>
          )}
          {data.pipeline.notes && (
            <div className="ip-pip-block">
              <div className="ip-pip-label">Notes</div>
              <p className="ip-pip-text">{data.pipeline.notes}</p>
            </div>
          )}
          {data.pipeline.next_action && (
            <div className="ip-pip-block">
              <div className="ip-pip-label">Next action{data.pipeline.next_action_at ? ` · ${formatDateAbsolute(data.pipeline.next_action_at)}` : ""}</div>
              <p className="ip-pip-text">{data.pipeline.next_action}</p>
            </div>
          )}
        </section>
      )}

      {/* Events timeline */}
      {data.events.length > 0 && (
        <section className="ip-section">
          <h3 className="ip-section-title">History</h3>
          <ol className="ip-timeline">
            {data.events.map(ev => (
              <li key={ev.id} className="ip-timeline-row">
                <div className="ip-timeline-meta">
                  <span className="ip-timeline-type">{formatEventType(ev.event_type)}</span>
                  <span className="ip-timeline-date">{formatDateAbsolute(ev.created_at)}</span>
                </div>
                {ev.summary && <p className="ip-timeline-summary">{ev.summary}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Empty state */}
      {!data.profile && !data.pipeline && data.events.length === 0 && (
        <div className="ip-empty">
          <p className="ip-empty-title">{displayName}</p>
          <p className="ip-empty-sub">No profile data, no pipeline history, no events yet. Ask raise(fn) to brief them or start tracking them in chat.</p>
        </div>
      )}
    </div>
  );
}

const INVESTOR_PANEL_CSS = `
  .investor-panel { color: #d4d4d8; }

  .ip-state { padding: 32px 8px; }
  .ip-state-text { font-size: 13px; color: #71717a; margin: 0; }
  .ip-state-error { font-size: 13px; color: #fca5a5; margin: 0; }

  .ip-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
    padding-bottom: 16px;
    border-bottom: 1px solid #27272a;
  }
  .ip-header-text { flex: 1; min-width: 0; }
  .ip-name {
    margin: 0 0 2px;
    font-size: 20px;
    font-weight: 600;
    color: #f4f4f5;
    line-height: 1.2;
  }
  .ip-subtitle {
    margin: 0 0 8px;
    font-size: 13px;
    color: #a1a1aa;
  }
  .ip-meta-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .ip-status-pill {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 3px 9px;
    border-radius: 999px;
  }
  .ip-status-warm {
    background: rgba(45, 212, 191, 0.12);
    color: #2dd4bf;
    border: 1px solid rgba(45, 212, 191, 0.25);
  }
  .ip-status-active {
    background: rgba(253, 186, 116, 0.12);
    color: #fdba74;
    border: 1px solid rgba(253, 186, 116, 0.25);
  }
  .ip-status-cool {
    background: rgba(113, 113, 122, 0.15);
    color: #a1a1aa;
    border: 1px solid rgba(82, 82, 91, 0.4);
  }
  .ip-status-cold {
    background: rgba(63, 63, 70, 0.4);
    color: #71717a;
    border: 1px solid #3f3f46;
  }
  .ip-meta {
    font-size: 11px;
    color: #71717a;
  }
  .ip-header-links {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
    flex-shrink: 0;
  }
  .ip-link {
    font-size: 11px;
    color: #71717a;
    text-decoration: none;
    transition: color 150ms ease;
  }
  .ip-link:hover { color: #2dd4bf; }

  .ip-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
  }
  .ip-action {
    background: #14b8a6;
    color: #f4f4f5;
    border: 1px solid transparent;
    border-radius: 6px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    padding: 7px 14px;
    cursor: pointer;
    transition: all 150ms ease;
  }
  .ip-action:hover { background: #0d9488; }
  .ip-action-secondary {
    background: transparent;
    color: #d4d4d8;
    border-color: #3f3f46;
  }
  .ip-action-secondary:hover {
    background: rgba(63, 63, 70, 0.5);
    border-color: #52525b;
    color: #f4f4f5;
  }

  .ip-section { margin-bottom: 24px; }
  .ip-section-title {
    margin: 0 0 10px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #71717a;
  }

  .ip-thesis {
    margin: 0 0 12px;
    font-size: 13px;
    color: #d4d4d8;
    line-height: 1.55;
  }

  .ip-facts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
  }
  .ip-fact {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
  }
  .ip-fact-label { color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
  .ip-fact-value { color: #d4d4d8; }

  .ip-pip-block { margin-bottom: 10px; }
  .ip-pip-block:last-child { margin-bottom: 0; }
  .ip-pip-label {
    font-size: 10px;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 3px;
  }
  .ip-pip-text {
    margin: 0;
    font-size: 13px;
    color: #d4d4d8;
    line-height: 1.5;
  }

  .ip-timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .ip-timeline-row {
    border-left: 2px solid #27272a;
    padding-left: 12px;
    position: relative;
  }
  .ip-timeline-row::before {
    content: "";
    width: 6px;
    height: 6px;
    background: #2dd4bf;
    border-radius: 50%;
    position: absolute;
    left: -4px;
    top: 5px;
  }
  .ip-timeline-meta {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 12px;
  }
  .ip-timeline-type {
    color: #d4d4d8;
    font-weight: 500;
  }
  .ip-timeline-date {
    color: #71717a;
    font-size: 11px;
  }
  .ip-timeline-summary {
    margin: 3px 0 0;
    font-size: 12px;
    color: #a1a1aa;
    line-height: 1.5;
  }

  .ip-empty {
    margin-top: 16px;
    padding: 24px;
    border: 1px solid #27272a;
    background: rgba(24, 24, 27, 0.4);
    border-radius: 8px;
    text-align: center;
  }
  .ip-empty-title { margin: 0 0 4px; font-size: 15px; color: #d4d4d8; font-weight: 500; }
  .ip-empty-sub { margin: 0; font-size: 12px; color: #71717a; line-height: 1.5; }
`;
