"use client";

import type { Session } from "@supabase/supabase-js";
import { PanelShell } from "./panel-shell";
import { MatchesPanel } from "./matches-panel";
import { InvestorPanel } from "./investor-panel";
import { BriefsPanel } from "./briefs-panel";
import { BriefDetailPanel } from "./brief-detail-panel";
import { PipelinePanel } from "./pipeline-panel";
import type { Panel } from "./use-panel-state";

/**
 * Panel router — picks the right component for the active panel state.
 * Renders nothing when panel is null (the shell remains in the DOM
 * with slide-out transform so the close animation runs).
 *
 * Panel content components (Matches list, Investor detail, etc.) will
 * be added in Steps 5-10 of v3. For now this is a stub that renders
 * a placeholder so we can verify the shell + state + layout work end
 * to end.
 */
interface PanelHostProps {
  panel: Panel | null;
  onClose: () => void;
  onOpenPanel: (p: Panel) => void;
  onPopPanel: (p: Panel) => void;
  injectChatPrompt: (prompt: string) => void;
  session: Session | null;
  impersonating: string;
}

export function PanelHost({ panel, onClose, onOpenPanel, onPopPanel, injectChatPrompt, session, impersonating }: PanelHostProps) {
  // Compute title + breadcrumbs based on panel kind. Will be replaced
  // by per-panel components once those land (each will own its own
  // title/breadcrumb logic).
  let title = "";
  let breadcrumbs: { label: string; onClick?: () => void }[] | undefined;
  let body: React.ReactNode = null;

  if (panel) {
    switch (panel.kind) {
      case "matches":
        title = "Matches";
        body = (
          <MatchesPanel
            session={session}
            impersonating={impersonating}
            onOpenPanel={onOpenPanel}
          />
        );
        break;
      case "investor": {
        // Title falls back to slug pretty-cased until the investor data
        // loads; once it loads, the InvestorPanel component renders its
        // own H1 with the canonical display name. Keeping the shell
        // title minimal here to avoid double-rendering the name.
        title = panel.slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        const from = panel.from;
        breadcrumbs = from
          ? [
              { label: panelLabel(from), onClick: () => onPopPanel(panel) },
              { label: title },
            ]
          : undefined;
        body = (
          <InvestorPanel
            slug={panel.slug}
            session={session}
            impersonating={impersonating}
            injectChatPrompt={injectChatPrompt}
            onOpenPanel={onOpenPanel}
          />
        );
        break;
      }
      case "briefs":
        title = "Briefs";
        body = (
          <BriefsPanel
            session={session}
            impersonating={impersonating}
            onOpenPanel={onOpenPanel}
          />
        );
        break;
      case "brief": {
        title = "Brief";
        const from = panel.from;
        breadcrumbs = from
          ? [
              { label: panelLabel(from), onClick: () => onPopPanel(panel) },
              { label: "Brief" },
            ]
          : undefined;
        body = (
          <BriefDetailPanel
            token={panel.token}
            session={session}
            impersonating={impersonating}
          />
        );
        break;
      }
      case "pipeline":
        title = "Pipeline";
        body = (
          <PipelinePanel
            session={session}
            impersonating={impersonating}
            onInjectPrompt={injectChatPrompt}
            onOpenPanel={onOpenPanel}
          />
        );
        break;
      case "document":
        title = "Document";
        body = <PanelStub label={`Document: ${panel.id}`} hint="Coming in v3 step 10" />;
        break;
    }
  }

  return (
    <PanelShell
      open={panel !== null}
      title={title}
      breadcrumbs={breadcrumbs}
      onClose={onClose}
    >
      {body}
    </PanelShell>
  );
}

function panelLabel(p: Panel): string {
  switch (p.kind) {
    case "matches": return "Matches";
    case "briefs": return "Briefs";
    case "pipeline": return "Pipeline";
    case "investor": return p.slug;
    case "brief": return "Brief";
    case "document": return "Document";
  }
}

function PanelStub({ label, hint }: { label: string; hint: string }) {
  return (
    <div style={{ padding: "8px 0", color: "#a1a1aa" }}>
      <div style={{ fontSize: "13px", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "11px", color: "#71717a" }}>{hint}</div>
    </div>
  );
}

export { type Panel } from "./use-panel-state";
export { usePanelState } from "./use-panel-state";
