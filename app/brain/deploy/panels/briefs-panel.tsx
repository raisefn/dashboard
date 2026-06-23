"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Panel } from "./use-panel-state";

/**
 * Briefs list panel — every investor brief the founder has generated.
 * Grouped by recency. Click a row → opens the Brief detail panel.
 *
 * Source: /v1/brain/matches/mine — that endpoint already returns the
 * founder's briefs array. We could add a dedicated /briefs/mine
 * endpoint later if the matches payload gets heavy.
 */

type ExistingBrief = {
  token: string;
  investor_full_name: string | null;
  investor_first_name: string | null;
  created_at: string | null;
};

interface BriefsPanelProps {
  session: Session | null;
  impersonating: string;
  onOpenPanel: (p: Panel) => void;
}

function formatDateLong(iso: string | null): string {
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

interface BriefGroup {
  label: string;
  briefs: ExistingBrief[];
}

function groupBriefsByRecency(briefs: ExistingBrief[]): BriefGroup[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const today: ExistingBrief[] = [];
  const week: ExistingBrief[] = [];
  const month: ExistingBrief[] = [];
  const older: ExistingBrief[] = [];

  for (const b of briefs) {
    if (!b.created_at) {
      older.push(b);
      continue;
    }
    const ageMs = now - new Date(b.created_at).getTime();
    const ageDays = Math.floor(ageMs / dayMs);
    if (ageDays === 0) today.push(b);
    else if (ageDays < 7) week.push(b);
    else if (ageDays < 30) month.push(b);
    else older.push(b);
  }

  const groups: BriefGroup[] = [];
  if (today.length) groups.push({ label: "Today", briefs: today });
  if (week.length) groups.push({ label: "This week", briefs: week });
  if (month.length) groups.push({ label: "This month", briefs: month });
  if (older.length) groups.push({ label: "Older", briefs: older });
  return groups;
}

export function BriefsPanel({ session, impersonating, onOpenPanel }: BriefsPanelProps) {
  const [briefs, setBriefs] = useState<ExistingBrief[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/matches/mine", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load briefs (${res.status})`);
      }
      const data = await res.json();
      setBriefs(Array.isArray(data.briefs) ? data.briefs : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load briefs.");
    }
  }, [session, impersonating]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    function onUpdate() { void load(); }
    window.addEventListener("raisefn:briefs_updated", onUpdate);
    return () => window.removeEventListener("raisefn:briefs_updated", onUpdate);
  }, [load]);

  if (briefs === null && !error) {
    return (
      <div className="bp-state">
        <p className="bp-state-text">Loading briefs…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bp-state">
        <style>{BRIEFS_PANEL_CSS}</style>
        <p className="bp-state-error">{error}</p>
      </div>
    );
  }

  const list = briefs || [];
  const groups = groupBriefsByRecency(list);

  return (
    <div className="briefs-panel">
      <style>{BRIEFS_PANEL_CSS}</style>

      {list.length === 0 ? (
        <div className="bp-empty">
          <p className="bp-empty-title">No briefs yet.</p>
          <p className="bp-empty-sub">Ask raise(fn) to brief any investor — &quot;generate a brief on [name]&quot;.</p>
        </div>
      ) : (
        groups.map(group => (
          <section key={group.label} className="bp-group">
            <h3 className="bp-group-title">{group.label}</h3>
            <div className="bp-list">
              {group.briefs.map(b => (
                <button
                  key={b.token}
                  type="button"
                  className="bp-row"
                  onClick={() => onOpenPanel({ kind: "brief", token: b.token, from: { kind: "briefs" } })}
                >
                  <div className="bp-row-main">
                    <div className="bp-row-name">{b.investor_full_name || b.investor_first_name || "Brief"}</div>
                    <div className="bp-row-date">{formatDateLong(b.created_at)}</div>
                  </div>
                  <span className="bp-row-arrow">→</span>
                </button>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

const BRIEFS_PANEL_CSS = `
  .briefs-panel { color: #d4d4d8; }

  .bp-state { padding: 32px 8px; }
  .bp-state-text { font-size: 13px; color: #71717a; margin: 0; }
  .bp-state-error { font-size: 13px; color: #fca5a5; margin: 0; }

  .bp-empty {
    margin-top: 24px;
    padding: 32px 16px;
    border: 1px solid #27272a;
    background: rgba(24, 24, 27, 0.4);
    border-radius: 8px;
    text-align: center;
  }
  .bp-empty-title { margin: 0 0 6px; font-size: 14px; color: #d4d4d8; }
  .bp-empty-sub { margin: 0; font-size: 12px; color: #71717a; }

  .bp-group { margin-bottom: 24px; }
  .bp-group-title {
    margin: 0 0 10px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #71717a;
  }

  .bp-list { display: flex; flex-direction: column; gap: 4px; }

  .bp-row {
    width: 100%;
    background: none;
    border: 1px solid transparent;
    border-radius: 7px;
    padding: 11px 14px;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    transition: all 150ms ease;
  }
  .bp-row:hover {
    background: rgba(45, 212, 191, 0.04);
    border-color: rgba(45, 212, 191, 0.15);
  }
  .bp-row-main { flex: 1; min-width: 0; }
  .bp-row-name {
    font-size: 14px;
    color: #f4f4f5;
    font-weight: 500;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bp-row-date {
    font-size: 11px;
    color: #71717a;
  }
  .bp-row-arrow {
    color: #52525b;
    transition: color 150ms ease;
    flex-shrink: 0;
  }
  .bp-row:hover .bp-row-arrow { color: #2dd4bf; }
`;
