"use client";

import { PanelShell } from "./panel-shell";
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
}

export function PanelHost({ panel, onClose, onOpenPanel, onPopPanel, injectChatPrompt }: PanelHostProps) {
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
        body = <PanelStub label="Matches list" hint="Coming in v3 step 5" />;
        break;
      case "investor": {
        title = panel.slug;
        const from = panel.from;
        breadcrumbs = from
          ? [
              { label: panelLabel(from), onClick: () => onPopPanel(panel) },
              { label: panel.slug },
            ]
          : undefined;
        body = <PanelStub label={`Investor detail: ${panel.slug}`} hint="Coming in v3 step 6" />;
        break;
      }
      case "briefs":
        title = "Briefs";
        body = <PanelStub label="Briefs list" hint="Coming in v3 step 7" />;
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
        body = <PanelStub label={`Brief: ${panel.token}`} hint="Coming in v3 step 8" />;
        break;
      }
      case "pipeline":
        title = "Pipeline";
        body = <PanelStub label="Full pipeline" hint="Coming in v3 step 9" />;
        break;
      case "document":
        title = "Document";
        body = <PanelStub label={`Document: ${panel.id}`} hint="Coming in v3 step 10" />;
        break;
    }
  }
  // Suppress unused-param warnings until the per-panel components land
  // and start using these wiring callbacks.
  void onOpenPanel;
  void injectChatPrompt;

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
