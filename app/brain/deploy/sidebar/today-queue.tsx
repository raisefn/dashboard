"use client";

import { useMemo } from "react";
import type { SidebarState } from "./types";
import type { Panel } from "../panels";

/**
 * TODAY queue — Linear "My Issues" pattern for a raise.
 *
 * Every item is one thing that needs the founder's attention right now.
 * Each row is a concrete click that does the action (opens a panel or
 * teed-up chat prompt). When empty, states "nothing to handle."
 *
 * Ranked by urgency:
 *   1. Unacked inbound signals (warm reply, brief view crossing)
 *   2. Meetings within 3 days
 *   3. Draft briefs waiting to send
 *   4. Follow-ups quiet 7+ days
 *   5. Meetings 3-14 days out
 *
 * Cap at 8 items — beyond that, the founder has bigger problems than a
 * missing queue row. Overflow doesn't render; sidebar sections carry it.
 *
 * Replaces the ambient "Next up" pill. Reason: floating one-item pill
 * couldn't do the ambient job (invisible when calm) or the alert job
 * (couldn't stack multiple urgent items). Queue does both cleanly.
 */

interface TodayQueueProps {
  state: SidebarState | null;
  signalsUnackCount: number;
  openPanel: (p: Panel) => void;
  /** Direct actions — bypass chat routing. */
  queuePrepFor: (investorSlug: string) => Promise<void> | void;
  queueDraftFollowupFor: (investorSlug: string) => Promise<void> | void;
}

type QueueItem = {
  key: string;
  dot: "urgent" | "warm" | "cool";
  primary: string;
  secondary?: string;
  onClick: () => void;
};

const MAX_ITEMS = 8;

export function TodayQueue({
  state,
  signalsUnackCount,
  openPanel,
  queuePrepFor,
  queueDraftFollowupFor,
}: TodayQueueProps) {
  const items = useMemo<QueueItem[]>(() => {
    if (!state) return [];
    const out: QueueItem[] = [];

    // 1. Unacked signals — could be replies, brief views, doc views.
    // We don't know which without querying /signals; the sidebar-state
    // only carries the count. So the row opens the panel where the
    // detail lives — that's the correct affordance anyway.
    if (signalsUnackCount > 0) {
      out.push({
        key: "signals-unack",
        dot: "urgent",
        primary:
          signalsUnackCount === 1
            ? "New signal from an investor"
            : `${signalsUnackCount} new signals`,
        secondary: "Reply or dismiss",
        onClick: () => openPanel({ kind: "signals" }),
      });
    }

    const now = Date.now();
    const in3Days = now + 3 * 24 * 60 * 60 * 1000;
    const in14Days = now + 14 * 24 * 60 * 60 * 1000;

    // 2. Meetings within 3 days — urgent prep.
    const meetings = (state.pipeline || [])
      .filter((p) => !!p.meeting_scheduled_for)
      .map((p) => ({ p, t: Date.parse(p.meeting_scheduled_for as string) }))
      .filter((m) => !Number.isNaN(m.t) && m.t >= now)
      .sort((a, b) => a.t - b.t);

    for (const { p, t } of meetings) {
      if (t > in3Days) break;
      const dt = new Date(p.meeting_scheduled_for as string);
      const when = dt.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const investorLabel = p.name + (p.firm ? ` (${p.firm})` : "");
      out.push({
        key: `meeting-soon-${p.id}`,
        dot: "urgent",
        primary: `Prep for ${investorLabel}`,
        secondary: when,
        // Direct action — hits /brain/queue/prep/{slug}, appends prep
        // brief in chat log. No chat inject.
        onClick: () => {
          if (p.slug) void queuePrepFor(p.slug);
        },
      });
      if (out.length >= MAX_ITEMS) return out;
    }

    // 3. Draft briefs waiting to be sent — inline action from briefs panel.
    // We don't have brief status in sidebar-state; skip for now, revisit
    // when the state payload carries brief statuses. Placeholder ready.

    // 4. Stale follow-ups — active pipeline entries quiet 7+ days.
    const active = (state.pipeline || []).filter((p) => {
      const s = (p.status || "").toLowerCase();
      return s !== "hard_pass" && s !== "soft_pass" && s !== "ghosted" && s !== "committed";
    });
    const stale = active
      .filter((p) => (p.days_since_update ?? 0) >= 7)
      .sort((a, b) => (b.days_since_update ?? 0) - (a.days_since_update ?? 0));

    if (stale.length > 0) {
      const first = stale[0];
      const rest = stale.length - 1;
      out.push({
        key: "stale-followups",
        dot: "warm",
        primary:
          stale.length === 1
            ? `Follow up with ${first.name}`
            : `Follow up: ${first.name} +${rest} more`,
        secondary: `${first.days_since_update}d quiet`,
        // Direct action — hits /brain/queue/draft_followup/{slug},
        // appends outreach preview card in chat log. No chat inject.
        // Drafts the FIRST stale investor; if there are more, founder
        // handles them iteratively or via chat.
        onClick: () => {
          if (first.slug) void queueDraftFollowupFor(first.slug);
        },
      });
    }

    // 5. Meetings 3-14 days out — cool reminder.
    for (const { p, t } of meetings) {
      if (t <= in3Days || t > in14Days) continue;
      const dt = new Date(p.meeting_scheduled_for as string);
      const when = dt.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const investorLabel = p.name + (p.firm ? ` (${p.firm})` : "");
      out.push({
        key: `meeting-later-${p.id}`,
        dot: "cool",
        primary: `Meeting: ${investorLabel}`,
        secondary: when,
        onClick: () => {
          if (p.slug) void queuePrepFor(p.slug);
        },
      });
      if (out.length >= MAX_ITEMS) return out;
    }

    return out.slice(0, MAX_ITEMS);
  }, [state, signalsUnackCount, openPanel, queuePrepFor, queueDraftFollowupFor]);

  return (
    <div className="sb-today">
      <style>{TODAY_CSS}</style>
      <div className="sb-today-header">
        <span className="sb-today-title">Today</span>
        {items.length > 0 && (
          <span className="sb-today-count">{items.length}</span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="sb-today-empty">Nothing to handle right now.</div>
      ) : (
        <ul className="sb-today-list">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className="sb-today-row"
                onClick={item.onClick}
              >
                <span className={`sb-today-dot sb-today-dot-${item.dot}`} aria-hidden />
                <span className="sb-today-body">
                  <span className="sb-today-primary">{item.primary}</span>
                  {item.secondary && (
                    <span className="sb-today-secondary">{item.secondary}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const TODAY_CSS = `
  .sb-today {
    padding: 8px 8px 4px;
    margin-bottom: 8px;
    border-bottom: 1px solid #1c1c1f;
  }
  .sb-today-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px 8px;
  }
  .sb-today-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #a1a1aa;
  }
  .sb-today-count {
    font-size: 11px;
    font-weight: 500;
    color: #d4d4d8;
    background: #27272a;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .sb-today-empty {
    padding: 8px 12px 14px;
    font-size: 12px;
    color: #52525b;
    font-style: italic;
  }
  .sb-today-list {
    list-style: none;
    margin: 0;
    padding: 0 0 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .sb-today-row {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 12px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    font-family: inherit;
    transition: background 150ms ease;
  }
  .sb-today-row:hover {
    background: rgba(63, 63, 70, 0.4);
  }
  .sb-today-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 6px;
  }
  .sb-today-dot-urgent { background: #f97316; box-shadow: 0 0 0 2px rgba(249,115,22,0.2); }
  .sb-today-dot-warm { background: #fbbf24; }
  .sb-today-dot-cool { background: #71717a; }
  .sb-today-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }
  .sb-today-primary {
    font-size: 12.5px;
    color: #e4e4e7;
    line-height: 1.35;
    font-weight: 500;
  }
  .sb-today-secondary {
    font-size: 11px;
    color: #71717a;
    line-height: 1.3;
  }
`;
