"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { SidebarSection } from "./section";
import { MyRaise } from "./my-raise";
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
// Phase 5a (2026-06-29): per-provider connection state surfaced in
// the Connections section. Fetched from /v1/brain/connections; refetched
// on raisefn:connections_updated.
type ConnectionRow = {
  provider: string;
  google_email: string | null;
  scopes: string[];
  connected_at: string | null;
  last_used_at: string | null;
  broken: boolean;
  last_error: string | null;
};

export function FounderSidebar({
  session,
  impersonating,
  injectChatPrompt,
  openPanel,
  adminHeader,
}: FounderSidebarProps) {
  const [state, setState] = useState<SidebarState | null>(null);
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);
  const [gmailBusy, setGmailBusy] = useState<"connecting" | "disconnecting" | null>(
    null,
  );

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
    window.addEventListener("raisefn:signals_updated", onUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("raisefn:matches_updated", onUpdate);
      window.removeEventListener("raisefn:pipeline_updated", onUpdate);
      window.removeEventListener("raisefn:profile_updated", onUpdate);
      window.removeEventListener("raisefn:briefs_updated", onUpdate);
      window.removeEventListener("raisefn:documents_updated", onUpdate);
      window.removeEventListener("raisefn:signals_updated", onUpdate);
    };
  }, [session, impersonating]);

  // Phase 5a — connections list (Gmail/Calendar/LinkedIn). Separate
  // fetch from sidebar-state so connection actions (connect/disconnect)
  // can refresh just this slice via raisefn:connections_updated.
  useEffect(() => {
    let cancelled = false;
    async function loadConnections() {
      if (!session) return;
      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${session.access_token}`,
        };
        if (impersonating) headers["X-Impersonate"] = impersonating;
        const res = await fetch("/v1/brain/connections", { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setConnections(data.connections || []);
      } catch {
        // Best-effort — empty connections list just means UI shows
        // every provider as not-yet-connected, which is the safe default.
      }
    }
    loadConnections();

    function onUpdate() { void loadConnections(); }
    window.addEventListener("raisefn:connections_updated", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("raisefn:connections_updated", onUpdate);
    };
  }, [session, impersonating]);

  // Parse ?connection_status= on mount (returned by the OAuth callback
  // redirect), surface a toast, and strip the params from the URL so a
  // refresh doesn't re-fire the toast.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("connection_status");
    if (!status) return;
    const provider = params.get("provider") || "provider";
    const email = params.get("email") || "";
    const reason = params.get("error_reason") || "";
    if (status === "connected") {
      setConnectionStatus({
        kind: "success",
        message: email ? `Connected ${provider} (${email})` : `Connected ${provider}`,
      });
      window.dispatchEvent(new CustomEvent("raisefn:connections_updated"));
    } else if (status === "error") {
      setConnectionStatus({
        kind: "error",
        message: `Could not connect ${provider}${reason ? ` — ${reason}` : ""}`,
      });
    }
    // Clean the URL — keep just /brain/deploy with no query string.
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, "", cleanUrl);
    // Auto-dismiss after 6s so it doesn't linger forever.
    const timer = window.setTimeout(() => setConnectionStatus(null), 6_000);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleConnectGmail() {
    if (!session || gmailBusy) return;
    setGmailBusy("connecting");
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/connections/gmail/authorize", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setConnectionStatus({
          kind: "error",
          message: body.detail || `Connect failed (${res.status})`,
        });
        return;
      }
      const data = await res.json();
      const authorizeUrl: string | undefined = data.authorize_url;
      if (!authorizeUrl) {
        setConnectionStatus({ kind: "error", message: "No authorize URL returned" });
        return;
      }
      // Full-page navigation — simplest, no popup blockers, matches
      // Google's OAuth UX expectations. Callback redirects back to
      // /brain/deploy with status params; the URL-parser useEffect
      // above surfaces the result.
      window.location.href = authorizeUrl;
    } catch (e) {
      setConnectionStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Connect failed",
      });
    } finally {
      setGmailBusy(null);
    }
  }

  async function handleDisconnectGmail() {
    if (!session || gmailBusy) return;
    if (!window.confirm("Disconnect Gmail? raise(fn) will no longer send or read your email.")) return;
    setGmailBusy("disconnecting");
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/connections/gmail", {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setConnectionStatus({
          kind: "error",
          message: body.detail || `Disconnect failed (${res.status})`,
        });
        return;
      }
      setConnections((prev) => prev.filter((c) => c.provider !== "gmail"));
      setConnectionStatus({ kind: "success", message: "Gmail disconnected" });
      window.dispatchEvent(new CustomEvent("raisefn:connections_updated"));
    } catch (e) {
      setConnectionStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Disconnect failed",
      });
    } finally {
      setGmailBusy(null);
    }
  }

  const gmailConnection = connections.find((c) => c.provider === "gmail") || null;

  return (
    <aside className="founder-sidebar">
      <style>{SIDEBAR_CSS}</style>

      {adminHeader && <div className="sb-admin-header">{adminHeader}</div>}

      <SidebarSection title="My Raise">
        <MyRaise campaign={state?.campaign || null} onInjectPrompt={injectChatPrompt} />
      </SidebarSection>

      {/* Strict rule: every section with an aggregating panel collapses to
       * header + count + arrow. The panel IS the list — sidebar is the door. */}
      {/* Signals: surfaces brief views + inbound replies as actionable
       * cards in a slide-over panel. Badge shows unack count; clicking
       * each card's primary action sends a chat message + acks. Lives
       * above Pipeline so a hot signal is the first thing the founder
       * notices. See [[feedback-agent-not-email-for-founder-signals]]. */}
      <SidebarSection
        title="Signals"
        count={state?.signals_unack_count ?? 0}
        onTitleClick={() => openPanel({ kind: "signals" })}
      />

      <SidebarSection
        title="Pipeline"
        count={state?.pipeline?.length ?? 0}
        onTitleClick={() => openPanel({ kind: "pipeline" })}
      />

      <SidebarSection
        title="Matches"
        count={state?.matches?.total_unique ?? 0}
        onTitleClick={() => openPanel({ kind: "matches" })}
      />

      <SidebarSection
        title="Briefs"
        count={state?.briefs?.length ?? 0}
        onTitleClick={() => openPanel({ kind: "briefs" })}
      />

      <SidebarSection
        title="Documents"
        count={state?.documents?.length ?? 0}
        onTitleClick={() => openPanel({ kind: "documents" })}
      />

      <SidebarSection title="Connections">
        <div className="sb-connections">
          {connectionStatus && (
            <div className={`sb-conn-toast sb-conn-toast-${connectionStatus.kind}`}>
              {connectionStatus.message}
            </div>
          )}
          {gmailConnection ? (
            <div
              className={`sb-conn-stacked${gmailConnection.broken ? " sb-conn-broken" : ""}`}
              title={
                gmailConnection.broken
                  ? `Reconnect needed — ${gmailConnection.last_error || "unknown error"}`
                  : "Connected via OAuth"
              }
            >
              <div className="sb-conn-stacked-top">
                <span className={`sb-conn-dot${gmailConnection.broken ? "" : " on"}`} />
                <span className="sb-conn-label">Gmail</span>
                <button
                  type="button"
                  className="sb-conn-link-action"
                  onClick={handleDisconnectGmail}
                  disabled={gmailBusy !== null}
                >
                  {gmailBusy === "disconnecting" ? "Disconnecting…" : "Disconnect"}
                </button>
              </div>
              <div className="sb-conn-stacked-meta">
                {gmailConnection.google_email || "Connected"}
              </div>
            </div>
          ) : (
            <div className="sb-conn-stacked">
              <div className="sb-conn-stacked-top">
                <span className="sb-conn-dot" />
                <span className="sb-conn-label">Gmail</span>
                <button
                  type="button"
                  className="sb-conn-link-action sb-conn-link-primary"
                  onClick={handleConnectGmail}
                  disabled={gmailBusy !== null}
                >
                  {gmailBusy === "connecting" ? "Connecting…" : "Connect →"}
                </button>
              </div>
              <div className="sb-conn-stacked-meta">
                Send outreach · auto-detect replies
              </div>
            </div>
          )}
          {(() => {
            // Calendar piggybacks on the Gmail OAuth grant (one Google
            // connection covers both). The Calendar row reflects whether
            // the existing Gmail connection includes the calendar.events
            // scope — Gmail connections established before 2026-06-30
            // didn't request it and need a reconnect to enable.
            const CAL_SCOPE = "https://www.googleapis.com/auth/calendar.events";
            const hasGoogle = !!gmailConnection;
            const hasCalScope = !!(gmailConnection?.scopes || []).includes(CAL_SCOPE);
            let status = "Bundled with Gmail";
            let title = "Connect Gmail to enable Calendar — one OAuth grant covers both.";
            if (hasGoogle && hasCalScope) {
              status = "Connected";
              title = "Calendar access granted via your Google connection.";
            } else if (hasGoogle && !hasCalScope) {
              status = "Reconnect Gmail to enable";
              title = "Your existing Gmail connection predates Calendar support. Disconnect + reconnect Gmail to grant Calendar access in one step.";
            }
            return (
              <div className="sb-conn-row sb-conn-disabled" title={title}>
                <span className={`sb-conn-dot${hasGoogle && hasCalScope ? " on" : ""}`} />
                <span className="sb-conn-label">Calendar</span>
                <span className="sb-conn-status">{status}</span>
              </div>
            );
          })()}
          <div className="sb-conn-row sb-conn-disabled" title="Warm intro mapping + 2nd-degree network introspection">
            <span className="sb-conn-dot" />
            <span className="sb-conn-label">LinkedIn</span>
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

      {/* SHARPEN (internal) / "Fine tune your agent" (user-facing).
       * Engineering name kept as "sharpen" — product brand is the full phrase. */}
      <SidebarSection title="Fine tune your agent">
        <div className="sb-connections">
          {(state?.sharpen || DEFAULT_SHARPEN_ROWS).map((row) => (
            <button
              key={row.id}
              type="button"
              className="sb-conn-row sb-sharpen-row"
              onClick={() => openPanel({ kind: "sharpen", section: row.id })}
              title={`Fine tune your agent — ${row.title}`}
              aria-label={`Fine tune your agent — ${row.title}`}
            >
              <span
                className="sb-conn-dot"
                style={{ background: STATUS_DOT_COLOR[row.status] }}
              />
              <span className="sb-conn-label">{row.title}</span>
              <span className="sb-conn-status sb-sharpen-status" data-status={row.status}>
                {row.status}
              </span>
            </button>
          ))}
        </div>
      </SidebarSection>
    </aside>
  );
}

const STATUS_DOT_COLOR: Record<string, string> = {
  strong: "#2dd4bf",
  solid: "#34d399",
  gap: "#fbbf24",
  empty: "#52525b",
};

// Fallback shown when /sidebar-state hasn't returned sharpen rows yet
// (older API response or pre-deploy snapshot).
const DEFAULT_SHARPEN_ROWS: { id: "basics" | "story" | "team" | "proof" | "past"; title: string; status: "empty" }[] = [
  { id: "basics", title: "Basics", status: "empty" },
  { id: "story", title: "Story", status: "empty" },
  { id: "team", title: "Team & cap", status: "empty" },
  { id: "proof", title: "Proof", status: "empty" },
  { id: "past", title: "Past convos", status: "empty" },
];
