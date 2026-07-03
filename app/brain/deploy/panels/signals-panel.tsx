"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

/**
 * Signals panel — slide-over showing founder-facing events for the
 * active campaign.
 *
 * Model (2026-07-03 rework):
 *   - Signals PERSIST after action, not vanish. Handled signals render
 *     greyed at the bottom for ACKED_RETENTION_DAYS so the founder has
 *     a receipt of what they've dealt with.
 *   - Reply to inbound-reply signals stays IN-THREAD via a direct call
 *     to /brain/signals/{id}/draft_reply → inline draft card → send via
 *     /brain/outreach/send with Gmail threadId + In-Reply-To headers.
 *     No more new-thread replies that read as amateur.
 *   - No chat-inject on reply flow. The reply drafts in the drawer, the
 *     founder edits and sends there. Chat is the verb for open-ended
 *     work; specific "reply to signal X" is a focused surface.
 *   - Non-inbound-reply signals (brief views, doc views) still route
 *     through the chat inject pattern for now — no threading involved,
 *     just a "who likely viewed this?" question to the agent.
 *
 * Source: /v1/brain/signals (unack + recently-acked, server-sorted).
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
  acknowledged_at: string | null;
  can_reply: boolean;
};

type DraftReply = {
  signal_id: string;
  investor_slug: string;
  investor_name: string;
  investor_firm: string | null;
  to_email: string;
  subject: string;
  body: string;
  gmail_thread_id: string;
  in_reply_to_message_id: string | null;
  original_subject: string | null;
  original_summary: string | null;
  deck_url: string | null;
};

interface SignalsPanelProps {
  session: Session | null;
  impersonating: string;
  injectChatPrompt: (message: string) => void;
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

  // Inline draft state — one draft at a time in the panel.
  const [draft, setDraft] = useState<DraftReply | null>(null);
  const [drafting, setDrafting] = useState<string | null>(null); // signal id being drafted
  const [draftError, setDraftError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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

  useEffect(() => { void load(); }, [load]);

  // Ack without action — dismiss button. Signal stays visible but flips
  // to handled state (greyed).
  const ackSignal = useCallback(
    async (signalId: string) => {
      // Optimistic flip to acked
      setSignals((prev) =>
        prev.map((s) =>
          s.id === signalId
            ? { ...s, acknowledged_at: new Date().toISOString() }
            : s,
        ),
      );
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
      onSignalActed?.();
    },
    [session, impersonating, onSignalActed],
  );

  // Kick off the draft-reply flow for an inbound_reply signal.
  const startDraft = useCallback(
    async (signal: Signal) => {
      if (!session) return;
      setDrafting(signal.id);
      setDraftError(null);
      setDraft(null);
      setSendError(null);
      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        };
        if (impersonating) headers["X-Impersonate"] = impersonating;
        const res = await fetch(
          `/v1/brain/signals/${signal.id}/draft_reply`,
          { method: "POST", headers },
        );
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.detail || `Draft failed (${res.status})`);
        }
        setDraft(body as DraftReply);
      } catch (e) {
        setDraftError(e instanceof Error ? e.message : "Draft failed.");
      } finally {
        setDrafting(null);
      }
    },
    [session, impersonating],
  );

  const cancelDraft = useCallback(() => {
    setDraft(null);
    setDraftError(null);
    setSendError(null);
  }, []);

  const sendDraft = useCallback(async () => {
    if (!session || !draft) return;
    setSending(true);
    setSendError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const payload = {
        investor_slug: draft.investor_slug,
        subject: draft.subject,
        body: draft.body,
        to_email: draft.to_email,
        gmail_thread_id: draft.gmail_thread_id,
        in_reply_to_message_id: draft.in_reply_to_message_id,
        ack_signal_event_id: draft.signal_id,
      };
      const res = await fetch("/v1/brain/outreach/send", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.detail || `Send failed (${res.status})`);
      }
      // Mark signal as acked locally + clear draft
      setSignals((prev) =>
        prev.map((s) =>
          s.id === draft.signal_id
            ? { ...s, acknowledged_at: new Date().toISOString() }
            : s,
        ),
      );
      setDraft(null);
      onSignalActed?.();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Send failed.");
    } finally {
      setSending(false);
    }
  }, [session, impersonating, draft, onSignalActed]);

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
          <div className="sig-panel-empty-title">Nothing surfaced yet.</div>
          <div className="sig-panel-empty-body">
            Signals show up when investors on your radar view a brief, reply,
            or move on something in your space.
          </div>
          <div className="sig-panel-empty-cmd">nothing to do — I&apos;ll ping you</div>
        </div>
      </>
    );
  }

  return (
    <div className="sig-panel">
      <style>{SIG_PANEL_CSS}</style>
      <div className="sig-panel-list">
        {signals.map((sig) => {
          const isHandled = !!sig.acknowledged_at;
          const isDrafting = drafting === sig.id;
          const showDraftCard = draft?.signal_id === sig.id;
          return (
            <div
              key={sig.id}
              className={`sig-panel-card${isHandled ? " sig-panel-card-handled" : ""}`}
            >
              <div className="sig-panel-card-icon" aria-hidden>{sig.icon}</div>
              <div className="sig-panel-card-body">
                <div className="sig-panel-card-title">
                  {isHandled && (
                    <span className="sig-panel-handled-check" aria-hidden>✓</span>
                  )}
                  {sig.title}
                </div>
                {sig.subtitle && (
                  <div className="sig-panel-card-subtitle">{sig.subtitle}</div>
                )}
                {isHandled && (
                  <div className="sig-panel-card-handledmeta">
                    Handled {formatRelative(sig.acknowledged_at!)}
                  </div>
                )}

                {!isHandled && !showDraftCard && (
                  <div className="sig-panel-card-actions">
                    {sig.primary_action && sig.can_reply && (
                      <button
                        type="button"
                        className="sig-action sig-action-primary"
                        onClick={() => void startDraft(sig)}
                        disabled={isDrafting}
                      >
                        {isDrafting ? "Drafting…" : sig.primary_action.label}
                      </button>
                    )}
                    {sig.primary_action && !sig.can_reply && (
                      <button
                        type="button"
                        className="sig-action sig-action-primary"
                        onClick={() => {
                          injectChatPrompt(sig.primary_action!.message);
                          void ackSignal(sig.id);
                        }}
                      >
                        {sig.primary_action.label}
                      </button>
                    )}
                    <button
                      type="button"
                      className="sig-action sig-action-dismiss"
                      onClick={() => void ackSignal(sig.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {!isHandled && drafting === sig.id && (
                  <div className="sig-panel-drafting">Composing a threaded reply…</div>
                )}
                {!isHandled && sig.id === drafting && draftError && (
                  <div className="sig-panel-draft-error">{draftError}</div>
                )}
                {!isHandled && showDraftCard && draft && (
                  <ReplyDraftCard
                    draft={draft}
                    setDraft={setDraft}
                    onSend={sendDraft}
                    onCancel={cancelDraft}
                    sending={sending}
                    sendError={sendError}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Inline reply draft card ─────────────────────────────────────

interface ReplyDraftCardProps {
  draft: DraftReply;
  setDraft: (d: DraftReply) => void;
  onSend: () => void;
  onCancel: () => void;
  sending: boolean;
  sendError: string | null;
}

function ReplyDraftCard({
  draft,
  setDraft,
  onSend,
  onCancel,
  sending,
  sendError,
}: ReplyDraftCardProps) {
  return (
    <div className="sig-draft">
      <div className="sig-draft-head">
        <span className="sig-draft-label">Reply · in-thread</span>
        <span className="sig-draft-thread">
          Threaded to the original message ({draft.investor_name})
        </span>
      </div>
      <div className="sig-draft-row">
        <label className="sig-draft-field">
          <span className="sig-draft-fieldlabel">To</span>
          <input
            type="email"
            value={draft.to_email}
            onChange={(e) => setDraft({ ...draft, to_email: e.target.value })}
            className="sig-draft-input"
            disabled={sending}
          />
        </label>
      </div>
      <div className="sig-draft-row">
        <label className="sig-draft-field">
          <span className="sig-draft-fieldlabel">Subject</span>
          <input
            type="text"
            value={draft.subject}
            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            className="sig-draft-input"
            disabled={sending}
          />
        </label>
      </div>
      <div className="sig-draft-row">
        <label className="sig-draft-field">
          <span className="sig-draft-fieldlabel">Body</span>
          <textarea
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            className="sig-draft-textarea"
            rows={10}
            disabled={sending}
          />
        </label>
      </div>
      {sendError && <div className="sig-panel-draft-error">{sendError}</div>}
      <div className="sig-draft-actions">
        <button
          type="button"
          className="sig-action sig-action-primary"
          onClick={onSend}
          disabled={sending}
        >
          {sending ? "Sending…" : "Send via Gmail"}
        </button>
        <button
          type="button"
          className="sig-action sig-action-dismiss"
          onClick={onCancel}
          disabled={sending}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Utils ───────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const now = Date.now();
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const secs = Math.max(0, Math.floor((now - t) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
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
  .sig-panel-empty-title {
    font-size: 14px; font-weight: 600; color: #d4d4d8;
  }
  .sig-panel-empty-body {
    font-size: 12px; color: #71717a; line-height: 1.5; max-width: 320px;
  }
  .sig-panel-empty-cmd {
    display: inline-block;
    margin-top: 6px;
    padding: 6px 12px;
    background: rgba(249, 115, 22, 0.1);
    color: #f97316;
    border: 1px solid rgba(249, 115, 22, 0.25);
    border-radius: 6px;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 12px;
  }
  .sig-panel-list { display: flex; flex-direction: column; gap: 10px; }
  .sig-panel-card {
    display: flex; gap: 12px;
    padding: 14px;
    background: #0a0a0a;
    border: 1px solid #27272a;
    border-radius: 10px;
    transition: border-color 150ms ease, opacity 150ms ease;
  }
  .sig-panel-card:hover { border-color: #3f3f46; }
  .sig-panel-card-handled {
    opacity: 0.55;
    background: #0a0a0a;
    border-color: #1a1a1d;
  }
  .sig-panel-card-icon { font-size: 18px; flex-shrink: 0; padding-top: 1px; }
  .sig-panel-card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .sig-panel-card-title {
    color: #f4f4f5; font-size: 14px; font-weight: 500; line-height: 1.35;
    display: flex; align-items: center; gap: 8px;
  }
  .sig-panel-handled-check {
    color: #4ade80; font-size: 13px; font-weight: 700;
  }
  .sig-panel-card-subtitle { color: #a1a1aa; font-size: 12px; line-height: 1.4; }
  .sig-panel-card-handledmeta {
    color: #52525b; font-size: 11px; margin-top: 4px;
  }
  .sig-panel-card-actions { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .sig-action {
    border-radius: 9999px; padding: 6px 14px;
    font-size: 12px; font-family: inherit; font-weight: 600;
    cursor: pointer; transition: all 150ms ease;
    border: 1px solid transparent;
  }
  .sig-action:disabled { opacity: 0.6; cursor: not-allowed; }
  .sig-action-primary {
    background: #2dd4bf; color: #0a0a0a; border-color: #2dd4bf;
  }
  .sig-action-primary:hover:not(:disabled) { background: #5eead4; border-color: #5eead4; }
  .sig-action-dismiss {
    background: transparent; color: #71717a; font-weight: 400;
  }
  .sig-action-dismiss:hover:not(:disabled) { color: #d4d4d8; }

  .sig-panel-drafting {
    margin-top: 10px; font-size: 12px; color: #71717a;
  }
  .sig-panel-draft-error {
    margin-top: 8px;
    padding: 8px 10px;
    font-size: 12px;
    color: #fca5a5;
    background: rgba(220, 38, 38, 0.08);
    border: 1px solid rgba(220, 38, 38, 0.3);
    border-radius: 6px;
  }

  .sig-draft {
    margin-top: 12px;
    padding: 14px;
    background: #09090b;
    border: 1px solid #27272a;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .sig-draft-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .sig-draft-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #2dd4bf;
    font-weight: 700;
  }
  .sig-draft-thread {
    font-size: 11px;
    color: #71717a;
  }
  .sig-draft-row { width: 100%; }
  .sig-draft-field {
    display: flex; flex-direction: column; gap: 4px;
  }
  .sig-draft-fieldlabel {
    font-size: 11px;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .sig-draft-input {
    width: 100%; box-sizing: border-box;
    padding: 8px 10px;
    background: #0a0a0a;
    border: 1px solid #27272a;
    border-radius: 6px;
    color: #e4e4e7;
    font-family: inherit;
    font-size: 13px;
    outline: none;
  }
  .sig-draft-input:focus { border-color: #3f3f46; }
  .sig-draft-textarea {
    width: 100%; box-sizing: border-box;
    padding: 10px 12px;
    background: #0a0a0a;
    border: 1px solid #27272a;
    border-radius: 6px;
    color: #e4e4e7;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.55;
    resize: vertical;
    min-height: 180px;
    outline: none;
  }
  .sig-draft-textarea:focus { border-color: #3f3f46; }
  .sig-draft-actions { display: flex; gap: 8px; align-items: center; }
`;
