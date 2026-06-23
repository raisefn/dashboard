"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { SidebarSection } from "./section";
import { MyRaise } from "./my-raise";
import { Pipeline, applyPipelineFilter, type PipelineFilter } from "./pipeline";
import { SIDEBAR_CSS } from "./styles";
import type { SidebarState } from "./types";
import type { Panel } from "../panels";

interface FounderSidebarProps {
  session: Session | null;
  impersonating: string;
  injectChatPrompt: (prompt: string) => void;
  /** Open a slide-over panel by setting its state. Wired in v3. */
  openPanel: (p: Panel) => void;
  /** Admin slot: rendered at the top of the sidebar when present.
   * Used for the "Acting as" impersonation select. */
  adminHeader?: ReactNode;
}

/**
 * Founder sidebar — reads state from /v1/brain/sidebar-state on mount and
 * on impersonation change. Tool-result SSE events from the chat surface
 * trigger optimistic updates via window CustomEvents:
 *   - raisefn:matches_updated → refetch (already wired in brain-tabs.tsx)
 *   - raisefn:pipeline_updated → refetch
 *   - raisefn:profile_updated → refetch
 *
 * For Phase 2 v1, refetch is the simplest robust path; we'll move to
 * granular optimistic mutations once we see real founder usage.
 */
export function FounderSidebar({
  session,
  impersonating,
  injectChatPrompt,
  openPanel,
  adminHeader,
}: FounderSidebarProps) {
  const [state, setState] = useState<SidebarState | null>(null);
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>("active");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session) return;
      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${session.access_token}`,
        };
        if (impersonating) headers["X-Impersonate"] = impersonating;
        const res = await fetch("/v1/brain/sidebar-state", { headers });
        if (!res.ok || cancelled) return;
        const data: SidebarState = await res.json();
        if (!cancelled) setState(data);
      } catch {
        // Sidebar is best-effort — don't crash the chat surface
      }
    }
    load();

    function onUpdate() { void load(); }
    window.addEventListener("raisefn:matches_updated", onUpdate);
    window.addEventListener("raisefn:pipeline_updated", onUpdate);
    window.addEventListener("raisefn:profile_updated", onUpdate);
    window.addEventListener("raisefn:briefs_updated", onUpdate);
    window.addEventListener("raisefn:documents_updated", onUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("raisefn:matches_updated", onUpdate);
      window.removeEventListener("raisefn:pipeline_updated", onUpdate);
      window.removeEventListener("raisefn:profile_updated", onUpdate);
      window.removeEventListener("raisefn:briefs_updated", onUpdate);
      window.removeEventListener("raisefn:documents_updated", onUpdate);
    };
  }, [session, impersonating]);

  return (
    <aside className="founder-sidebar">
      <style>{SIDEBAR_CSS}</style>

      {adminHeader && <div className="sb-admin-header">{adminHeader}</div>}

      <SidebarSection title="My Raise">
        <MyRaise campaign={state?.campaign || null} onInjectPrompt={injectChatPrompt} />
      </SidebarSection>

      {(() => {
        const allPipeline = state?.pipeline || [];
        const filteredPipeline = applyPipelineFilter(allPipeline, pipelineFilter);
        return (
          <SidebarSection
            title="Pipeline"
            count={filteredPipeline.length}
            onTitleClick={() => openPanel({ kind: "pipeline" })}
          >
            {allPipeline.length > 0 ? (
              <Pipeline
                pipeline={filteredPipeline}
                filter={pipelineFilter}
                onFilterChange={setPipelineFilter}
                showFilters={allPipeline.length > 8}
                onInjectPrompt={injectChatPrompt}
                onOpenPanel={openPanel}
              />
            ) : null}
          </SidebarSection>
        );
      })()}

      <SidebarSection
        title="Matches"
        count={state?.matches?.total_unique ?? 0}
        onTitleClick={() => openPanel({ kind: "matches" })}
      />

      <SidebarSection
        title="Briefs"
        count={state?.briefs?.length ?? 0}
        onTitleClick={() => openPanel({ kind: "briefs" })}
      >
        {state?.briefs?.length ? (
          <>
            {state.briefs.slice(0, 6).map(b => (
              <button
                key={b.token}
                type="button"
                className="sb-row sb-row-link"
                onClick={() => openPanel({ kind: "brief", token: b.token })}
              >
                <div className="sb-row-line1">
                  <span className="sb-row-name">{b.investor_full_name || b.investor_first_name || "Brief"}</span>
                </div>
              </button>
            ))}
            {state.briefs.length > 6 && (
              <button
                type="button"
                className="sb-overflow"
                onClick={() => openPanel({ kind: "briefs" })}
              >
                + {state.briefs.length - 6} more
              </button>
            )}
          </>
        ) : null}
      </SidebarSection>

      <SidebarSection
        title="Documents"
        count={state?.documents?.length ?? 0}
      >
        {state?.documents?.length ? (
          <>
            {state.documents.slice(0, 6).map(d => (
              <button
                key={d.id}
                type="button"
                className="sb-row"
                onClick={() => openPanel({ kind: "document", id: d.id })}
                title="Open document"
              >
                <div className="sb-row-line1">
                  <span className="sb-row-name">{d.filename}</span>
                </div>
                <div className="sb-row-line2">
                  <span className="sb-row-secondary">{d.doc_type.replace(/_/g, " ")}</span>
                </div>
              </button>
            ))}
          </>
        ) : null}
      </SidebarSection>

      <SidebarSection title="Connections">
        <div className="sb-connections">
          <div className="sb-conn-row sb-conn-disabled" title="Phase 5 — send outreach + auto-detect replies">
            <span className="sb-conn-dot" />
            <span className="sb-conn-label">Gmail</span>
            <span className="sb-conn-status">Coming soon</span>
          </div>
          <div className="sb-conn-row sb-conn-disabled" title="Phase 6 — auto-prep + auto-debrief on each meeting">
            <span className="sb-conn-dot" />
            <span className="sb-conn-label">Calendar</span>
            <span className="sb-conn-status">Coming soon</span>
          </div>
          <div className="sb-conn-row sb-conn-disabled" title="Phase 6.5 — auto-sync MRR / growth / runway">
            <span className="sb-conn-dot" />
            <span className="sb-conn-label">Mercury</span>
            <span className="sb-conn-status">Coming soon</span>
          </div>
          <div className="sb-conn-row sb-conn-on" title="Built in — brief view counts surface in chat">
            <span className="sb-conn-dot on" />
            <span className="sb-conn-label">Link tracking</span>
            <span className="sb-conn-status">
              {(state?.briefs?.length || 0) > 0
                ? `${state!.briefs.length} brief${state!.briefs.length === 1 ? "" : "s"} tracked`
                : "On"}
            </span>
          </div>
        </div>
      </SidebarSection>
    </aside>
  );
}
