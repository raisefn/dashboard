"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Panel } from "./use-panel-state";

/**
 * Full pipeline panel — every investor in the founder's pipeline as a
 * scrollable, sortable, filterable table.
 *
 * Source: /v1/brain/sidebar-state (returns up to 50 pipeline rows,
 * already de-junked + deduped server-side). For founders with 100+
 * investors we'd add a dedicated /pipeline?limit=200 endpoint later.
 */

type PipelineRow = {
  id: string;
  slug: string | null;
  name: string;
  firm: string | null;
  status: string | null;
  days_since_update: number | null;
  meeting_scheduled_for: string | null;
};

interface PipelinePanelProps {
  session: Session | null;
  impersonating: string;
  onInjectPrompt: (prompt: string) => void;
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

const ACTIVE_STATUSES = new Set([
  "outreached", "meeting_scheduled", "met", "follow_up",
  "diligence", "term_sheet", "committed",
]);
const STALE_STATUSES = new Set([
  "ghosted", "soft_pass", "hard_pass", "passed", "rejected",
]);

type Filter = "active" | "all" | "stale";
type SortKey = "activity" | "status" | "name";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "all", label: "All" },
  { key: "stale", label: "Stale" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "activity", label: "Last activity" },
  { key: "status", label: "Status" },
  { key: "name", label: "Name" },
];

const STATUS_ORDER: Record<string, number> = {
  committed: 1, term_sheet: 2, diligence: 3, met: 4, meeting_scheduled: 5,
  follow_up: 6, outreached: 7,
  ghosted: 8, soft_pass: 9, hard_pass: 10, passed: 11, rejected: 12,
};

function formatAge(days: number | null): string {
  if (days === null || days === undefined) return "—";
  if (days === 0) return "today";
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

export function PipelinePanel({ session, impersonating, onInjectPrompt, onOpenPanel }: PipelinePanelProps) {
  const [rows, setRows] = useState<PipelineRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("activity");

  const load = useCallback(async () => {
    if (!session) return;
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/sidebar-state", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load pipeline (${res.status})`);
      }
      const data = await res.json();
      setRows(Array.isArray(data.pipeline) ? data.pipeline : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pipeline.");
    }
  }, [session, impersonating]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    function onUpdate() { void load(); }
    window.addEventListener("raisefn:pipeline_updated", onUpdate);
    return () => window.removeEventListener("raisefn:pipeline_updated", onUpdate);
  }, [load]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const filteredRows = rows.filter(r => {
      const s = r.status || "";
      if (filter === "active") return ACTIVE_STATUSES.has(s) || !s;
      if (filter === "stale") return STALE_STATUSES.has(s);
      return true;
    });
    filteredRows.sort((a, b) => {
      if (sortKey === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortKey === "status") {
        return (STATUS_ORDER[a.status || ""] || 99) - (STATUS_ORDER[b.status || ""] || 99);
      }
      // activity
      const aDays = a.days_since_update ?? 9999;
      const bDays = b.days_since_update ?? 9999;
      return aDays - bDays;
    });
    return filteredRows;
  }, [rows, filter, sortKey]);

  if (rows === null && !error) {
    return (
      <div className="pp-state">
        <p className="pp-state-text">Loading pipeline…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pp-state">
        <style>{PIPELINE_PANEL_CSS}</style>
        <p className="pp-state-error">{error}</p>
      </div>
    );
  }

  const total = rows?.length || 0;
  const activeCount = (rows || []).filter(r => ACTIVE_STATUSES.has(r.status || "") || !r.status).length;
  const staleCount = (rows || []).filter(r => STALE_STATUSES.has(r.status || "")).length;

  return (
    <div className="pipeline-panel">
      <style>{PIPELINE_PANEL_CSS}</style>

      <div className="pp-toolbar">
        <div className="pp-pills">
          {FILTERS.map(f => {
            const n = f.key === "active" ? activeCount : f.key === "stale" ? staleCount : total;
            return (
              <button
                key={f.key}
                type="button"
                className={`pp-pill${filter === f.key ? " active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span className="pp-pill-count">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="pp-sort">
          <label className="pp-sort-label">Sort</label>
          <select
            className="pp-sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            {SORTS.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {total === 0 ? (
        <div className="pp-empty">
          <p className="pp-empty-title">No pipeline yet.</p>
          <p className="pp-empty-sub">Tell raise(fn) who you&apos;re talking to.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="pp-empty">
          <p className="pp-empty-title">No {filter} conversations.</p>
          <p className="pp-empty-sub">Switch filter or add someone in chat.</p>
        </div>
      ) : (
        <div className="pp-table">
          <div className="pp-thead">
            <span className="pp-th pp-th-name">Investor</span>
            <span className="pp-th pp-th-status">Status</span>
            <span className="pp-th pp-th-age">Last activity</span>
          </div>
          <div className="pp-tbody">
            {filtered.map(r => {
              const tone = STATUS_TONE[r.status || ""] || "cold";
              const statusLabel = STATUS_LABEL[r.status || ""] || r.status || "—";
              return (
                <button
                  key={r.id}
                  type="button"
                  className="pp-row"
                  onClick={() => {
                    if (r.slug) onOpenPanel({ kind: "investor", slug: r.slug, from: { kind: "pipeline" } });
                    else onInjectPrompt(`Looking at ${r.name}. What do you want to do?`);
                  }}
                >
                  <div className="pp-cell pp-cell-name">
                    <div className="pp-name">{r.name}</div>
                    {r.firm && <div className="pp-firm">{r.firm}</div>}
                  </div>
                  <div className="pp-cell pp-cell-status">
                    <span className={`pp-status-pill pp-status-${tone}`}>{statusLabel}</span>
                  </div>
                  <div className="pp-cell pp-cell-age">
                    {formatAge(r.days_since_update)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const PIPELINE_PANEL_CSS = `
  .pipeline-panel { color: #d4d4d8; }

  .pp-state { padding: 32px 8px; }
  .pp-state-text { font-size: 13px; color: #71717a; margin: 0; }
  .pp-state-error { font-size: 13px; color: #fca5a5; margin: 0; }

  .pp-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid #27272a;
  }
  .pp-pills { display: flex; gap: 4px; }
  .pp-pill {
    background: none;
    border: 1px solid transparent;
    color: #a1a1aa;
    font-family: inherit;
    font-size: 12px;
    padding: 5px 10px;
    border-radius: 999px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 150ms ease;
  }
  .pp-pill:hover { color: #d4d4d8; background: rgba(45, 212, 191, 0.04); }
  .pp-pill.active {
    background: rgba(45, 212, 191, 0.1);
    border-color: rgba(45, 212, 191, 0.25);
    color: #2dd4bf;
  }
  .pp-pill-count {
    font-size: 10px;
    color: inherit;
    opacity: 0.7;
  }

  .pp-sort {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pp-sort-label {
    font-size: 11px;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .pp-sort-select {
    background: rgba(24, 24, 27, 0.6);
    border: 1px solid #3f3f46;
    color: #d4d4d8;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-family: inherit;
    outline: none;
    cursor: pointer;
  }
  .pp-sort-select:focus { border-color: #2dd4bf; }

  .pp-empty {
    margin-top: 24px;
    padding: 32px 16px;
    border: 1px solid #27272a;
    background: rgba(24, 24, 27, 0.4);
    border-radius: 8px;
    text-align: center;
  }
  .pp-empty-title { margin: 0 0 6px; font-size: 14px; color: #d4d4d8; }
  .pp-empty-sub { margin: 0; font-size: 12px; color: #71717a; }

  .pp-table {
    border: 1px solid #27272a;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(24, 24, 27, 0.3);
  }
  .pp-thead {
    display: grid;
    grid-template-columns: 1fr 140px 100px;
    gap: 12px;
    padding: 10px 16px;
    border-bottom: 1px solid #27272a;
    background: rgba(9, 9, 11, 0.4);
  }
  .pp-th {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #71717a;
  }
  .pp-th-age { text-align: right; }
  .pp-tbody {
    display: flex;
    flex-direction: column;
  }
  .pp-row {
    display: grid;
    grid-template-columns: 1fr 140px 100px;
    gap: 12px;
    padding: 10px 16px;
    background: none;
    border: none;
    border-top: 1px solid rgba(39, 39, 42, 0.5);
    color: #d4d4d8;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    transition: background 150ms ease;
    align-items: center;
  }
  .pp-row:first-child { border-top: none; }
  .pp-row:hover { background: rgba(45, 212, 191, 0.04); }
  .pp-cell { min-width: 0; }
  .pp-cell-age { text-align: right; color: #71717a; font-size: 12px; }
  .pp-name {
    font-size: 13px;
    font-weight: 500;
    color: #f4f4f5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pp-firm {
    font-size: 11px;
    color: #71717a;
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pp-status-pill {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .pp-status-warm {
    background: rgba(45, 212, 191, 0.12);
    color: #2dd4bf;
    border: 1px solid rgba(45, 212, 191, 0.25);
  }
  .pp-status-active {
    background: rgba(253, 186, 116, 0.12);
    color: #fdba74;
    border: 1px solid rgba(253, 186, 116, 0.25);
  }
  .pp-status-cool {
    background: rgba(113, 113, 122, 0.15);
    color: #a1a1aa;
    border: 1px solid rgba(82, 82, 91, 0.4);
  }
  .pp-status-cold {
    background: rgba(63, 63, 70, 0.4);
    color: #71717a;
    border: 1px solid #3f3f46;
  }
`;
