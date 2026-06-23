"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { SidebarSection } from "./section";
import { MyRaise } from "./my-raise";
import { Pipeline } from "./pipeline";
import { SIDEBAR_CSS } from "./styles";
import type { SidebarState } from "./types";

interface FounderSidebarProps {
  session: Session | null;
  impersonating: string;
  injectChatPrompt: (prompt: string) => void;
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
export function FounderSidebar({ session, impersonating, injectChatPrompt }: FounderSidebarProps) {
  const [state, setState] = useState<SidebarState | null>(null);

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

    return () => {
      cancelled = true;
      window.removeEventListener("raisefn:matches_updated", onUpdate);
      window.removeEventListener("raisefn:pipeline_updated", onUpdate);
      window.removeEventListener("raisefn:profile_updated", onUpdate);
      window.removeEventListener("raisefn:briefs_updated", onUpdate);
    };
  }, [session, impersonating]);

  return (
    <aside className="founder-sidebar">
      <style>{SIDEBAR_CSS}</style>

      <SidebarSection title="My Raise" defaultOpen>
        <MyRaise campaign={state?.campaign || null} onInjectPrompt={injectChatPrompt} />
      </SidebarSection>

      <SidebarSection
        title="Pipeline"
        count={state?.pipeline?.length ?? 0}
        defaultOpen
        emptyMessage="No pipeline yet."
        emptyAction={{
          label: "Ask for matches",
          injectPrompt: "Pull me investor matches",
        }}
        onInjectPrompt={injectChatPrompt}
      >
        {state?.pipeline?.length ? (
          <Pipeline pipeline={state.pipeline} onInjectPrompt={injectChatPrompt} />
        ) : null}
      </SidebarSection>

      <SidebarSection
        title="Matches"
        count={state?.matches?.total_unique ?? 0}
        defaultOpen={false}
        emptyMessage="No matches yet."
        emptyAction={{
          label: "Ask for matches",
          injectPrompt: "Pull me investor matches",
        }}
        onInjectPrompt={injectChatPrompt}
      >
        {state?.matches?.latest_batch ? (
          <div className="sb-matches-summary">
            <div className="sb-matches-line1">
              <span className="sb-matches-count">{state.matches.total_unique} unique</span>
              <span className="sb-matches-sep">·</span>
              <span className="sb-matches-batches">{state.matches.batches_count} run{state.matches.batches_count === 1 ? "" : "s"}</span>
            </div>
            <a className="sb-matches-link" href="/brain/matches">Open Matches →</a>
          </div>
        ) : null}
      </SidebarSection>

      <SidebarSection
        title="Briefs"
        count={state?.briefs?.length ?? 0}
        defaultOpen={false}
        emptyMessage="No briefs yet."
      >
        {state?.briefs?.length ? (
          <>
            {state.briefs.slice(0, 6).map(b => (
              <a
                key={b.token}
                className="sb-row sb-row-link"
                href={`/brain/briefs/${b.token}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="sb-row-line1">
                  <span className="sb-row-name">{b.investor_full_name || b.investor_first_name || "Brief"}</span>
                </div>
              </a>
            ))}
            {state.briefs.length > 6 && (
              <a className="sb-overflow" href="/brain/briefs">+ {state.briefs.length - 6} more</a>
            )}
          </>
        ) : null}
      </SidebarSection>

      <SidebarSection
        title="Documents"
        count={state?.documents?.length ?? 0}
        defaultOpen={false}
        emptyMessage="No documents yet. Drop your deck in chat."
      >
        {state?.documents?.length ? (
          <>
            {state.documents.slice(0, 6).map(d => (
              <button
                key={d.id}
                type="button"
                className="sb-row"
                onClick={() => injectChatPrompt(`Take another look at ${d.filename}`)}
                title="Click to re-analyze"
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

      <SidebarSection
        title="Activity"
        defaultOpen={false}
        emptyMessage="No activity yet."
      >
        {state?.activity?.length ? (
          <>
            {state.activity.slice(0, 8).map(e => (
              <div key={e.id} className="sb-row sb-row-static">
                <div className="sb-row-line1">
                  <span className="sb-row-name">
                    {e.event_type.replace(/_/g, " ")}
                    {e.investor_name ? `: ${e.investor_name}` : ""}
                  </span>
                </div>
                {e.summary && (
                  <div className="sb-row-line2">
                    <span className="sb-row-secondary">{e.summary}</span>
                  </div>
                )}
              </div>
            ))}
          </>
        ) : null}
      </SidebarSection>
    </aside>
  );
}
