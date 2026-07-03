"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { SidebarState } from "./sidebar/types";

/**
 * Next up pill — persistent, deterministic, code-driven.
 *
 * Reads /v1/brain/sidebar-state and computes the ONE next action the
 * founder should take based on their current state. NOT prompt-driven
 * — every state → action mapping is decided in TypeScript so it's
 * reliable across sessions. Reviewer 2026-07-03 flagged "hard to know
 * what to do next" as a persistent gap; two data points now.
 *
 * When the founder clicks the action, we inject the exact chat prompt
 * they'd otherwise have to type — respects the "chat is the verb" rule
 * without making the founder guess the phrasing.
 */

interface NextUpPillProps {
  session: Session | null;
  impersonating: string;
  onAction: (prompt: string) => void;
  /** Route certain pill actions to panels instead of the chat input.
   * Currently used for the new-signal state, where the right response
   * is opening the signals panel, not typing something. */
  onOpenPanel?: (kind: "signals") => void;
}

type NextUpKind =
  | "loading"
  | "new-signal"
  | "no-deck"
  | "no-matches"
  | "no-briefs"
  | "no-outreach"
  | "meeting-soon"
  | "stale-outreach"
  | "current";

interface NextUp {
  kind: NextUpKind;
  label: string;
  text: string;
  hint?: string;
  actionLabel?: string;
  actionPrompt?: string;
  done?: boolean;
}

function computeNextUp(state: SidebarState | null): NextUp {
  if (!state) {
    return { kind: "loading", label: "Next up", text: "" };
  }

  // Highest priority: unacknowledged inbound signals. A live investor
  // reply beats everything — no other work matters if you haven't
  // acknowledged fresh warm interest.
  const unack = state.signals_unack_count ?? 0;
  if (unack > 0) {
    return {
      kind: "new-signal",
      label: "New signal",
      text: unack === 1
        ? "An investor moved on your radar."
        : `${unack} new signals from investors on your radar.`,
      hint: "Open Signals to reply, dismiss, or see the rest.",
      actionLabel: "Open signals",
      actionPrompt: "__OPEN_SIGNALS__",
    };
  }

  if (!state.documents || state.documents.length === 0) {
    return {
      kind: "no-deck",
      label: "Next up",
      text: "Upload your deck — I'll build your profile from it.",
      hint: "Drag a PDF, PPT, or Keynote anywhere in the chat.",
    };
  }

  if (!state.matches || (state.matches.total_unique ?? 0) === 0) {
    return {
      kind: "no-matches",
      label: "Next up",
      text: "Pull matches — see who fits your raise.",
      actionLabel: "Ask \"pull matches\"",
      actionPrompt: "Pull matches for me.",
    };
  }

  if (!state.briefs || state.briefs.length === 0) {
    return {
      kind: "no-briefs",
      label: "Next up",
      text: "Pick your top match and generate a brief.",
      hint: "Briefs are one-pagers tuned to each investor's thesis.",
      actionLabel: "Show me my top matches",
      actionPrompt: "Which of my matches should I brief first?",
    };
  }

  const now = Date.now();
  const in14Days = now + 14 * 24 * 60 * 60 * 1000;

  const meetingSoon = (state.pipeline || []).find((p) => {
    if (!p.meeting_scheduled_for) return false;
    const t = Date.parse(p.meeting_scheduled_for);
    return !Number.isNaN(t) && t >= now && t <= in14Days;
  });
  if (meetingSoon) {
    const dt = new Date(meetingSoon.meeting_scheduled_for as string);
    const when = dt.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const who = meetingSoon.name + (meetingSoon.firm ? ` (${meetingSoon.firm})` : "");
    return {
      kind: "meeting-soon",
      label: "Next up",
      text: `Prep for ${who} — ${when}.`,
      actionLabel: "Open prep",
      actionPrompt: `Prep me for the meeting with ${who}.`,
    };
  }

  const activePipeline = (state.pipeline || []).filter(
    (p) => (p.status || "").toLowerCase() !== "passed" && (p.status || "").toLowerCase() !== "closed",
  );

  if (activePipeline.length === 0) {
    return {
      kind: "no-outreach",
      label: "Next up",
      text: "Draft outreach for the briefs you're happy with.",
      hint: "Chat me a name and I'll draft, then you send.",
      actionLabel: "Draft outreach",
      actionPrompt: "Draft outreach for my top brief.",
    };
  }

  const stale = activePipeline.filter(
    (p) => (p.days_since_update ?? 0) >= 7,
  );
  if (stale.length > 0) {
    const top = stale[0];
    return {
      kind: "stale-outreach",
      label: "Next up",
      text: `Follow up — ${stale.length} thread${stale.length === 1 ? "" : "s"} quiet 7+ days.`,
      hint: `Top of list: ${top.name}${top.firm ? ` (${top.firm})` : ""} — ${top.days_since_update} days.`,
      actionLabel: "Draft follow-ups",
      actionPrompt: "Draft a follow-up for the investors that have gone quiet.",
    };
  }

  return {
    kind: "current",
    label: "You're current",
    text: "Nothing urgent. Meetings booked, follow-ups sent.",
    hint: "I'll ping you when something moves.",
    done: true,
  };
}

export function NextUpPill({ session, impersonating, onAction, onOpenPanel }: NextUpPillProps) {
  const [state, setState] = useState<SidebarState | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/sidebar-state", { headers });
      if (!res.ok) return;
      const data: SidebarState = await res.json();
      setState(data);
    } catch {
      // Best-effort — pill just stays in loading state if fetch fails.
    }
  }, [session, impersonating]);

  useEffect(() => {
    void load();
    function onUpdate() { void load(); }
    window.addEventListener("raisefn:matches_updated", onUpdate);
    window.addEventListener("raisefn:pipeline_updated", onUpdate);
    window.addEventListener("raisefn:briefs_updated", onUpdate);
    window.addEventListener("raisefn:documents_updated", onUpdate);
    window.addEventListener("raisefn:profile_updated", onUpdate);
    return () => {
      window.removeEventListener("raisefn:matches_updated", onUpdate);
      window.removeEventListener("raisefn:pipeline_updated", onUpdate);
      window.removeEventListener("raisefn:briefs_updated", onUpdate);
      window.removeEventListener("raisefn:documents_updated", onUpdate);
      window.removeEventListener("raisefn:profile_updated", onUpdate);
    };
  }, [load]);

  const next = useMemo(() => computeNextUp(state), [state]);

  // Reset dismissed when the state kind changes — user gets a new pill
  // once their state advances.
  useEffect(() => { setDismissed(false); }, [next.kind]);

  if (next.kind === "loading" || dismissed) return null;
  // "Current" state = nothing urgent. Don't render an empty-status card
  // just to say "no next action" — that's clutter. The pill exists to
  // name a NEXT ACTION. When there isn't one, get out of the way.
  if (next.kind === "current" || next.done) return null;

  return (
    <div className={`nextup${next.done ? " nextup-done" : ""}`}>
      <style>{NEXTUP_CSS}</style>
      <div className="nextup-left">
        <span className="nextup-dot" aria-hidden="true" />
        <span className="nextup-label">{next.label}</span>
        <div className="nextup-body">
          <div className="nextup-text">{next.text}</div>
          {next.hint && <div className="nextup-hint">{next.hint}</div>}
        </div>
      </div>
      <div className="nextup-right">
        {next.actionLabel && next.actionPrompt && (
          <button
            type="button"
            className="nextup-action"
            onClick={() => {
              if (next.actionPrompt === "__OPEN_SIGNALS__" && onOpenPanel) {
                onOpenPanel("signals");
              } else if (next.actionPrompt) {
                onAction(next.actionPrompt);
              }
            }}
          >
            {next.actionLabel}
          </button>
        )}
        <button
          type="button"
          className="nextup-close"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const NEXTUP_CSS = `
  .nextup {
    margin: 14px 20px 6px;
    padding: 14px 18px;
    background: #1a1104;
    border: 1px solid rgba(249,115,22,0.55);
    border-left: 3px solid #f97316;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    z-index: 5;
    position: relative;
    box-shadow: 0 1px 0 rgba(249,115,22,0.05) inset, 0 4px 12px rgba(0,0,0,0.3);
  }
  .nextup-done {
    background: #0e1a10;
    border-color: rgba(74,222,128,0.5);
    border-left-color: #4ade80;
    box-shadow: 0 1px 0 rgba(74,222,128,0.05) inset, 0 4px 12px rgba(0,0,0,0.3);
  }
  .nextup-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }
  .nextup-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #f97316;
    box-shadow: 0 0 0 3px rgba(249,115,22,0.2);
    flex-shrink: 0;
    animation: nextup-pulse 2.5s ease-in-out infinite;
  }
  .nextup-done .nextup-dot {
    background: #4ade80;
    box-shadow: 0 0 0 3px rgba(74,222,128,0.15);
    animation: none;
  }
  @keyframes nextup-pulse {
    0%, 100% { box-shadow: 0 0 0 3px rgba(249,115,22,0.2); }
    50%      { box-shadow: 0 0 0 6px rgba(249,115,22,0.08); }
  }
  .nextup-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #fdba74;
    font-weight: 700;
    flex-shrink: 0;
  }
  .nextup-done .nextup-label { color: #86efac; }
  .nextup-body { min-width: 0; }
  .nextup-text {
    font-size: 13.5px;
    color: #e4e4e7;
    line-height: 1.35;
  }
  .nextup-hint {
    font-size: 11.5px;
    color: #a1a1aa;
    margin-top: 2px;
  }
  .nextup-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .nextup-action {
    background: #f97316;
    color: #0a0a0a;
    border: none;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 150ms ease;
  }
  .nextup-action:hover { background: #fb923c; }
  .nextup-close {
    background: transparent;
    border: none;
    color: #71717a;
    padding: 4px 6px;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    border-radius: 4px;
    transition: color 150ms ease, background 150ms ease;
  }
  .nextup-close:hover {
    color: #d4d4d8;
    background: rgba(63, 63, 70, 0.4);
  }

  @media (max-width: 640px) {
    .nextup { flex-direction: column; align-items: flex-start; }
    .nextup-right { align-self: stretch; justify-content: flex-end; }
  }
`;
