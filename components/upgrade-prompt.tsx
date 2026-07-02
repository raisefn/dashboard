"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";

/**
 * UpgradePrompt — compact inline upgrade card for cap-hit moments
 * outside the chat surface.
 *
 * Chat SSE `limit_reached` renders a full two-tier upgrade card via the
 * page.tsx DOM path. When the same cap is hit from sidebar-triggered
 * actions (Generate brief on a match card, "Brief an investor" input
 * in Briefs panel), we render this compact variant instead — same intent,
 * fits the tighter real estate, keeps the user in context instead of
 * kicking them back to chat.
 *
 * Written 2026-07-02 for the brief-cap paywall UX. Reusable for any
 * future sidebar-triggered cap surface.
 */

interface UpgradePromptProps {
  session: Session | null;
  reason: "briefs" | "matches" | "messages";
  currentCount: number;
  cap: number;
  onDismiss?: () => void;
}

export function UpgradePrompt({
  session,
  reason,
  currentCount,
  cap,
  onDismiss,
}: UpgradePromptProps) {
  const [loading, setLoading] = useState<"pro" | "advisor" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleUpgrade(tier: "pro" | "advisor") {
    if (!session || loading) return;
    setErr(null);
    setLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(data.error || "Checkout unavailable");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not start checkout.");
      setLoading(null);
    }
  }

  const label = REASON_LABELS[reason];

  return (
    <div className="up-prompt" role="region" aria-label="Upgrade to continue">
      <style>{UP_PROMPT_CSS}</style>
      <div className="up-prompt-head">
        <div className="up-prompt-title">
          Free limit reached — {currentCount} of {cap} {label}.
        </div>
        {onDismiss && (
          <button
            type="button"
            className="up-prompt-close"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
      <p className="up-prompt-sub">
        Upgrade to keep {label} uncapped and unlock every other tool in raise(fn).
      </p>
      <div className="up-prompt-actions">
        <button
          type="button"
          className="up-prompt-cta"
          onClick={() => handleUpgrade("pro")}
          disabled={loading !== null}
        >
          {loading === "pro" ? "Starting…" : "Get Pro — $199/mo"}
        </button>
        <button
          type="button"
          className="up-prompt-cta up-prompt-cta-advisor"
          onClick={() => handleUpgrade("advisor")}
          disabled={loading !== null}
        >
          {loading === "advisor" ? "Starting…" : "Advisor — $1,997"}
        </button>
      </div>
      <p className="up-prompt-foot">
        Pro is the SaaS path. Advisor adds a hands-on month with the raise(fn) team.{" "}
        <a href="/pricing" className="up-prompt-link">
          Compare plans →
        </a>
      </p>
      {err && <p className="up-prompt-err">{err}</p>}
    </div>
  );
}

const REASON_LABELS: Record<UpgradePromptProps["reason"], string> = {
  briefs: "briefs",
  matches: "matched investors",
  messages: "messages",
};

const UP_PROMPT_CSS = `
  .up-prompt {
    padding: 18px;
    background: linear-gradient(135deg, rgba(15,118,110,0.08) 0%, rgba(24,24,27,1) 60%);
    border: 1px solid #14b8a6;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 100%;
    box-shadow: 0 6px 24px -12px rgba(20,184,166,0.35);
  }
  .up-prompt-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .up-prompt-title {
    color: #f4f4f5;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0.01em;
  }
  .up-prompt-close {
    background: transparent;
    border: none;
    color: #71717a;
    font-size: 14px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: color 120ms ease;
    line-height: 1;
    flex-shrink: 0;
  }
  .up-prompt-close:hover { color: #d4d4d8; }
  .up-prompt-sub {
    margin: 0;
    color: #a1a1aa;
    font-size: 12px;
    line-height: 1.5;
  }
  .up-prompt-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .up-prompt-cta {
    flex: 1 1 160px;
    padding: 9px 14px;
    background: #14b8a6;
    color: #0a0a0a;
    border: 1px solid #14b8a6;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 150ms ease;
    letter-spacing: 0.01em;
  }
  .up-prompt-cta:hover:not(:disabled) {
    background: #2dd4bf;
    border-color: #2dd4bf;
  }
  .up-prompt-cta:disabled { opacity: 0.6; cursor: not-allowed; }
  .up-prompt-cta-advisor {
    background: transparent;
    color: #2dd4bf;
    border-color: #2dd4bf;
  }
  .up-prompt-cta-advisor:hover:not(:disabled) {
    background: rgba(45,212,191,0.1);
    color: #5eead4;
    border-color: #5eead4;
  }
  .up-prompt-foot {
    margin: 4px 0 0;
    color: #71717a;
    font-size: 11px;
    line-height: 1.5;
  }
  .up-prompt-link {
    color: #2dd4bf;
    text-decoration: none;
  }
  .up-prompt-link:hover { color: #5eead4; text-decoration: underline; }
  .up-prompt-err {
    margin: 4px 0 0;
    color: #f87171;
    font-size: 11px;
  }
`;
