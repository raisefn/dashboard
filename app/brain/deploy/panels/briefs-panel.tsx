"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Panel } from "./use-panel-state";
import { UpgradePrompt } from "@/components/upgrade-prompt";

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
  // Custom brief creation — simple input. Format: 'Name, Firm' or just name.
  const [customInvestor, setCustomInvestor] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Cap-hit state — same pattern as matches-panel. When generate-brief
  // returns 429, render UpgradePrompt above the create input instead of
  // a red error line.
  const [paywall, setPaywall] = useState<{ reason: "briefs"; current: number; cap: number } | null>(null);

  async function createCustomBrief() {
    if (!session) return;
    const raw = customInvestor.trim();
    if (!raw) return;
    setCreating(true);
    setCreateError(null);
    try {
      const founderEmail = (session.user?.email || "").trim().toLowerCase();
      if (!founderEmail) throw new Error("No founder email on session.");
      // Parse 'Name, Firm' — if no comma, treat whole string as name.
      const commaIdx = raw.indexOf(",");
      const name = (commaIdx > 0 ? raw.slice(0, commaIdx) : raw).trim();
      const firm = commaIdx > 0 ? raw.slice(commaIdx + 1).trim() : "";
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/generate-brief", {
        method: "POST",
        headers,
        body: JSON.stringify({
          founder_email: impersonating || founderEmail,
          investor_inline: { name, firm: firm || null },
        }),
      });
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        const detail: string = typeof body.detail === "string" ? body.detail : "";
        const match = detail.match(/\((\d+)\/(\d+)\)/);
        setPaywall({
          reason: "briefs",
          current: match ? Number(match[1]) : 0,
          cap: match ? Number(match[2]) : 0,
        });
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed (${res.status})`);
      }
      const data = await res.json();
      setCustomInvestor("");
      // Refresh list, then open the new brief if we got a token back
      await load();
      if (data.token) {
        onOpenPanel({ kind: "brief", token: data.token, from: { kind: "briefs" } });
      }
      try { window.dispatchEvent(new CustomEvent("raisefn:briefs_updated")); } catch { /* defensive */ }
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create brief.");
    } finally {
      setCreating(false);
    }
  }

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

      {/* Upgrade prompt — fires when generate-brief returns 429. */}
      {paywall && (
        <div className="bp-upgrade-wrap">
          <UpgradePrompt
            session={session}
            reason={paywall.reason}
            currentCount={paywall.current}
            cap={paywall.cap}
            onDismiss={() => setPaywall(null)}
          />
        </div>
      )}

      {/* Custom brief creation — always at top */}
      <div className="bp-create">
        <div className="bp-create-label">Brief an investor</div>
        <div className="bp-create-row">
          <input
            type="text"
            className="bp-create-input"
            placeholder="Name, Firm — e.g. Sarah Chen, Greenoak Capital"
            value={customInvestor}
            onChange={(e) => setCustomInvestor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !creating && customInvestor.trim()) {
                void createCustomBrief();
              }
            }}
            disabled={creating}
          />
          <button
            type="button"
            className="bp-create-btn"
            onClick={() => void createCustomBrief()}
            disabled={creating || !customInvestor.trim()}
          >
            {creating ? "Generating…" : "Generate"}
          </button>
        </div>
        {createError && <p className="bp-create-error">{createError}</p>}
        <p className="bp-create-hint">
          Brief any investor — matched, known, or just heard about. Agent pulls public data and structures it.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="bp-empty">
          <p className="bp-empty-title">Your investor briefs will show up here.</p>
          <p className="bp-empty-sub">One-page research on any investor — thesis, check size, warm-intro paths — tailored to your raise. Ask raise(fn) to &quot;generate a brief on [name]&quot; to get started.</p>
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

  .bp-upgrade-wrap { margin-bottom: 20px; }

  /* Custom brief creation row */
  .bp-create {
    margin-bottom: 24px;
    padding: 14px;
    border: 1px solid #27272a;
    background: rgba(24, 24, 27, 0.4);
    border-radius: 8px;
  }
  .bp-create-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #71717a;
    margin-bottom: 8px;
  }
  .bp-create-row { display: flex; gap: 8px; }
  .bp-create-input {
    flex: 1;
    background: rgba(9, 9, 11, 0.6);
    border: 1px solid #3f3f46;
    border-radius: 6px;
    color: #e4e4e7;
    font-family: inherit;
    font-size: 13px;
    padding: 8px 12px;
    transition: border-color 150ms ease;
  }
  .bp-create-input:focus { outline: none; border-color: #2dd4bf; }
  .bp-create-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .bp-create-btn {
    background: #14b8a6;
    color: #f4f4f5;
    border: 1px solid transparent;
    border-radius: 6px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 16px;
    cursor: pointer;
    transition: background 150ms ease;
  }
  .bp-create-btn:hover { background: #0d9488; }
  .bp-create-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #14b8a6; }
  .bp-create-hint { margin: 8px 0 0; font-size: 11px; color: #71717a; }
  .bp-create-error { margin: 8px 0 0; font-size: 12px; color: #fca5a5; }

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
