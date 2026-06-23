"use client";

import { useState } from "react";
import type { SidebarPipelineInvestor } from "./types";

/**
 * PIPELINE section — investors the founder is currently engaging with.
 * Each row click injects a "Looking at <name>" prompt into chat.
 *
 * Scales to many investors via status filter pills + scrollable list
 * with a soft cap. "Show all in chat" overflow injects a query the
 * LLM handles.
 */

interface PipelineProps {
  pipeline: SidebarPipelineInvestor[];
  onInjectPrompt: (prompt: string) => void;
}

const STATUS_DOT: Record<string, string> = {
  // warm / committed signals — teal
  committed: "status-warm",
  term_sheet: "status-warm",
  met: "status-warm",
  diligence: "status-warm",
  // active / in motion — amber
  meeting_scheduled: "status-active",
  follow_up: "status-active",
  outreached: "status-active",
  // stale / passed — cool gray
  ghosted: "status-cool",
  soft_pass: "status-cool",
  hard_pass: "status-cool",
  passed: "status-cool",
  rejected: "status-cool",
};

const STATUS_SHORT: Record<string, string> = {
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

const ACTIVE_STATUSES = new Set([
  "outreached",
  "meeting_scheduled",
  "met",
  "follow_up",
  "diligence",
  "term_sheet",
  "committed",
]);

const STALE_STATUSES = new Set([
  "ghosted",
  "soft_pass",
  "hard_pass",
  "passed",
  "rejected",
]);

type Filter = "active" | "all" | "stale";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "all", label: "All" },
  { key: "stale", label: "Stale" },
];

function formatAge(days: number | null): string {
  if (days === null || days === undefined) return "";
  if (days === 0) return "today";
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

const VISIBLE_CAP = 15;

export function Pipeline({ pipeline, onInjectPrompt }: PipelineProps) {
  const [filter, setFilter] = useState<Filter>("active");

  const filtered = pipeline.filter(inv => {
    const s = inv.status || "";
    if (filter === "active") return ACTIVE_STATUSES.has(s) || !s;
    if (filter === "stale") return STALE_STATUSES.has(s);
    return true; // "all"
  });

  const visible = filtered.slice(0, VISIBLE_CAP);
  const overflow = filtered.length - visible.length;

  // Hide filter pills entirely when pipeline is small — they're scale UX
  // and would feel like ceremony with <8 entries.
  const showFilters = pipeline.length > 8;

  return (
    <>
      {showFilters && (
        <div className="sb-pipeline-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              className={`sb-pipeline-filter${filter === f.key ? " active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      <div className="sb-pipeline-list">
        {visible.map((inv) => {
          const dotClass = STATUS_DOT[inv.status || ""] || "status-cold";
          const statusLabel = STATUS_SHORT[inv.status || ""] || inv.status || "";
          const age = formatAge(inv.days_since_update);
          const prompt =
            `Looking at ${inv.name}${inv.firm ? ` (${inv.firm})` : ""}` +
            ` — status: ${inv.status || "unknown"}` +
            (age ? `, ${age} since last activity` : "") +
            `. What do you want to do?`;
          return (
            <button
              key={inv.id}
              type="button"
              className="sb-row"
              onClick={() => onInjectPrompt(prompt)}
              title="Click to focus chat on this investor"
            >
              <div className="sb-row-line1">
                <span className="sb-row-name">{inv.name}</span>
                <span className={`sb-row-dot ${dotClass}`} />
                {age && <span className="sb-row-age">{age}</span>}
              </div>
              <div className="sb-row-line2">
                {inv.firm && <span className="sb-row-secondary">{inv.firm}</span>}
                {statusLabel && (
                  <>
                    {inv.firm && <span className="sb-row-sep">·</span>}
                    <span className="sb-row-secondary">{statusLabel}</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
        {overflow > 0 && (
          <button
            type="button"
            className="sb-overflow"
            onClick={() => onInjectPrompt(
              filter === "active"
                ? "Show me everyone in pipeline including stale ones"
                : "Show me my full pipeline"
            )}
          >
            + {overflow} more
          </button>
        )}
        {visible.length === 0 && (
          <div className="sb-section-empty-msg" style={{ padding: "8px 12px" }}>
            {filter === "active"
              ? "No active conversations. Switch to All or Stale."
              : filter === "stale"
                ? "No stale conversations — keep it up."
                : "Nothing to show."}
          </div>
        )}
      </div>
    </>
  );
}
