/**
 * SignalsStrip — code-rendered cards at the bottom of /brain/deploy that
 * surface unacknowledged founder-facing events (brief view crossings,
 * inbound replies, new match notifications).
 *
 * Why not let the agent's session_open synthesis do this: the LLM is
 * unreliable as the gatekeeper for time-sensitive signals. We tried it
 * (2026-06-30) and prompts didn't deliver. Deterministic UI here owns
 * the surface; the agent owns the action (one-click → message sent).
 *
 * Contract:
 *   - Mounts once when the chat page mounts. Re-fetches on remount only —
 *     no polling, no real-time. New signals appear next page mount.
 *   - Renders nothing when there are 0 signals (zero chrome footprint).
 *   - Click on primary action → sends the prepared chat message via the
 *     parent `send` function, then acks the signal in the background.
 *   - Click on dismiss → ack only, no message sent.
 *   - Optimistic UI: card disappears immediately on click. Ack failure
 *     logs but doesn't re-show the card (founder already moved on).
 */

"use client";

import { useEffect, useState, useCallback } from "react";

interface SignalAction {
  label: string;
  message: string;
}

export interface Signal {
  id: string;
  event_type: string;
  icon: string;
  title: string;
  subtitle: string | null;
  primary_action: SignalAction | null;
  created_at: string;
}

interface SignalsResponse {
  signals: Signal[];
  total_unacknowledged: number;
}

interface Props {
  accessToken: string | null;
  /** Forwarded to `send` exactly as the founder typed it. The parent owns
   * the SSE / streaming machinery; this component only triggers it. */
  onAction: (message: string) => void;
  /** Bump this to force a re-fetch (e.g., after the parent acks a signal
   * through some other path). Optional — defaults to single fetch on mount. */
  refreshKey?: number;
}

export default function SignalsStrip({ accessToken, onAction, refreshKey = 0 }: Props) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch on mount + refresh. Single network request per refresh — the
  // dashboard is already fetching a lot at mount time; one more is fine.
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/v1/brain/signals", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!r.ok) {
          if (!cancelled) setLoaded(true);
          return;
        }
        const data: SignalsResponse = await r.json();
        if (!cancelled) {
          setSignals(data.signals || []);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshKey]);

  // Optimistic remove + best-effort ack. Failed ack is logged not surfaced —
  // a signal that fails to ack just re-appears next mount, which is fine
  // (better than blocking the action on the network).
  const ackAndRemove = useCallback(
    async (signalId: string) => {
      setSignals((prev) => prev.filter((s) => s.id !== signalId));
      if (!accessToken) return;
      try {
        await fetch(`/v1/brain/signals/${signalId}/ack`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch (e) {
        console.warn("Failed to ack signal", signalId, e);
      }
    },
    [accessToken]
  );

  // Hide entirely if nothing loaded or no signals. No empty state — the
  // strip should be invisible chrome when quiet.
  if (!loaded || signals.length === 0) return null;

  return (
    <div className="signals-strip" role="region" aria-label="Signals since you last opened raise(fn)">
      <div className="signals-strip-header">Since you last opened raise(fn)</div>
      <div className="signals-strip-list">
        {signals.map((sig) => (
          <div key={sig.id} className="signal-card">
            <div className="signal-card-icon" aria-hidden>{sig.icon}</div>
            <div className="signal-card-body">
              <div className="signal-card-title">{sig.title}</div>
              {sig.subtitle && (
                <div className="signal-card-subtitle">{sig.subtitle}</div>
              )}
              <div className="signal-card-actions">
                {sig.primary_action && (
                  <button
                    type="button"
                    className="signal-action signal-action-primary"
                    onClick={() => {
                      onAction(sig.primary_action!.message);
                      void ackAndRemove(sig.id);
                    }}
                  >
                    {sig.primary_action.label}
                  </button>
                )}
                <button
                  type="button"
                  className="signal-action signal-action-dismiss"
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
