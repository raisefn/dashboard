"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { SidebarState } from "./types";
import type { Panel } from "../panels";

/**
 * TODAY queue — Linear "My Issues" pattern for a raise.
 *
 * Every item is one thing that needs the founder's attention right now.
 * Each row is a concrete click that does the action. Every row also has
 * an X to dismiss.
 *
 * Dismissal semantics (research-driven 2026-07-03):
 *   - Onboarding rows: X = skip. Chain advances to next step. Persists
 *     until state changes (upload a deck later → row was dismissed but
 *     now irrelevant, no-op).
 *   - Active-state rows: X = snooze 24h. Reappears next day if
 *     underlying condition still applies. Prevents info loss.
 *
 * Progressive onboarding chain:
 *   deck → matches → briefs → Gmail → Calendar
 * Each step surfaces ONE row. If dismissed, the chain advances as if
 * that step was handled some other way.
 *
 * Cap at 8 items.
 */

// localStorage key prefixes for dismissal state.
const LS_ONBOARD_DISMISS_PREFIX = "raisefn:queue:dismissed:";
const LS_ACTIVE_SNOOZE_PREFIX = "raisefn:queue:snoozed:";
const ACTIVE_SNOOZE_MS = 24 * 60 * 60 * 1000;
// Onboarding dismissals expire after 7 days so account resets (via
// scripts/reset_founder_data.py) don't strand the founder with a
// silent queue. Pre-fix (2026-07-03), dismissing "Upload your deck"
// once left it hidden forever; nuking + re-signing-up left the founder
// staring at an empty TODAY section wondering what to do next.
const ONBOARD_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

interface TodayQueueProps {
  state: SidebarState | null;
  signalsUnackCount: number;
  openPanel: (p: Panel) => void;
  queuePrepFor: (investorSlug: string) => Promise<void> | void;
  queueDraftFollowupFor: (investorSlug: string) => Promise<void> | void;
  /** Fires the /queue/match backend + refetches sidebar state on success. */
  queuePullMatches: () => Promise<void> | void;
  /** Fires Gmail OAuth authorize flow (full-page redirect to Google). */
  queueConnectGmail: () => Promise<void> | void;
  /** True when Gmail is connected with a valid session. */
  hasGmailConnected: boolean;
  /** True when the Gmail grant includes calendar.events scope. */
  hasCalendarScope: boolean;
}

type RowKind = "onboarding" | "active" | "suggested";

type QueueItem = {
  key: string;
  kind: RowKind;
  dot: "urgent" | "warm" | "cool" | "suggested";
  primary: string;
  secondary?: string;
  onClick: () => void;
};

const MAX_ITEMS = 8;

function isOnboardDismissed(key: string, now: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(LS_ONBOARD_DISMISS_PREFIX + key);
    if (!raw) return false;
    // Legacy value from before 7-day expiry landed. Treat as
    // dismissed-at-epoch-0 so it expires immediately on the next
    // check (the account has been around long enough to warrant a
    // fresh reminder anyway).
    if (raw === "1") {
      try { localStorage.removeItem(LS_ONBOARD_DISMISS_PREFIX + key); } catch { /* ignore */ }
      return false;
    }
    const dismissedAt = parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) return false;
    if (now - dismissedAt > ONBOARD_DISMISS_MS) {
      // Expired — clean up so localStorage doesn't accumulate.
      try { localStorage.removeItem(LS_ONBOARD_DISMISS_PREFIX + key); } catch { /* ignore */ }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function isActiveSnoozed(key: string, now: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(LS_ACTIVE_SNOOZE_PREFIX + key);
    if (!raw) return false;
    const until = parseInt(raw, 10);
    if (Number.isNaN(until)) return false;
    return until > now;
  } catch {
    return false;
  }
}

export function TodayQueue({
  state,
  signalsUnackCount,
  openPanel,
  queuePrepFor,
  queueDraftFollowupFor,
  queuePullMatches,
  queueConnectGmail,
  hasGmailConnected,
  hasCalendarScope,
}: TodayQueueProps) {
  // Tick to force re-compute after dismissal writes to localStorage.
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);

  // Sweep snoozed active rows once on mount + every minute so expired
  // snoozes drop off. Cheap — reads a handful of localStorage keys.
  useEffect(() => {
    const interval = setInterval(bump, 60_000);
    return () => clearInterval(interval);
  }, [bump]);

  const dismissOnboarding = useCallback(
    (key: string) => {
      if (typeof window === "undefined") return;
      try {
        // Persist as timestamp instead of "1" so isOnboardDismissed can
        // expire it after ONBOARD_DISMISS_MS (7 days). This prevents
        // account-reset stranding.
        localStorage.setItem(LS_ONBOARD_DISMISS_PREFIX + key, String(Date.now()));
      } catch { /* ignore */ }
      bump();
    },
    [bump],
  );

  const snoozeActive = useCallback(
    (key: string) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(
          LS_ACTIVE_SNOOZE_PREFIX + key,
          String(Date.now() + ACTIVE_SNOOZE_MS),
        );
      } catch { /* ignore */ }
      bump();
    },
    [bump],
  );

  const items = useMemo<QueueItem[]>(() => {
    if (!state) return [];
    const out: QueueItem[] = [];
    const now = Date.now();
    // `tick` is a dependency so this re-runs after dismissal actions.
    void tick;

    // ─── Active-state rows ────────────────────────────────────────

    if (signalsUnackCount > 0 && !isActiveSnoozed("signals-unack", now)) {
      out.push({
        key: "signals-unack",
        kind: "active",
        dot: "urgent",
        primary:
          signalsUnackCount === 1
            ? "New signal from an investor"
            : `${signalsUnackCount} new signals`,
        secondary: "Reply or dismiss",
        onClick: () => openPanel({ kind: "signals" }),
      });
    }

    const in3Days = now + 3 * 24 * 60 * 60 * 1000;
    const in14Days = now + 14 * 24 * 60 * 60 * 1000;

    const meetings = (state.pipeline || [])
      .filter((p) => !!p.meeting_scheduled_for)
      .map((p) => ({ p, t: Date.parse(p.meeting_scheduled_for as string) }))
      .filter((m) => !Number.isNaN(m.t) && m.t >= now)
      .sort((a, b) => a.t - b.t);

    for (const { p, t } of meetings) {
      if (t > in3Days) break;
      const key = `meeting-soon-${p.id}`;
      if (isActiveSnoozed(key, now)) continue;
      const dt = new Date(p.meeting_scheduled_for as string);
      const when = dt.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const investorLabel = p.name + (p.firm ? ` (${p.firm})` : "");
      out.push({
        key,
        kind: "active",
        dot: "urgent",
        primary: `Prep for ${investorLabel}`,
        secondary: when,
        onClick: () => {
          if (p.slug) void queuePrepFor(p.slug);
        },
      });
      if (out.length >= MAX_ITEMS) return out;
    }

    // ─── Progressive onboarding — ONE row at a time ───────────────
    // Chain advances if a step is dismissed. Rows drop off when state
    // changes (deck uploaded → row gone regardless of dismissal).

    const documentsCount = state.documents?.length || 0;
    const matchesCount = state.matches?.total_unique || 0;
    const briefsCount = state.briefs?.length || 0;

    const needDeck = documentsCount === 0 && !isOnboardDismissed("onboard-deck", now);
    const needMatches =
      !needDeck && matchesCount === 0 && !isOnboardDismissed("onboard-matches", now);
    const needBriefs =
      !needDeck && !needMatches && briefsCount === 0 && !isOnboardDismissed("onboard-briefs", now);
    const needGmail =
      !needDeck && !needMatches && !needBriefs &&
      !hasGmailConnected && !isOnboardDismissed("onboard-gmail", now);
    const needCalendar =
      !needDeck && !needMatches && !needBriefs && !needGmail &&
      hasGmailConnected && !hasCalendarScope && !isOnboardDismissed("onboard-calendar", now);

    if (needDeck) {
      out.push({
        key: "onboard-deck",
        kind: "onboarding",
        dot: "urgent",
        primary: "Upload your deck",
        secondary: "I'll build your profile from it",
        onClick: () => openPanel({ kind: "documents" }),
      });
    } else if (needMatches) {
      out.push({
        key: "onboard-matches",
        kind: "onboarding",
        dot: "urgent",
        primary: "Pull your first matches",
        secondary: "Investors that fit your raise",
        onClick: () => void queuePullMatches(),
      });
    } else if (needBriefs) {
      out.push({
        key: "onboard-briefs",
        kind: "onboarding",
        dot: "urgent",
        primary: "Generate your first brief",
        secondary: "One-page pitch tuned to a specific investor",
        onClick: () => openPanel({ kind: "matches" }),
      });
    } else if (needGmail) {
      out.push({
        key: "onboard-gmail",
        kind: "onboarding",
        dot: "urgent",
        primary: "Connect Gmail",
        secondary: "So I can send outreach for you",
        onClick: () => void queueConnectGmail(),
      });
    } else if (needCalendar) {
      out.push({
        key: "onboard-calendar",
        kind: "onboarding",
        dot: "urgent",
        primary: "Enable Calendar",
        secondary: "Reconnect Gmail to grant calendar scope",
        onClick: () => void queueConnectGmail(),
      });
    }

    // ─── SUGGESTED tier ──────────────────────────────────────────
    // Only fills in when the urgent/onboarding tiers had nothing to
    // surface. Prevents crowding an already-active queue with ambient
    // "you could do X" suggestions. Deterministic rules over state,
    // snoozable 24h like other active-state rows.
    if (out.length === 0) {
      const gaps = (state.sharpen || []).filter(
        (r) => r.status === "gap" || r.status === "empty",
      ).length;
      if (gaps > 0 && !isActiveSnoozed("suggest-gaps", now)) {
        out.push({
          key: "suggest-gaps",
          kind: "suggested",
          dot: "suggested",
          primary: `Sharpen ${gaps} gap${gaps === 1 ? "" : "s"} in your profile`,
          secondary: "Sharper input, sharper output",
          onClick: () => openPanel({ kind: "sharpen", section: "basics" }),
        });
      }
      const matchesCountForSuggest = state.matches?.total_unique || 0;
      const briefsCountForSuggest = state.briefs?.length || 0;
      if (
        matchesCountForSuggest > 0 &&
        briefsCountForSuggest === 0 &&
        !isActiveSnoozed("suggest-brief", now)
      ) {
        out.push({
          key: "suggest-brief",
          kind: "suggested",
          dot: "suggested",
          primary: `Draft a brief for one of your ${matchesCountForSuggest} matches`,
          secondary: "Pick a match, I'll draft a one-pager",
          onClick: () => openPanel({ kind: "matches" }),
        });
      }
    }

    // ─── Stale follow-ups ────────────────────────────────────────

    const active = (state.pipeline || []).filter((p) => {
      const s = (p.status || "").toLowerCase();
      return s !== "hard_pass" && s !== "soft_pass" && s !== "ghosted" && s !== "committed";
    });
    const stale = active
      .filter((p) => (p.days_since_update ?? 0) >= 7)
      .sort((a, b) => (b.days_since_update ?? 0) - (a.days_since_update ?? 0));

    if (stale.length > 0 && !isActiveSnoozed("stale-followups", now)) {
      const first = stale[0];
      const rest = stale.length - 1;
      out.push({
        key: "stale-followups",
        kind: "active",
        dot: "warm",
        primary:
          stale.length === 1
            ? `Follow up with ${first.name}`
            : `Follow up: ${first.name} +${rest} more`,
        secondary: `${first.days_since_update}d quiet`,
        onClick: () => {
          if (first.slug) void queueDraftFollowupFor(first.slug);
        },
      });
    }

    // ─── Meetings 3-14 days out — cool reminder ───────────────────

    for (const { p, t } of meetings) {
      if (t <= in3Days || t > in14Days) continue;
      const key = `meeting-later-${p.id}`;
      if (isActiveSnoozed(key, now)) continue;
      const dt = new Date(p.meeting_scheduled_for as string);
      const when = dt.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const investorLabel = p.name + (p.firm ? ` (${p.firm})` : "");
      out.push({
        key,
        kind: "active",
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
  }, [
    state,
    signalsUnackCount,
    openPanel,
    queuePrepFor,
    queueDraftFollowupFor,
    queuePullMatches,
    queueConnectGmail,
    hasGmailConnected,
    hasCalendarScope,
    tick,
  ]);

  const handleDismiss = useCallback(
    (item: QueueItem) => {
      if (item.kind === "onboarding") {
        dismissOnboarding(item.key);
      } else {
        snoozeActive(item.key);
      }
    },
    [dismissOnboarding, snoozeActive],
  );

  const todayItems = items.filter((i) => i.kind !== "suggested");
  const suggestedItems = items.filter((i) => i.kind === "suggested");
  const allEmpty = todayItems.length === 0 && suggestedItems.length === 0;

  return (
    <div className="sb-today">
      <style>{TODAY_CSS}</style>

      {/* TODAY — urgent + onboarding items */}
      {(todayItems.length > 0 || allEmpty) && (
        <div className="sb-today-section">
          <div className="sb-today-header">
            <span className="sb-today-title">Today</span>
            {todayItems.length > 0 && (
              <span className="sb-today-count">{todayItems.length}</span>
            )}
          </div>
          {allEmpty ? (
            <div className="sb-today-empty">No new signals from our actions yet.</div>
          ) : (
            <SectionList items={todayItems} onDismiss={handleDismiss} />
          )}
        </div>
      )}

      {/* SUGGESTED — contextual next-actions */}
      {suggestedItems.length > 0 && (
        <div className="sb-today-section sb-today-section-suggested">
          <div className="sb-today-header">
            <span className="sb-today-title">Suggested</span>
            <span className="sb-today-count">{suggestedItems.length}</span>
          </div>
          <SectionList items={suggestedItems} onDismiss={handleDismiss} />
        </div>
      )}
    </div>
  );
}

function SectionList({
  items,
  onDismiss,
}: {
  items: QueueItem[];
  onDismiss: (item: QueueItem) => void;
}) {
  return (
    <ul className="sb-today-list">
      {items.map((item) => (
        <li key={item.key} className="sb-today-item">
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
          <button
            type="button"
            className="sb-today-dismiss"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(item);
            }}
            aria-label={
              item.kind === "onboarding" ? "Skip this step" : "Snooze for 24 hours"
            }
            title={
              item.kind === "onboarding" ? "Skip this step" : "Snooze 24h"
            }
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

const TODAY_CSS = `
  .sb-today {
    padding: 8px 8px 4px;
    margin-bottom: 8px;
    border-bottom: 1px solid #1c1c1f;
  }
  .sb-today-section + .sb-today-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #1c1c1f;
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
  .sb-today-item {
    display: flex;
    align-items: stretch;
    gap: 2px;
    border-radius: 6px;
    transition: background 150ms ease;
  }
  .sb-today-item:hover {
    background: rgba(63, 63, 70, 0.4);
  }
  .sb-today-item:hover .sb-today-dismiss {
    opacity: 1;
  }
  .sb-today-row {
    flex: 1;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 12px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    border-radius: 6px 0 0 6px;
    color: inherit;
    font-family: inherit;
    min-width: 0;
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
  .sb-today-dot-suggested { background: #2dd4bf; box-shadow: 0 0 0 2px rgba(45,212,191,0.15); }
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
  .sb-today-dismiss {
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    background: none;
    border: none;
    color: #52525b;
    font-family: inherit;
    font-size: 12px;
    cursor: pointer;
    border-radius: 0 6px 6px 0;
    opacity: 0;
    transition: opacity 150ms ease, color 150ms ease;
  }
  .sb-today-dismiss:hover {
    color: #d4d4d8;
  }
`;
