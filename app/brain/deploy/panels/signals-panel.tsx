"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

/**
 * Signals panel — slide-over showing every unacknowledged founder-facing
 * event for the active campaign. Clicking the primary action sends the
 * prepared chat message AND acks the signal; dismiss just acks. Card
 * removed optimistically on click; failed ack logs but doesn't re-show.
 *
 * Why a panel (not a chat strip): persistent, scales, lives in its own
 * real estate, badge in sidebar surfaces the unack count without
 * forcing the founder to open the panel. Replaces the 2026-06-30
 * SignalsStrip experiment.
 *
 * Source: /v1/brain/signals (server-side filter on event types +
 * acknowledged_at IS NULL).
 */

type SignalAction = {
  label: string;
  message: string;
};

type Signal = {
  id: string;
  event_type: string;
  icon: string;
  title: string;
  subtitle: string | null;
  primary_action: SignalAction | null;
  created_at: string;
};

interface SignalsPanelProps {
  session: Session | null;
  impersonating: string;
  /** Triggered when the founder clicks a primary action button. The
   * parent owns chat send / SSE machinery; this panel only emits the
   * prepared message. Parent should ALSO close this panel so the
   * conversation area is visible while the response streams. */
  injectChatPrompt: (message: string) => void;
  /** Called after an ack (action or dismiss) so the parent can close
   * the panel + refresh the sidebar badge count. */
  onSignalActed?: () => void;
}

export function SignalsPanel({
  session,
  impersonating,
  injectChatPrompt,
  onSignalActed,
}: SignalsPanelProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/signals", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load signals (${res.status})`);
      }
      const json = await res.json();
      setSignals(json.signals || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load signals.");
    } finally {
      setLoading(false);
    }
  }, [session, impersonating]);

  useEffect(() => {
    void load();
  }, [load]);

  // Optimistic remove + best-effort ack. A failed ack just means the
  // signal re-appears next refresh, which is the right fallback (better
  // than blocking on a network call before the founder's next action).
  const ackAndRemove = useCallback(
    async (signalId: string) => {
      setSignals((prev) => prev.filter((s) => s.id !== signalId));
      if (!session) return;
      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${session.access_token}`,
        };
        if (impersonating) headers["X-Impersonate"] = impersonating;
        await fetch(`/v1/brain/signals/${signalId}/ack`, {
          method: "POST",
          headers,
        });
      } catch (e) {
        console.warn("Failed to ack signal", signalId, e);
      }
      // Notify parent so sidebar badge can refresh + panel can close.
      onSignalActed?.();
    },
    [session, impersonating, onSignalActed]
  );

  if (loading) {
    return (
      <>
        <style>{SIG_PANEL_CSS}</style>
        <div className="sig-panel-state">Loading signals…</div>
      </>
    );
  }
  if (error) {
    return (
      <>
        <style>{SIG_PANEL_CSS}</style>
        <div className="sig-panel-state sig-panel-error">{error}</div>
      </>
    );
  }
  if (signals.length === 0) {
    return (
      <>
        <style>{SIG_PANEL_CSS}</style>
        <div className="sig-panel-empty">
          <div className="sig-panel-empty-icon" aria-hidden>📡</div>
          <div className="sig-panel-empty-title">All caught up</div>
          <div className="sig-panel-empty-body">
            No new signals since you last checked. When investors view your
            briefs or send replies, the activity shows up here.
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="sig-panel">
      <style>{SIG_PANEL_CSS}</style>
      <div className="sig-panel-list">
        {signals.map((sig) => (
          <div key={sig.id} className="sig-panel-card">
            <div className="sig-panel-card-icon" aria-hidden>{sig.icon}</div>
            <div className="sig-panel-card-body">
              <div className="sig-panel-card-title">{sig.title}</div>
              {sig.subtitle && (
                <div className="sig-panel-card-subtitle">{sig.subtitle}</div>
              )}
              <div className="sig-panel-card-actions">
                {sig.primary_action && (
                  <button
                    type="button"
                    className="sig-action sig-action-primary"
                    onClick={() => {
                      injectChatPrompt(sig.primary_action!.message);
                      void ackAndRemove(sig.id);
                    }}
                  >
                    {sig.primary_action.label}
                  </button>
                )}
                <button
                  type="button"
                  className="sig-action sig-action-dismiss"
                  onClick={() => void ackAndRemove(sig.id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SIG_PANEL_CSS = `
  .sig-panel { display: flex; flex-direction: column; gap: 14px; padding: 4px 0; }
  .sig-panel-state {
    padding: 24px 16px; color: #71717a; font-size: 13px; text-align: center;
  }
  .sig-panel-error { color: #f87171; }
  .sig-panel-empty {
    padding: 48px 24px; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .sig-panel-empty-icon { font-size: 32px; opacity: 0.6; }
  .sig-panel-empty-title {
    font-size: 14px; font-weight: 600; color: #d4d4d8;
  }
  .sig-panel-empty-body {
    font-size: 12px; color: #71717a; line-height: 1.5; max-width: 320px;
  }
  .sig-panel-list { display: flex; flex-direction: column; gap: 10px; }
  .sig-panel-card {
    display: flex; gap: 12px;
    padding: 14px;
    background: #0a0a0a;
    border: 1px solid #27272a;
    border-radius: 10px;
    transition: border-color 150ms ease;
  }
  .sig-panel-card:hover { border-color: #3f3f46; }
  .sig-panel-card-icon { font-size: 18px; flex-shrink: 0; padding-top: 1px; }
  .sig-panel-card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .sig-panel-card-title { color: #f4f4f5; font-size: 14px; font-weight: 500; line-height: 1.35; }
  .sig-panel-card-subtitle { color: #a1a1aa; font-size: 12px; line-height: 1.4; }
  .sig-panel-card-actions { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .sig-action {
    border-radius: 9999px; padding: 6px 14px;
    font-size: 12px; font-family: inherit; font-weight: 600;
    cursor: pointer; transition: all 150ms ease;
  }
  .sig-action-primary {
    background: #2dd4bf; color: #0a0a0a; border: 1px solid #2dd4bf;
  }
  .sig-action-primary:hover { background: #5eead4; border-color: #5eead4; }
  .sig-action-dismiss {
    background: transparent; color: #71717a;
    border: 1px solid transparent; font-weight: 400;
  }
  .sig-action-dismiss:hover { color: #d4d4d8; }
`;
