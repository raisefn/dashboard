"use client";

import type { SidebarPipelineInvestor } from "./types";

/**
 * PIPELINE section — investors the founder is currently engaging with.
 * Each row is clickable → injects "Tell me about <name> (status: X, Yd
 * since last activity). What do you want to do?" into chat.
 *
 * Status dot colors per phase_2_design_language.md status-* tokens.
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

function formatAge(days: number | null): string {
  if (days === null || days === undefined) return "";
  if (days === 0) return "today";
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

export function Pipeline({ pipeline, onInjectPrompt }: PipelineProps) {
  const visible = pipeline.slice(0, 8);
  const overflow = pipeline.length - visible.length;

  return (
    <>
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
          onClick={() => onInjectPrompt("Show me my full pipeline")}
        >
          + {overflow} more
        </button>
      )}
    </>
  );
}
