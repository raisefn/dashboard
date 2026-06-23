"use client";

import type { SidebarCampaign } from "./types";

/**
 * MY RAISE section — shows the founder's active campaign at a glance.
 * Per phase_2_design_language.md, clicking it injects a chat prompt
 * to focus the conversation on the raise.
 */

interface MyRaiseProps {
  campaign: SidebarCampaign | null;
  onInjectPrompt: (prompt: string) => void;
}

const STATUS_LABEL: Record<string, string> = {
  exploring: "Exploring",
  targeting: "Targeting",
  negotiating: "Negotiating",
  closed: "Closed",
  failed: "Failed",
};

function formatAmount(amount: number | null): string {
  if (!amount) return "—";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${amount}`;
}

function formatStage(stage: string | null): string {
  if (!stage) return "";
  return stage.replace(/_/g, "-");
}

function formatSector(sectors: string[]): string {
  if (!sectors.length) return "";
  if (sectors.length === 1) return sectors[0].replace(/_/g, "/");
  return sectors.slice(0, 2).map(s => s.replace(/_/g, "/")).join(" · ");
}

export function MyRaise({ campaign, onInjectPrompt }: MyRaiseProps) {
  // Sidebar mirrors state. Tutoring lives in chat. No campaign yet OR
  // a skeleton campaign with no real fields → render nothing, the
  // SidebarSection will collapse to a dim label.
  if (!campaign) return null;

  const headline = [
    formatAmount(campaign.target_amount_usd),
    formatStage(campaign.stage),
    formatSector(campaign.sectors),
  ].filter(Boolean).filter(s => s !== "—").join(" · ");

  // If we have a campaign row but no real data on it yet, also render
  // nothing — looks the same as no campaign at all.
  if (!headline) return null;

  const statusLabel = STATUS_LABEL[campaign.status] || campaign.status;

  return (
    <button
      type="button"
      className="sb-my-raise"
      onClick={() => onInjectPrompt("Walk me through where I stand on the raise")}
      title="Click to focus chat on this raise"
    >
      <div className="sb-my-raise-line">
        <span className="sb-my-raise-headline">{headline}</span>
      </div>
      <div className="sb-my-raise-meta">
        <span className="sb-my-raise-status">{statusLabel}</span>
        {typeof campaign.days_in === "number" && campaign.days_in > 0 && (
          <>
            <span className="sb-my-raise-sep">·</span>
            <span className="sb-my-raise-days">{campaign.days_in}d in</span>
          </>
        )}
      </div>
    </button>
  );
}
