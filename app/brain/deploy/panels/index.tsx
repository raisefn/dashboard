"use client";

import type { Session } from "@supabase/supabase-js";
import { PanelShell } from "./panel-shell";
import { MatchesPanel } from "./matches-panel";
import { InvestorPanel } from "./investor-panel";
import { BriefsPanel } from "./briefs-panel";
import { BriefDetailPanel } from "./brief-detail-panel";
import { PipelinePanel } from "./pipeline-panel";
import { DocumentPanel } from "./document-panel";
import { DocumentsPanel } from "./documents-panel";
import { SharpenPanel } from "./sharpen-panel";
import { SignalsPanel } from "./signals-panel";
import type { Panel } from "./use-panel-state";

const SHARPEN_SECTION_TITLES: Record<string, string> = {
  basics: "Your raise basics",
  story: "Your story",
  team: "Your team & cap table",
  proof: "Your proof",
  past: "Past conversations",
};

/**
 * Panel router — picks the right component for the active panel state.
 * Renders nothing when panel is null (the shell remains in the DOM
 * with slide-out transform so the close animation runs).
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
      case "documents":
        title = "Documents";
        body = (
          <DocumentsPanel
            session={session}
            impersonating={impersonating}
            onOpenPanel={onOpenPanel}
          />
        );
        break;
      case "document": {
        title = "Document";
        const from = panel.from;
        breadcrumbs = from
          ? [
              { label: panelLabel(from), onClick: () => onPopPanel(panel) },
              { label: "Document" },
            ]
          : undefined;
        body = (
          <DocumentPanel
            id={panel.id}
            session={session}
            impersonating={impersonating}
            injectChatPrompt={injectChatPrompt}
          />
        );
        break;
      }
      case "signals":
        title = "Signals";
        body = (
          <SignalsPanel
            session={session}
            impersonating={impersonating}
            injectChatPrompt={injectChatPrompt}
            onSignalActed={() => {
              // Close the panel so the chat response is visible while it
              // streams. Sidebar badge refreshes via the
              // raisefn:signals_updated event the caller wires below.
              onClose();
              window.dispatchEvent(new CustomEvent("raisefn:signals_updated"));
            }}
          />
        );
        break;
      case "sharpen": {
        title = SHARPEN_SECTION_TITLES[panel.section] || "Fine tune";
        breadcrumbs = [{ label: "Fine tune your agent" }, { label: title }];
        body = (
          <SharpenPanel
            sectionId={panel.section}
            session={session}
            impersonating={impersonating}
          />
        );
        break;
      }
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
    case "documents": return "Documents";
    case "pipeline": return "Pipeline";
    case "investor": return p.slug;
    case "brief": return "Brief";
    case "document": return "Document";
    case "sharpen": return "Fine tune your agent";
    case "signals": return "Signals";
  }
}

export { type Panel } from "./use-panel-state";
export { usePanelState } from "./use-panel-state";
