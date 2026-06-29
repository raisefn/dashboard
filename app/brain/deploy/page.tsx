"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrainTabs from "@/components/brain-tabs";
import { supabase } from "@/lib/supabase-browser";
import { wallCardLeadin } from "@/lib/upgrade-card-copy";
import type { Session } from "@supabase/supabase-js";
import { formatMarkdown } from "@/lib/format-markdown";
import { FounderSidebar } from "./sidebar";
import { PanelHost, usePanelState } from "./panels";

const ADMIN_EMAILS = ["justin@raisefn.com", "justinpetsche@gmail.com"];

const STARTERS = [
  "Who should I pitch?",
  "Am I ready to raise?",
  "Are these terms fair?",
  "How should I position this?",
];

/* ── Tool → color mapping (matches chat.html exactly) ── */
const COLORS = {
  teal:    { r: 45,  g: 212, b: 191 },
  orange:  { r: 249, g: 115, b: 22  },
  emerald: { r: 52,  g: 211, b: 153 },
  violet:  { r: 167, g: 139, b: 250 },
  zinc:    { r: 82,  g: 82,  b: 91  },
};
const COLOR_KEYS = Object.keys(COLORS) as (keyof typeof COLORS)[];

const TOOL_COLORS: Record<string, keyof typeof COLORS> = {
  "match investors":    "teal",
  "qualify raise":      "emerald",
  "analyze narrative":  "orange",
  "read signal":        "orange",
  "plan outreach":      "orange",
  "analyze terms":      "violet",
};

/* ── Markdown renderer (matches chat.html exactly) ── */
function fmtCheckSize(n: unknown): string | null {
  if (typeof n !== "number" || !n) return null;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type MatchInvestor = {
  kind?: string;
  slug?: string;
  name?: string;
  firm_name?: string | null;
  title?: string | null;
  thesis?: string | null;
  description?: string | null;
  focus_sectors?: string[] | null;
  focus_stages?: string[] | null;
  focus_countries?: string[] | null;
  check_size_min?: number | null;
  check_size_max?: number | null;
  hq_location?: string | null;
  score?: number;
  score_max?: number;
  match_reasons?: string[];
  data_source?: string;
  openvc_url?: string | null;
  linkedin?: string | null;
};

// Inline styles throughout. Tailwind purges classes that only appear in
// dynamically-built strings (.className = "ml-3 ..."), which is why earlier
// attempts had buttons rendering flush against the name. Inline styles
// guarantee what ships is what was designed.
const BRIEF_BTN_BASE_STYLE = [
  "display: inline-flex",
  "align-items: center",
  "gap: 6px",
  "background: #14b8a6",
  "color: #ffffff",
  "font-family: inherit",
  "font-size: 13px",
  "font-weight: 500",
  "line-height: 1.2",
  "padding: 7px 14px",
  "border-radius: 6px",
  "border: none",
  "cursor: pointer",
  "box-shadow: 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
  "transition: background-color 0.15s ease",
  "white-space: nowrap",
].join("; ");

const BRIEF_BTN_DONE_STYLE = [
  "display: inline-flex",
  "align-items: center",
  "gap: 6px",
  "background: transparent",
  "color: #5eead4",
  "font-family: inherit",
  "font-size: 13px",
  "font-weight: 500",
  "line-height: 1.2",
  "padding: 7px 14px",
  "border-radius: 6px",
  "border: 1px solid rgba(45, 212, 191, 0.45)",
  "cursor: pointer",
  "transition: border-color 0.15s ease",
  "white-space: nowrap",
].join("; ");

function createInlineBriefButton(
  inv: MatchInvestor,
  session: { access_token: string; user: { email?: string | null } },
  impersonating: string,
): HTMLDivElement {
  // Block wrapper — places the button on its OWN line under the named
  // investor with proper breathing room. Per Justin's Option B pick.
  const wrap = document.createElement("div");
  wrap.style.cssText = "margin: 10px 0 12px 24px; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;";

  const btn = document.createElement("button");
  btn.style.cssText = BRIEF_BTN_BASE_STYLE;
  const nameLabel = inv.name ? ` for ${inv.name}` : "";
  btn.innerHTML = `<span>Generate brief${escapeHtml(nameLabel)}</span><span style="opacity: 0.85;">→</span>`;
  btn.onmouseenter = () => {
    if (!btn.disabled) btn.style.backgroundColor = "#0d9488";
  };
  btn.onmouseleave = () => {
    if (!btn.disabled) btn.style.backgroundColor = "#14b8a6";
  };

  const status = document.createElement("span");
  status.style.cssText = "font-size: 12px; color: #71717a;";

  wrap.appendChild(btn);
  wrap.appendChild(status);

  let briefUrl: string | null = null;
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (briefUrl) {
      window.open(briefUrl, "_blank", "noopener");
      return;
    }
    btn.disabled = true;
    btn.style.opacity = "0.7";
    btn.style.cursor = "wait";
    btn.innerHTML = `<span>Generating brief${escapeHtml(nameLabel)}…</span>`;
    status.textContent = "";
    status.style.color = "#71717a";
    try {
      const firmName =
        (inv.firm_name as string | null | undefined) ||
        (inv.kind === "firm" ? (inv.name as string | undefined) : null) ||
        null;
      const founderEmail = (session.user.email || "").toLowerCase();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/generate-brief", {
        method: "POST",
        headers,
        body: JSON.stringify({
          founder_email: impersonating || founderEmail,
          investor_inline: {
            name: inv.name || "",
            firm: firmName,
            title: inv.title || null,
            thesis: inv.thesis || inv.description || null,
            website: inv.openvc_url || null,
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Brief failed (${res.status})`);
      }
      const briefData = await res.json();
      briefUrl = briefData.url;
      window.open(briefData.url, "_blank", "noopener");
      try { window.dispatchEvent(new CustomEvent("raisefn:briefs_updated")); } catch { /* defensive */ }
      btn.style.cssText = BRIEF_BTN_DONE_STYLE;
      btn.innerHTML = `<span>✓ Open brief${escapeHtml(nameLabel)}</span>`;
      btn.disabled = false;
      btn.onmouseenter = () => {
        btn.style.borderColor = "rgba(45, 212, 191, 0.75)";
      };
      btn.onmouseleave = () => {
        btn.style.borderColor = "rgba(45, 212, 191, 0.45)";
      };
    } catch (err) {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
      btn.innerHTML = `<span>Generate brief${escapeHtml(nameLabel)}</span><span style="opacity: 0.85;">→</span>`;
      status.textContent = ` — ${err instanceof Error ? err.message : "failed"}`;
      status.style.color = "#f87171";
    }
  });

  return wrap;
}

// Session-wide investor cache so prior-batch references in the brain's prose
// (e.g. "Daniel Moore from Batch 3") still get inline buttons even though the
// current matches_panel only contains the latest batch. Keyed by lowercase
// name OR firm name. First write wins (newer batches don't overwrite earlier
// data — same investor, same metadata is fine).
const SESSION_INVESTOR_CACHE: Map<string, MatchInvestor> = new Map();

// Phase 5b — render the inline outreach draft preview card. Called when
// the brain emits an outreach_draft SSE event after draft_outreach runs.
// Card supports editing subject/body, fixing the To address when the
// pipeline row had no email, and sending via Gmail. On send success, the
// card collapses to a "Sent · HH:MM" line.
function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderOutreachDraftCard(
  draft: {
    investor_slug: string;
    investor_name: string;
    investor_firm: string | null;
    to_email: string;
    missing_email: boolean;
    subject: string;
    body: string;
    brief_token: string | null;
    connected_email: string | null;
  },
  insertAfterEl: HTMLElement,
  session: { access_token: string; user: { email?: string | null } } | null,
  impersonating: string,
): void {
  if (!session) return;

  const card = document.createElement("div");
  card.style.cssText = [
    "margin-top: 18px",
    "border: 1px solid #3f3f46",
    "background: rgba(24, 24, 27, 0.65)",
    "border-radius: 10px",
    "padding: 16px 18px 14px",
    // Fill the available chat column. The card was capped at 720px
    // which produced a cramped textarea on wider screens. The chat
    // column already has its own width constraint; let the card
    // breathe within that.
    "width: 100%",
    "box-sizing: border-box",
  ].join("; ");

  const investorTitle = draft.investor_firm
    ? `${draft.investor_name} · ${draft.investor_firm}`
    : draft.investor_name;
  const fromEmailDisplay = draft.connected_email || "your connected Gmail";

  card.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <div style="font-size:12px;font-weight:600;color:#a1a1aa;letter-spacing:0.04em;text-transform:uppercase;">Draft outreach · ${escapeText(investorTitle)}</div>
      <button type="button" data-action="cancel" style="background:none;border:none;color:#71717a;font-size:11px;cursor:pointer;font-family:inherit;padding:0;">Cancel</button>
    </div>
    <div style="display:grid;grid-template-columns:60px 1fr;gap:8px 12px;align-items:start;">
      <div style="font-size:11px;color:#71717a;padding-top:8px;">From</div>
      <div style="font-size:12px;color:#a1a1aa;padding-top:8px;">${escapeText(fromEmailDisplay)}</div>
      <div style="font-size:11px;color:#71717a;padding-top:8px;">To</div>
      <input data-field="to" type="email" value="${escapeAttr(draft.to_email)}" placeholder="${draft.missing_email ? "Enter recipient email" : ""}" style="background:rgba(9,9,11,0.6);border:1px solid ${draft.missing_email ? "#b45309" : "#3f3f46"};color:#e4e4e7;padding:7px 10px;border-radius:5px;font-size:13px;font-family:inherit;outline:none;" />
      <div style="font-size:11px;color:#71717a;padding-top:8px;">Subject</div>
      <input data-field="subject" type="text" value="${escapeAttr(draft.subject)}" style="background:rgba(9,9,11,0.6);border:1px solid #3f3f46;color:#e4e4e7;padding:7px 10px;border-radius:5px;font-size:13px;font-family:inherit;outline:none;" />
      <div style="font-size:11px;color:#71717a;padding-top:8px;">Body</div>
      <textarea data-field="body" rows="9" style="background:rgba(9,9,11,0.6);border:1px solid #3f3f46;color:#e4e4e7;padding:10px 12px;border-radius:5px;font-size:13px;font-family:inherit;line-height:1.55;outline:none;resize:vertical;min-height:140px;">${escapeText(draft.body)}</textarea>
    </div>
    ${draft.brief_token ? `<div style="margin-top:10px;font-size:11px;color:#71717a;">Brief link will be appended on send · <code style="color:#a1a1aa;">/brief/${escapeText(draft.brief_token)}</code></div>` : ""}
    <div data-region="status" style="margin-top:12px;font-size:12px;color:#fca5a5;display:none;"></div>
    <div style="margin-top:14px;display:flex;justify-content:flex-end;gap:8px;">
      <button type="button" data-action="send" style="background:#0d9488;border:none;color:#ffffff;font-size:13px;font-weight:500;padding:8px 18px;border-radius:5px;cursor:pointer;font-family:inherit;transition:background 150ms ease;">Send via Gmail</button>
    </div>
  `;

  insertAfterEl.appendChild(card);

  const toInput = card.querySelector<HTMLInputElement>('[data-field="to"]')!;
  const subjectInput = card.querySelector<HTMLInputElement>('[data-field="subject"]')!;
  const bodyArea = card.querySelector<HTMLTextAreaElement>('[data-field="body"]')!;
  const sendBtn = card.querySelector<HTMLButtonElement>('[data-action="send"]')!;
  const cancelBtn = card.querySelector<HTMLButtonElement>('[data-action="cancel"]')!;
  const statusEl = card.querySelector<HTMLDivElement>('[data-region="status"]')!;

  function showStatus(msg: string, kind: "error" | "info") {
    statusEl.textContent = msg;
    statusEl.style.display = "block";
    statusEl.style.color = kind === "error" ? "#fca5a5" : "#a1a1aa";
  }

  cancelBtn.onclick = () => {
    card.remove();
  };

  sendBtn.onclick = async () => {
    const subject = subjectInput.value.trim();
    const body = bodyArea.value.trim();
    const to = toInput.value.trim();
    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      showStatus("Recipient email is required.", "error");
      return;
    }
    if (!subject) {
      showStatus("Subject is required.", "error");
      return;
    }
    if (!body) {
      showStatus("Body is required.", "error");
      return;
    }
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
    sendBtn.style.opacity = "0.7";
    sendBtn.style.cursor = "wait";
    statusEl.style.display = "none";
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      // If the to_email differs from what came back from the draft,
      // capture it on the pipeline row first via update_pipeline so the
      // next draft has the right email cached.
      // For v1 we skip that round-trip; the founder can fix the row via
      // chat if they want. The send itself uses the to_email here.
      const res = await fetch("/v1/brain/outreach/send", {
        method: "POST",
        headers,
        body: JSON.stringify({
          investor_slug: draft.investor_slug,
          subject,
          body,
          brief_token: draft.brief_token,
          // Pass the typed email — backend uses this as override AND
          // persists it back to the pipeline row so next time it's
          // cached. Critical when draft_outreach returned missing_email=true.
          to_email: to,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        showStatus(errBody.detail || `Send failed (${res.status})`, "error");
        sendBtn.disabled = false;
        sendBtn.textContent = "Send via Gmail";
        sendBtn.style.opacity = "1";
        sendBtn.style.cursor = "pointer";
        return;
      }
      const result = await res.json();
      const sentAt = result.sent_at
        ? new Date(result.sent_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        : new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#2dd4bf;">
          <span style="font-size:14px;">✓</span>
          <span>Sent to ${escapeText(draft.investor_name)} · ${escapeText(sentAt)}</span>
        </div>
        <div style="margin-top:6px;font-size:11px;color:#71717a;">Tracked under outreach_sent in your pipeline. Replies surface automatically when they land.</div>
      `;
      // Notify the dashboard that pipeline state changed so sidebar
      // counts refresh.
      window.dispatchEvent(new CustomEvent("raisefn:pipeline_updated"));
    } catch (e) {
      showStatus(
        e instanceof Error ? e.message : "Send failed",
        "error",
      );
      sendBtn.disabled = false;
      sendBtn.textContent = "Send via Gmail";
      sendBtn.style.opacity = "1";
      sendBtn.style.cursor = "pointer";
    }
  };
}

function renderMatchesPanel(
  data: {
    individuals_to_target?: Array<Record<string, unknown>>;
    firms_to_consider?: Array<Record<string, unknown>>;
    generated_at?: string;
  },
  contentEl: HTMLElement,
  session: { access_token: string; user: { email?: string | null } } | null,
  impersonating: string,
): void {
  if (!session) return;
  const individuals = (data.individuals_to_target || []) as MatchInvestor[];
  const firms = (data.firms_to_consider || []) as MatchInvestor[];
  const ordered = [...individuals, ...firms];

  // Update the cross-batch cache with this batch's investors.
  ordered.forEach((inv) => {
    if (inv.name) {
      const key = String(inv.name).toLowerCase().trim();
      if (key && !SESSION_INVESTOR_CACHE.has(key)) SESSION_INVESTOR_CACHE.set(key, inv);
    }
    if (inv.kind === "firm" && inv.firm_name) {
      const key = String(inv.firm_name).toLowerCase().trim();
      if (key && !SESSION_INVESTOR_CACHE.has(key)) SESSION_INVESTOR_CACHE.set(key, inv);
    }
  });

  // No matches at all (current OR cached) → nothing to do.
  if (ordered.length === 0 && SESSION_INVESTOR_CACHE.size === 0) return;

  // Build lookup entries from the cache (union of all batches seen this
  // session). Longest keys first so a 2-word name matches before a 1-word
  // substring.
  type MatchEntry = { key: string; investor: MatchInvestor };
  const entries: MatchEntry[] = Array.from(SESSION_INVESTOR_CACHE.entries()).map(
    ([key, investor]) => ({ key, investor }),
  );
  entries.sort((a, b) => b.key.length - a.key.length);

  // Inline brief-button injection deleted 2026-06-10 — Justin's call after
  // multiple iterations (chips, stacked bars, paragraph-end placement) all
  // looked wrong in real founder flows. The brain now writes a numbered
  // list of 10 matches (per rule 9) and the dashboard appends a single CTA
  // pointing users to the Matches tab where the card UI is purpose-built
  // for brief generation. `entries` / cache still maintained so future
  // walker re-use in non-match contexts (e.g., brain mentioning a cached
  // name in follow-up chat) doesn't break — for now nothing reads it.
  void entries;

  // Single CTA — points the founder to the Matches tab where ALL matches
  // are visible and briefs can be generated from the card UI. Phrasing
  // updated 2026-06-15 — the chat output sometimes shows fewer items than
  // the matcher actually returned (LLM editorializing), and founders had
  // no signal that more matches existed on the tab.
  const label = "See all matches & generate briefs";

  const summary = document.createElement("div");
  summary.style.cssText = "margin-top: 20px;";
  const link = document.createElement("a");
  link.href = "/brain/matches";
  link.style.cssText = [
    "display: inline-flex",
    "align-items: center",
    "gap: 8px",
    "background: rgba(24, 24, 27, 0.6)",
    "border: 1px solid #3f3f46",
    "color: #e4e4e7",
    "font-family: inherit",
    "font-size: 13px",
    "font-weight: 500",
    "padding: 9px 16px",
    "border-radius: 6px",
    "text-decoration: none",
    "transition: border-color 0.15s ease, background-color 0.15s ease",
  ].join("; ");
  link.innerHTML = `<span>${escapeHtml(label)}</span><span style="color: #71717a;">→</span>`;
  link.onmouseenter = () => {
    link.style.borderColor = "#52525b";
    link.style.backgroundColor = "rgba(39, 39, 42, 0.8)";
  };
  link.onmouseleave = () => {
    link.style.borderColor = "#3f3f46";
    link.style.backgroundColor = "rgba(24, 24, 27, 0.6)";
  };
  summary.appendChild(link);
  contentEl.parentElement?.appendChild(summary);
}

// formatMarkdown moved to @/lib/format-markdown so the agent execution
// panel can render step results with the same renderer the chat uses.

/* ── CSS (exact copy from chat.html, minus api-key styles, plus admin bar) ── */
const BRAIN_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  .brain-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #09090b;
    color: #f4f4f5;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .brain-root header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(9,9,11,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #27272a;
    flex-shrink: 0;
  }
  .brain-root header nav {
    max-width: 1280px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 16px;
  }
  .brain-logo { font-size: 18px; font-weight: 700; }
  .brain-logo .raise { color: #f97316; }
  .brain-logo .fn { color: #2dd4bf; }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .nav-link, .nav-link-btn { font-size: 12px; color: #52525b; text-decoration: none; transition: color 0.2s; background: none; border: none; cursor: pointer; font-family: inherit; }
  .nav-link:hover, .nav-link-btn:hover { color: #a1a1aa; }
  .nav-badge {
    font-size: 11px; color: #fdba74; padding: 3px 10px;
    border: 1px solid rgba(251, 146, 60, 0.4); border-radius: 999px;
    background: rgba(124, 45, 18, 0.2); white-space: nowrap;
  }
  .nav-right .user-name { font-size: 13px; color: #a1a1aa; }
  .nav-right .sign-out {
    font-size: 12px; color: #52525b; cursor: pointer;
    background: none; border: none; font-family: inherit;
    transition: color 0.2s;
  }
  .nav-right .sign-out:hover { color: #a1a1aa; }
  .key-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #2dd4bf; box-shadow: 0 0 8px rgba(45,212,191,0.4);
    flex-shrink: 0;
  }

  /* Admin bar */
  .admin-bar {
    flex-shrink: 0;
    border-bottom: 1px solid rgba(249,115,22,0.15);
    background: rgba(249,115,22,0.03);
    padding: 8px 16px;
  }
  .admin-bar-inner {
    max-width: 1280px; margin: 0 auto;
    display: flex; align-items: center; gap: 12px;
  }
  .admin-label {
    font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.15em;
    color: #f97316;
  }
  .admin-input {
    flex: 1; max-width: 280px;
    background: rgba(24,24,27,0.6); border: 1px solid #3f3f46;
    color: #e4e4e7; padding: 5px 10px; border-radius: 6px;
    font-size: 12px; font-family: inherit;
    transition: border-color 0.2s;
    outline: none;
  }
  .admin-input:focus { border-color: #f97316; }
  .admin-input::placeholder { color: #52525b; }
  select.admin-input {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2352525b' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 24px;
    max-width: 400px;
    cursor: pointer;
  }
  select.admin-input option {
    background: #18181b;
    color: #e4e4e7;
  }
  .admin-btn {
    background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.3);
    color: #fb923c; padding: 5px 12px; border-radius: 6px;
    font-size: 11px; font-weight: 500; font-family: inherit;
    cursor: pointer; transition: all 0.2s;
  }
  .admin-btn:hover { background: rgba(249,115,22,0.2); }
  .admin-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .admin-clear {
    background: none; border: none; color: #52525b;
    font-size: 11px; font-family: inherit; cursor: pointer;
    transition: color 0.2s;
  }
  .admin-clear:hover { color: #a1a1aa; }

  /* Main */
  .brain-main {
    flex: 1; position: relative; z-index: 1;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  .brain-canvas {
    position: absolute; inset: 0;
    z-index: 0;
  }

  /* Center UI */
  .center-ui {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    z-index: 10;
    transition: all 0.7s cubic-bezier(0.4,0,0.2,1);
    pointer-events: none;
  }
  .center-ui > * { pointer-events: auto; }
  .center-ui.at-bottom {
    justify-content: flex-end;
    padding-bottom: 0;
  }

  .center-label {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.2em;
    color: #3f3f46; margin-bottom: 20px;
    transition: all 0.5s;
  }
  .center-label .o { color: #f97316; }
  .center-label .t { color: #2dd4bf; }
  .at-bottom .center-label { opacity: 0; height: 0; margin: 0; overflow: hidden; }

  .welcome-text {
    text-align: center; margin-bottom: 24px;
    transition: all 0.5s;
  }
  .welcome-text h2 {
    font-size: 24px; font-weight: 700; color: #e4e4e7;
  }
  .welcome-text h2 .t { color: #2dd4bf; }
  .welcome-text p {
    font-size: 13px; color: #52525b; margin-top: 8px;
  }
  .at-bottom .welcome-text { opacity: 0; height: 0; margin: 0; overflow: hidden; }

  /* First-time Sharpen nudge in chat welcome */
  .sharpen-nudge {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    margin: 16px auto 0;
    padding: 10px 16px;
    border-radius: 999px;
    background: rgba(45, 212, 191, 0.06);
    border: 1px solid rgba(45, 212, 191, 0.25);
    font-size: 13px;
    color: #a1a1aa;
    transition: opacity 300ms ease, height 300ms ease, margin 300ms ease, padding 300ms ease;
    overflow: hidden;
  }
  .sharpen-nudge-text { white-space: nowrap; }
  .sharpen-nudge-link {
    color: #2dd4bf;
    text-decoration: none;
    font-weight: 500;
    margin-left: 4px;
  }
  .sharpen-nudge-link:hover { color: #5eead4; }
  .sharpen-nudge-close {
    background: none;
    border: none;
    color: #52525b;
    cursor: pointer;
    font-size: 12px;
    padding: 0 4px;
    line-height: 1;
    transition: color 150ms ease;
  }
  .sharpen-nudge-close:hover { color: #a1a1aa; }
  .at-bottom .sharpen-nudge {
    opacity: 0;
    height: 0;
    margin: 0;
    padding: 0 16px;
    border-width: 0;
  }

  .starters {
    display: flex; flex-wrap: wrap; gap: 8px;
    justify-content: center; margin-bottom: 24px;
    max-width: 520px;
    transition: all 0.5s;
  }
  .at-bottom .starters { opacity: 0; height: 0; margin: 0; overflow: hidden; pointer-events: none; }
  .starter {
    background: rgba(24,24,27,0.7);
    backdrop-filter: blur(8px);
    border: 1px solid #27272a;
    color: #71717a; padding: 7px 14px; border-radius: 9999px;
    font-size: 12px; font-family: inherit; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .starter:hover {
    border-color: #3f3f46; color: #d4d4d8;
    background: rgba(39,39,42,0.6);
  }

  /* Input bar */
  .input-bar {
    display: flex; gap: 8px;
    width: 100%; max-width: 560px;
    transition: all 0.7s cubic-bezier(0.4,0,0.2,1);
  }
  .at-bottom .input-bar {
    max-width: 680px;
    padding: 12px 16px 20px;
  }
  .input-bar textarea {
    flex: 1; background: rgba(24,24,27,0.8);
    border: 1px solid #3f3f46;
    color: #f4f4f5; padding: 12px 16px; border-radius: 12px;
    font-size: 14px; font-family: inherit; resize: none;
    height: 48px; max-height: 120px; line-height: 1.5;
    transition: border-color 0.2s;
    backdrop-filter: blur(12px);
    outline: none;
  }
  .input-bar textarea:focus { border-color: #52525b; }
  .input-bar textarea::placeholder { color: #52525b; }

  .send-btn {
    background: #f97316; color: white; border: none;
    padding: 0 20px; border-radius: 9999px;
    font-size: 13px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(249,115,22,0.2);
  }
  .send-btn:hover { background: #ea580c; box-shadow: 0 4px 16px rgba(249,115,22,0.3); }
  .send-btn:disabled { background: #27272a; color: #52525b; cursor: not-allowed; box-shadow: none; }

  /* Messages */
  .messages-container {
    display: none;
    position: absolute;
    top: 0; left: 0; right: 0;
    bottom: 80px;
    overflow-y: auto;
    z-index: 8;
  }
  .messages-container.active { display: block; }
  .messages-container::-webkit-scrollbar { width: 4px; }
  .messages-container::-webkit-scrollbar-track { background: transparent; }
  .messages-container::-webkit-scrollbar-thumb { background: #27272a; border-radius: 2px; }

  .messages-inner {
    width: 100%; max-width: 900px;
    margin: 0 auto;
    padding: 20px 16px;
    display: flex; flex-direction: column; gap: 16px;
  }

  .message {
    line-height: 1.7; font-size: 14px;
    animation: fade-in-up 0.4s ease-out both;
    /* Long unbroken strings (URLs, tokens, code) wrap inside the bubble
       instead of overflowing the max-width and breaking layout. */
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .message.user {
    align-self: flex-end;
    max-width: 55%;
    background: rgba(24,24,27,0.9);
    backdrop-filter: blur(8px);
    border: 1px solid #27272a;
    padding: 12px 16px; border-radius: 16px 16px 4px 16px;
    color: #d4d4d8;
  }
  .message.assistant { align-self: flex-start; max-width: 65%; padding: 4px 0; }
  .message.assistant .content { color: #e4e4e7; }
  .message.assistant .content h1,
  .message.assistant .content h2,
  .message.assistant .content h3 {
    color: #f4f4f5; font-weight: 600; margin: 20px 0 6px;
  }
  .message.assistant .content h2 { font-size: 15px; }
  .message.assistant .content h3 { font-size: 14px; }
  .message.assistant .content strong { color: #2dd4bf; font-weight: 600; }
  /* Bold labels like "Thesis:", "Check:", "Geo:" — muted so they don't
     compete with investor names. Real visual hierarchy: teal name jumps,
     gray label sits back, value reads as body text. */
  .message.assistant .content strong.label { color: #a1a1aa; font-weight: 500; }
  .message.assistant .content em { color: #d4d4d8; }

  .status-msg {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: #a1a1aa; padding: 6px 14px;
    background: rgba(24,24,27,0.9);
    border: 1px solid #3f3f46; border-radius: 8px;
    margin-bottom: 12px; backdrop-filter: blur(8px);
  }
  .status-msg::before {
    content: ''; width: 6px; height: 6px;
    border-radius: 50%; background: #f97316;
    animation: dot-flash 1s ease-in-out infinite;
  }

  .error-msg {
    color: #fca5a5; font-size: 13px; padding: 10px 14px;
    background: rgba(24,24,27,0.8);
    border: 1px solid rgba(239,68,68,0.2); border-radius: 8px;
  }

  .typing { display: inline-flex; gap: 4px; padding: 8px 0; }
  .typing span {
    width: 5px; height: 5px; background: #f97316;
    border-radius: 50%; animation: typing-pulse 1.4s infinite;
  }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes fade-in-up {
    from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}
  }
  @keyframes dot-flash {
    0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}
  }
  @keyframes typing-pulse {
    0%,80%,100%{opacity:.15;transform:translateY(0)}40%{opacity:1;transform:translateY(-5px)}
  }

  /* Code blocks */
  .code-block {
    background: rgba(24,24,27,0.9);
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 12px 16px;
    overflow-x: auto;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 12px;
    line-height: 1.6;
    color: #a1a1aa;
    margin: 8px 0;
  }
  .code-block code { background: none; padding: 0; }
  .inline-code {
    background: rgba(39,39,42,0.8);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 12px;
    color: #2dd4bf;
  }
  .md-table {
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 12px;
    width: 100%;
  }
  .md-table th, .md-table td {
    border: 1px solid #27272a;
    padding: 6px 10px;
    text-align: left;
    vertical-align: top;
  }
  .md-table th { background: rgba(39, 39, 42, 0.6); color: #e4e4e7; font-weight: 600; }
  .md-table td { color: #d4d4d8; }
  /* agent-md scope so .md-table can pick up scoped styles if we ever specialize */
  .agent-md h1, .agent-md h2, .agent-md h3 { margin: 8px 0 4px; color: #e4e4e7; }
  .agent-md h1 { font-size: 14px; }
  .agent-md h2 { font-size: 13px; }
  .agent-md h3 { font-size: 12px; color: #a1a1aa; }
  .agent-md ul, .agent-md ol { margin: 4px 0 4px 18px; }
  .agent-md li { margin: 2px 0; }
  .agent-md hr { border: none; border-top: 1px solid #27272a; margin: 8px 0; }
  .agent-md strong { color: #e4e4e7; font-weight: 600; }
  .agent-md strong.label { color: #a1a1aa; font-weight: 500; }
  .agent-md a { color: #2dd4bf; text-decoration: none; }
  .agent-md a:hover { text-decoration: underline; }

  /* Lists */
  .message.assistant ol,
  .message.assistant ul {
    margin: 6px 0;
    padding-left: 0;
    list-style: none;
  }
  .message.assistant li {
    padding: 3px 0;
    color: #a1a1aa;
  }
  .message.assistant li.bulleted::before {
    content: '•';
    color: #f97316;
    margin-right: 8px;
  }
  .li-num {
    color: #f97316;
    font-weight: 600;
    margin-right: 4px;
  }

  /* Links */
  .message.assistant a {
    color: #2dd4bf;
    text-decoration: none;
    border-bottom: 1px solid rgba(45,212,191,0.3);
    transition: border-color 0.2s;
  }
  .message.assistant a:hover { border-color: #2dd4bf; }

  /* HR */
  .message.assistant hr {
    border: none;
    border-top: 1px solid #27272a;
    margin: 12px 0;
  }

  @media (max-width: 640px) {
    .brain-root header nav { padding: 8px 12px; }
    .messages-inner { padding: 12px 10px; }
    .message { max-width: 100%; }
    .message.user { max-width: 85%; }
    .message.assistant { max-width: 95%; }
    .welcome-text h2 { font-size: 18px; }
    .starters { max-width: 90vw; }
    .starter { font-size: 11px; padding: 6px 10px; }
    .input-bar { max-width: 95vw; }
    .at-bottom .input-bar { padding: 8px 10px 16px; }
    .input-bar textarea { font-size: 14px; padding: 10px 12px; }
    .send-btn { padding: 0 14px; font-size: 12px; }
    .code-block { font-size: 11px; padding: 8px 10px; }
  }

  .upgrade-card {
    margin-top: 24px;
    border: 1px solid rgba(234, 88, 12, 0.15);
    border-radius: 16px;
    padding: 28px;
    background: linear-gradient(135deg, rgba(234, 88, 12, 0.03), rgba(0, 0, 0, 0.15));
    width: 100%;
  }
  .upgrade-card-header {
    font-size: 18px;
    font-weight: 700;
    color: #fb923c;
    margin-bottom: 24px;
  }
  .upgrade-capabilities { margin-bottom: 28px; }
  .upgrade-cap-section { margin-bottom: 20px; }
  .upgrade-cap-label {
    font-size: 10px;
    font-weight: 700;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }
  .upgrade-cap-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .upgrade-cap-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
  }
  .cap-icon { font-size: 14px; flex-shrink: 0; }
  .cap-text { font-size: 12px; color: #d4d4d8; }
  .upgrade-options { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 24px; }
  .upgrade-btn {
    background: linear-gradient(135deg, #f97316, #ea580c);
    border: none;
    color: #fff;
    padding: 12px 28px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
  }
  .upgrade-btn:hover {
    background: linear-gradient(135deg, #fb923c, #f97316);
    box-shadow: 0 6px 20px rgba(234, 88, 12, 0.4);
    transform: translateY(-1px);
  }
  .upgrade-btn-alt {
    background: rgba(39, 39, 42, 0.8);
    border: 1px solid rgba(63, 63, 70, 0.5);
    color: #a1a1aa;
    box-shadow: none;
  }
  .upgrade-btn-alt:hover {
    border-color: rgba(113, 113, 122, 0.7);
    background: rgba(39, 39, 42, 1);
    color: #d4d4d8;
    box-shadow: none;
    transform: none;
  }
  .upgrade-catalyst-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(63, 63, 70, 0.3);
  }
  .upgrade-catalyst-pitch {
    font-size: 12px;
    color: #a1a1aa;
    margin-bottom: 10px;
    line-height: 1.5;
  }
`;

/* ── Particle type ── */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  baseColor: { r: number; g: number; b: number };
  size: number;
  alpha: number;
  pulseOffset: number;
}

/* ── Message type ── */
interface ChatMsg {
  role: "user" | "assistant";
  html: string; // rendered HTML for assistant, plain text for user
}

export default function BrainDeployPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-zinc-400 text-sm">Loading...</p></div>}>
      <BrainDeployInner />
    </Suspense>
  );
}

function BrainDeployInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [impersonateInput, setImpersonateInput] = useState("");
  const [impersonating, setImpersonating] = useState("");

  // Rehydrate impersonation state on mount. Without this, navigation
  // (clicking Matches, refreshing, opening any panel that triggers a
  // remount of this page) drops the admin's "Acting as" context and
  // they appear to be signed back into their own account. Caught
  // 2026-06-29: Justin acting as Matt → clicked Matches → showed his
  // own account's matches because the state had reset.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("raisefn_impersonating");
      if (saved) {
        setImpersonating(saved);
      }
    } catch {
      /* private browsing — skip */
    }
  }, []);

  // Persist impersonation across the dashboard so other components
  // (BrainTabs especially — Briefs/Matches counts) can scope their
  // API calls to the founder being acted-as. Without this, the tabs
  // showed Justin's counts even while he was acting as a managed
  // founder. Fired as both a localStorage write AND a custom event
  // so listeners can update synchronously without polling storage.
  useEffect(() => {
    try {
      if (impersonating) {
        localStorage.setItem("raisefn_impersonating", impersonating);
      } else {
        localStorage.removeItem("raisefn_impersonating");
      }
      window.dispatchEvent(
        new CustomEvent("raisefn:impersonate", { detail: { email: impersonating || null } }),
      );
    } catch {
      /* private browsing — skip */
    }
  }, [impersonating]);

  const [adminUsers, setAdminUsers] = useState<Array<{
    email: string; name: string; role: string; tier: string;
    created_at: string | null;
    campaign: { company: string | null; status: string | null; stage: string | null } | null;
    events: number; last_active: string | null;
  }>>([]);

  // Chat
  const [chatStarted, setChatStarted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // First-time Sharpen nudge — shown in chat welcome until the founder
  // dismisses it or visits /brain/sharpen. localStorage-persisted so it
  // doesn't reappear across sessions.
  const [showSharpenNudge, setShowSharpenNudge] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem("raisefn_sharpen_nudge_dismissed");
    if (!dismissed) setShowSharpenNudge(true);
  }, []);
  const dismissSharpenNudge = () => {
    try { localStorage.setItem("raisefn_sharpen_nudge_dismissed", "1"); } catch {}
    setShowSharpenNudge(false);
  };
  const { panel, openPanel, closePanel, popPanel } = usePanelState();
  // Attached file may be a text-extracted document (gets injected into the
  // user message), an image (sent as a multimodal content block via `images`),
  // or a raw PDF document (sent as an Anthropic document content block via
  // `documents` when text extraction failed — Canva/Figma/Keynote exports
  // typically have no extractable text layer; Claude reads them natively).
  type AttachedFile =
    | { kind: "text"; name: string; text: string }
    | { kind: "image"; name: string; mediaType: string; data: string }
    | { kind: "document"; name: string; mediaType: string; data: string };
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const raiseIdRef = useRef<string | null>(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("raise_id")
      : null
  );
  const conversationIdRef = useRef<string | null>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  // Count of assistant turns restored from prior conversation. Drives the
  // [session_open] auto-fire gate. > 0 means the founder is in an active
  // session (refresh / navigate-and-back / tab switch); firing synthesis
  // again would stack the same priority turn on top of itself. 0 = brand-
  // new conversation, fire synthesis normally.
  // Continuity for next-day sessions: brain auto-rotates conversations
  // after 30 min of inactivity, so next-day restore returns zero turns
  // and synthesis fires correctly.
  const restoredAssistantCountRef = useRef(0);
  // Per-round flag: set when SSE matches_updated event arrives, consumed on
  // SSE done event to fire the BrainTabs badge refresh. Defers the refresh
  // until after the brain has fully committed the new match batch.
  const matchesUpdatedThisRoundRef = useRef(false);
  // Set when the user sends a message with an attached document/image
  // (deck, term sheet, etc.). On the `done` event we dispatch
  // raisefn:documents_updated so the sidebar refetches and the new
  // document row appears under DOCUMENTS.
  const documentUploadedThisRoundRef = useRef(false);
  // Per-message rate-limit signals captured from SSE events
  const limitReachedRef = useRef<null | {
    tier: string;
    reason: string | null;
    cap: number | null;
    next_reset: string | null;
    reset_label: string | null;
  }>(null);
  const limitWarningRef = useRef<null | {
    tier: string;
    window: string;
    remaining: number;
    cap: number;
    next_reset: string | null;
    reset_label: string | null;
  }>(null);
  // Usage state from brain — surfaces nav Upgrade button + soft card
  // at message-12 lifetime. Refs so updates don't re-render the page
  // (the soft card is inserted manually via DOM after streaming).
  const lifetimeCountRef = useRef<number | null>(null);
  const monthCountRef = useRef<number | null>(null);
  const monthCapRef = useRef<number | null>(null);

  // DOM refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const centerUiRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const messagesInnerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);

  // Canvas state (refs for animation loop)
  const particlesRef = useRef<Particle[]>([]);
  const brainStateRef = useRef<"idle" | "thinking" | "active">("idle");
  const activeColorRef = useRef<{ r: number; g: number; b: number } | null>(null);
  const stateIntensityRef = useRef(0);
  const canvasDimsRef = useRef({ W: 0, H: 0, cx: 0, cy: 0 });
  const animRef = useRef<number>(0);

  // Session restore
  const hasAutoProbed = useRef(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>("free");
  const [sessionReady, setSessionReady] = useState(false);

  /* ── Auth ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) { router.replace("/login"); return; }
      setSession(s);
      setIsAdmin(ADMIN_EMAILS.includes(s.user.email ?? ""));
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => {
      setSession(s);
      if (!s) router.replace("/login");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  /* ── Checkout success detection ── */
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      setCheckoutSuccess(true);
      // Clean URL without reload
      window.history.replaceState({}, "", "/brain/deploy");
      // Auto-dismiss after 5 seconds
      setTimeout(() => setCheckoutSuccess(false), 5000);
    }
  }, [searchParams]);

  /* ── Auto-checkout if user came from pricing page ── */
  useEffect(() => {
    if (!session || loading) return;
    try {
      const pendingPlan = localStorage.getItem("raisefn_checkout_plan");
      if (!pendingPlan) return;
      localStorage.removeItem("raisefn_checkout_plan");

      // Trigger checkout immediately
      fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tier: pendingPlan }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.url) window.location.href = data.url;
        })
        .catch((err) => console.error("Auto-checkout error:", err));
    } catch {}
  }, [session, loading]);

  /* ── Fetch admin user list ── */
  useEffect(() => {
    if (!isAdmin || !session) return;
    fetch("/v1/brain/admin/users", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (Array.isArray(data)) setAdminUsers(data); })
      .catch(() => {});
  }, [isAdmin, session]);

  /* ── Canvas init + animation (exact port from chat.html) ── */
  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    const main = mainRef.current;
    if (!canvas || !main) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 140;
    const PARTICLE_SPEED = 0.3;

    function resize() {
      const W = main!.offsetWidth;
      const H = main!.offsetHeight;
      canvas!.width = W * devicePixelRatio;
      canvas!.height = H * devicePixelRatio;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      canvasDimsRef.current = { W, H, cx: W / 2, cy: H / 2 };
    }

    function initParticles() {
      const { W, H, cx, cy } = canvasDimsRef.current;
      const ps: Particle[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const colorKey = COLOR_KEYS[i % COLOR_KEYS.length];
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * Math.min(W, H) * 0.45;
        ps.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * PARTICLE_SPEED * 2,
          vy: (Math.random() - 0.5) * PARTICLE_SPEED * 2,
          baseColor: COLORS[colorKey],
          size: 1.2 + Math.random() * 1.8,
          alpha: 0.15 + Math.random() * 0.35,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = ps;
    }

    function tick(time: number) {
      const { W, H, cx, cy } = canvasDimsRef.current;
      const particles = particlesRef.current;
      const brainState = brainStateRef.current;
      const activeColor = activeColorRef.current;

      ctx!.clearRect(0, 0, W, H);

      // Smooth state transitions
      const targetIntensity = brainState === "idle" ? 0 : brainState === "thinking" ? 0.6 : 1;
      stateIntensityRef.current += (targetIntensity - stateIntensityRef.current) * 0.03;
      const si = stateIntensityRef.current;

      // Update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (si > 0.05) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 80) {
            p.vx += (dx / dist) * 0.008 * si;
            p.vy += (dy / dist) * 0.008 * si;
          }
        }
        const margin = 40;
        if (p.x < -margin) p.x = W + margin;
        if (p.x > W + margin) p.x = -margin;
        if (p.y < -margin) p.y = H + margin;
        if (p.y > H + margin) p.y = -margin;
        p.vx *= 0.998;
        p.vy *= 0.998;
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = CONNECTION_DIST + si * 40;
          if (dist < maxDist) {
            const strength = 1 - dist / maxDist;
            let r: number, g: number, bb: number;
            if (activeColor && si > 0.1) {
              const blend = si * 0.7;
              r = a.baseColor.r * (1 - blend) + activeColor.r * blend;
              g = a.baseColor.g * (1 - blend) + activeColor.g * blend;
              bb = a.baseColor.b * (1 - blend) + activeColor.b * blend;
            } else {
              r = (a.baseColor.r + b.baseColor.r) / 2;
              g = (a.baseColor.g + b.baseColor.g) / 2;
              bb = (a.baseColor.b + b.baseColor.b) / 2;
            }
            const alpha = strength * (0.06 + si * 0.12);
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.strokeStyle = `rgba(${r | 0},${g | 0},${bb | 0},${alpha})`;
            ctx!.lineWidth = 0.8 + si * 0.5;
            ctx!.stroke();
          }
        }
      }

      // Draw particles
      const pulse = Math.sin(time * 0.002) * 0.5 + 0.5;
      for (const p of particles) {
        let r = p.baseColor.r, g = p.baseColor.g, b = p.baseColor.b;
        if (activeColor && si > 0.1) {
          const blend = si * 0.6;
          r = r * (1 - blend) + activeColor.r * blend;
          g = g * (1 - blend) + activeColor.g * blend;
          b = b * (1 - blend) + activeColor.b * blend;
        }
        const pPulse = Math.sin(time * 0.003 + p.pulseOffset) * 0.5 + 0.5;
        const alpha = p.alpha * (0.6 + pPulse * 0.4) + si * 0.2;
        const size = p.size * (1 + si * 0.3 + pPulse * 0.15);
        // Glow
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha * 0.12})`;
        ctx!.fill();
        // Core
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
        ctx!.fill();
      }

      // Center glow
      const glowAlpha = 0.03 + si * 0.06;
      const glowSize = 120 + si * 60 + pulse * 20;
      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
      if (activeColor) {
        grad.addColorStop(0, `rgba(${activeColor.r},${activeColor.g},${activeColor.b},${glowAlpha * 1.5})`);
      } else {
        grad.addColorStop(0, `rgba(45,212,191,${glowAlpha})`);
      }
      grad.addColorStop(1, "transparent");
      ctx!.fillStyle = grad;
      ctx!.fillRect(cx - glowSize, cy - glowSize, glowSize * 2, glowSize * 2);

      animRef.current = requestAnimationFrame(tick);
    }

    resize();
    initParticles();
    animRef.current = requestAnimationFrame(tick);

    const onResize = () => { resize(); initParticles(); };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animRef.current);
    };
  }, [loading]);

  /* ── Send message (exact SSE logic from chat.html) ── */
  const send = useCallback(async (message: string, opts?: { silent?: boolean; displayMessage?: string; images?: { media_type: string; data: string }[]; documents?: { media_type: string; data: string; filename: string }[] }) => {
    if (isStreaming || !session) return;
    const silent = opts?.silent ?? false;

    // Transition to chat mode
    if (!chatStarted) {
      setChatStarted(true);
      centerUiRef.current?.classList.add("at-bottom");
      messagesRef.current?.classList.add("active");
    }

    // Add user message to DOM (skip if silent — auto-probe)
    const displayText = opts?.displayMessage || message;
    if (!silent) addMessageToDOM("user", displayText);
    // Store full message for brain context, but mark file uploads so we can
    // display them cleanly on restore
    historyRef.current.push({ role: "user", content: message });

    // Add assistant message with typing dots immediately
    const assistantEl = addMessageToDOM("assistant", "");
    const contentEl = assistantEl.querySelector(".content") as HTMLElement;
    if (contentEl) {
      contentEl.innerHTML = '<div class="status-msg">Thinking…</div>';
    }
    brainStateRef.current = "thinking";
    activeColorRef.current = null;
    if (sendBtnRef.current) sendBtnRef.current.disabled = true;
    setIsStreaming(true);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
    if (impersonating) {
      headers["X-Impersonate"] = impersonating;
    }

    try {
      const reqBody = JSON.stringify({
        message,
        history: historyRef.current.slice(-101, -1),
        ...(raiseIdRef.current && { raise_id: raiseIdRef.current }),
        ...(conversationIdRef.current && { conversation_id: conversationIdRef.current }),
        ...(opts?.images && opts.images.length > 0 && { images: opts.images }),
        ...(opts?.documents && opts.documents.length > 0 && { documents: opts.documents }),
      });

      const brainUrl = "https://brain-production-61da.up.railway.app/v1/brain/chat";
      let response = await fetch(brainUrl, { method: "POST", headers, body: reqBody });

      // Token expired — refresh and retry once
      if (response.status === 401) {
        const { data: { session: fresh } } = await supabase.auth.refreshSession();
        if (fresh) {
          setSession(fresh);
          headers.Authorization = `Bearer ${fresh.access_token}`;
          response = await fetch(brainUrl, { method: "POST", headers, body: reqBody });
        }
      }

      if (!response.ok) {
        const errorMsg = response.status === 401
          ? `Session expired. <a href="/login" style="color:#2dd4bf;text-decoration:underline">Sign in again</a>`
          : `Something went wrong (${response.status}). Try again.`;
        contentEl.innerHTML = `<div class="error-msg">${errorMsg}</div>`;
        brainStateRef.current = "idle";
        activeColorRef.current = null;
        setIsStreaming(false);
        if (sendBtnRef.current) sendBtnRef.current.disabled = false;
        return;
      }

      // Read SSE stream — show status messages live as they arrive.
      // Read timeout: if no chunk arrives within 60s, the connection is
      // effectively dead (Anthropic streaming + brain SSE should emit
      // something at least every few seconds during processing). Bail
      // with a clear error rather than hang the spinner forever — the
      // "stuck, refresh to recover" failure mode this protects against.
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "", buffer = "";
      const READ_TIMEOUT_MS = 60_000;

      while (true) {
        const result = await Promise.race([
          reader.read(),
          new Promise<{ done: true; value: undefined; timeout: true }>((resolve) =>
            setTimeout(
              () => resolve({ done: true, value: undefined, timeout: true }),
              READ_TIMEOUT_MS
            )
          ),
        ]);

        if ("timeout" in result && result.timeout) {
          contentEl.innerHTML =
            `<div class="error-msg">Connection stalled. Refresh and try again — your conversation is saved.</div>`;
          try { reader.cancel(); } catch {}
          brainStateRef.current = "idle";
          activeColorRef.current = null;
          setIsStreaming(false);
          if (sendBtnRef.current) sendBtnRef.current.disabled = false;
          return;
        }

        const { done, value } = result;
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const event = JSON.parse(raw);
            if (event.type === "text") {
              fullText += event.content;
              // Render incrementally as text arrives — feels native, like
              // Claude.ai. The post-stream typewriter at the bottom of this
              // function used to do this after the fact, which made short
              // responses (like the session-open opening) feel canned and
              // pre-programmed because the streaming finished before any
              // visible typing happened. 2026-06-25.
              try {
                contentEl.innerHTML = formatMarkdown(fullText);
                scrollToBottom();
              } catch { /* tolerate transient markdown parse errors */ }
            } else if (event.type === "status") {
              activateNode(event.content);
              // Show tool status live — replaces typing dots
              contentEl.innerHTML = `<div class="status-msg">${event.content}</div>`;
              scrollToBottom();
            } else if (event.type === "error") {
              contentEl.innerHTML = `<div class="error-msg">${event.content}</div>`;
            } else if (event.type === "done") {
              if (event.raise_id) raiseIdRef.current = event.raise_id;
              if (event.conversation_id) conversationIdRef.current = event.conversation_id;
              brainStateRef.current = "idle";
              activeColorRef.current = null;
              // If a match_investors call happened this round, refresh the
              // Matches count badge now — done event fires after the brain
              // has fully committed the new batch to user_documents. The
              // earlier matches_updated SSE event sometimes raced ahead of
              // commit; this is the reliable trigger.
              if (matchesUpdatedThisRoundRef.current) {
                matchesUpdatedThisRoundRef.current = false;
                try {
                  window.dispatchEvent(new CustomEvent("raisefn:matches_updated"));
                } catch { /* defensive */ }
              }
              if (documentUploadedThisRoundRef.current) {
                documentUploadedThisRoundRef.current = false;
                try {
                  window.dispatchEvent(new CustomEvent("raisefn:documents_updated"));
                } catch { /* defensive */ }
              }
            } else if (event.type === "usage") {
              // Track usage state for nav Upgrade button + soft card.
              // Mirror tier to localStorage so the Nav component (which
              // doesn't have direct access to chat state) can render the
              // Upgrade pill based on a fresh value.
              if (typeof event.tier === "string") {
                setUserTier(event.tier);
                try {
                  localStorage.setItem("raisefn_user_tier", event.tier);
                } catch { /* private browsing etc. */ }
              }
              if (typeof event.lifetime_count === "number") {
                lifetimeCountRef.current = event.lifetime_count;
              }
              if (typeof event.month_count === "number") {
                monthCountRef.current = event.month_count;
              }
              if (typeof event.month_cap === "number" || event.month_cap === null) {
                monthCapRef.current = event.month_cap;
              }
            } else if (event.type === "limit_reached") {
              limitReachedRef.current = {
                tier: event.tier,
                reason: event.reason ?? null,
                cap: event.cap ?? null,
                next_reset: event.next_reset ?? null,
                reset_label: event.reset_label ?? null,
              };
            } else if (event.type === "limit_warning") {
              limitWarningRef.current = {
                tier: event.tier,
                window: event.window,
                remaining: event.remaining,
                cap: event.cap,
                next_reset: event.next_reset ?? null,
                reset_label: event.reset_label ?? null,
              };
            } else if (event.type === "matches_updated") {
              // Brain emits this after match_investors runs successfully.
              // Defer the badge refresh to the `done` event so the brain
              // has fully committed before BrainTabs re-fetches /matches/mine.
              // Without the defer, badge sometimes read stale data because
              // the SSE event was emitted before the savepoint flushed.
              matchesUpdatedThisRoundRef.current = true;
            } else if (event.type === "outreach_draft") {
              // Phase 5b — draft_outreach tool just returned. Render an
              // inline preview card below the in-flight assistant message
              // with editable subject/body + Send via Gmail button.
              try {
                const draftData = {
                  investor_slug: String(event.investor_slug || ""),
                  investor_name: String(event.investor_name || "Investor"),
                  investor_firm: event.investor_firm ? String(event.investor_firm) : null,
                  to_email: event.to_email ? String(event.to_email) : "",
                  missing_email: Boolean(event.missing_email),
                  subject: String(event.subject || ""),
                  body: String(event.body || ""),
                  brief_token: event.brief_token ? String(event.brief_token) : null,
                  connected_email: event.connected_email ? String(event.connected_email) : null,
                };
                renderOutreachDraftCard(
                  draftData,
                  contentEl.parentElement || contentEl,
                  session,
                  impersonating,
                );
              } catch { /* defensive */ }
            }
            // Note: `matches_panel` + `agent_plan` event handlers removed.
            // Match data lives in user_documents + Matches tab. The LLM
            // writes a self-contained summary per system prompt rule 9.
          } catch { /* ignore parse errors */ }
        }
      }

      // Streaming-time rendering above (in the `text` event handler) already
      // wrote the response into the bubble incrementally — like Claude.ai.
      // Here we just persist the final text to history + ensure the final
      // markdown render is clean. The old post-stream typewriter is gone —
      // it made short responses feel canned because streaming finished before
      // any visible typing happened (raise(fn)'s session-open opening was
      // the trigger 2026-06-25).
      if (fullText) {
        historyRef.current.push({ role: "assistant", content: fullText });
        // Defensive final render — streaming-time may have skipped some
        // chunks if markdown parsing transiently choked.
        try {
          contentEl.innerHTML = formatMarkdown(fullText);
        } catch { /* tolerate */ }
        scrollToElement(assistantEl);

        // ── Limit signals ─────────────────────────────────────────
        // Render the soft warning chip above the response (one-shot at 80%).
        if (limitWarningRef.current) {
          const w = limitWarningRef.current;
          const chip = document.createElement("div");
          chip.className =
            "mb-3 flex items-center gap-2 rounded-md border border-amber-700/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-200";
          // reset_label is server-formatted, timezone-stable ("May 1",
          // "tomorrow", "in under an hour"). Don't try to localize.
          const resetLabel = w.reset_label || "soon";
          chip.textContent =
            `${w.remaining} message${w.remaining === 1 ? "" : "s"} left this ${w.window === "monthly" ? "month" : w.window === "daily" ? "day" : "hour"}. ` +
            `Resets ${resetLabel}.`;
          contentEl.parentElement?.insertBefore(chip, contentEl);
          limitWarningRef.current = null;
        }

        // Pricing v3 (2026-06-10): the msg-12 soft Advisor card was
        // removed. Three hard walls (30 msg / 10 briefs / 30 matches)
        // now carry the entire upgrade pitch via the limit_reached
        // event handler below.

        // (limit_reached card render moved OUT of this if-fullText block —
        // see below. It runs whether or not text was streamed.)
      }

      // Render the upgrade card whenever the cap was hit. Has to live
      // OUTSIDE the if (fullText) block above because brain doesn't stream
      // any text on limit_reached — fullText is empty, the typewriter block
      // is skipped, but we still need to show the card.
      if (limitReachedRef.current) {
        const lr = limitReachedRef.current;
        // Free tier (Phase 3 model — no more free_verified split) hits cap
        // → show the rich upgrade card. Paid tier hits day/month cap →
        // show the Concierge mailto.
        const isFreeVerified = lr.tier === "free";

        // The card IS the response — no empty assistant bubble above it.
        // Brain stops streaming text on limit_reached; the placeholder
        // bubble would just sit empty, so remove it.
        assistantEl.remove();

        const card = document.createElement("div");
        card.className = "upgrade-card";

        if (isFreeVerified) {
            // Pricing v3 (2026-06-10) — equal-twin tiles. Pro (SaaS) and
            // Advisor (concierge) presented side-by-side; user picks
            // based on what they need. Leadin reflects which lifetime cap
            // fired (messages / briefs / matches). Copy lives in
            // lib/upgrade-card-copy.ts so this card + the design preview
            // route can't drift.
            const leadin = wallCardLeadin(lr.reason);

            card.innerHTML = `
              <div class="upgrade-card-leadin">${leadin}</div>

              <div class="upgrade-card-tiers">
                <div class="upgrade-card-tier upgrade-card-tier--pro">
                  <div class="upgrade-card-tier-name">Pro</div>
                  <div class="upgrade-card-tier-price">$199/mo · cancel anytime</div>
                  <div class="upgrade-card-tier-pitch">
                    Uncapped product, same brain you already know. The SaaS path.
                  </div>
                  <ul class="upgrade-card-tier-list">
                    <li>Uncapped chat with the brain</li>
                    <li>Uncapped investor matches</li>
                    <li>Uncapped briefs</li>
                    <li>Pipeline + memory across sessions</li>
                  </ul>
                  <button class="upgrade-card-tier-cta" data-cta="pro">
                    Get Pro — $199/mo
                  </button>
                  <div class="upgrade-card-error" data-err="pro" style="display:none"></div>
                </div>

                <div class="upgrade-card-tier upgrade-card-tier--advisor">
                  <div class="upgrade-card-tier-name">Advisor</div>
                  <div class="upgrade-card-tier-price">$999/mo × 3 · or $1,999 upfront</div>
                  <div class="upgrade-card-tier-pitch">
                    Three months with raise(fn) Team in the loop on your raise — guidance from someone who's been there, plus warm intros to our proprietary investor network.
                  </div>
                  <ul class="upgrade-card-tier-list">
                    <li>Warm intros to our proprietary network when there's a match</li>
                    <li>Tailored briefs for every investor you target</li>
                    <li>Pre-meeting prep + post-meeting debriefs</li>
                    <li>Pipeline tracking + weekly check-ins</li>
                  </ul>
                  <button class="upgrade-card-tier-cta" data-cta="advisor">
                    Get Advisor — $999/mo
                  </button>
                  <div class="upgrade-card-error" data-err="advisor" style="display:none"></div>
                  <div class="upgrade-card-tier-foot">
                    No success fees. No equity. Save ~33% with $1,999 upfront.
                    <a href="/legal/engagement">Full engagement letter</a>.
                  </div>
                </div>
              </div>
            `;
          } else {
            // Paid tier hit a soft cap — no upsell. Advisor customers are mid
            // engagement; just acknowledge and offer direct contact for more.
            card.innerHTML = `
              <div class="upgrade-card-leadin">
                Heavy month — you've hit a monthly soft cap on Advisor usage.
                This is a temporary cost protection during your engagement.
              </div>
              <div class="upgrade-card-header">Need more this month?</div>
              <div class="upgrade-card-subhead">
                If you're actively closing a raise and need the cap bumped, just
                email and we'll handle it.
              </div>
              <div class="upgrade-card-cta-row">
                <a href="mailto:team@raisefn.com?subject=Advisor%20cap%20bump"
                   class="upgrade-card-btn"
                   style="text-decoration:none">
                  Email team@raisefn.com
                </a>
              </div>
            `;
          }

          // Append to the chat container (a sibling of the message bubbles)
          // instead of inside contentEl — that lets the card span the full
          // chat width instead of being capped at 65% by .message.assistant.
          const cardParent = messagesInnerRef.current ?? contentEl;
          cardParent.appendChild(card);
          // Make sure the user actually SEES the card — scroll it into view.
          requestAnimationFrame(() => {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
          });

          // Wire each tier CTA → Stripe checkout. Pricing v3 (2026-06-10):
          // Pro and Advisor both route through /api/stripe/checkout with
          // the right tier body. Defensive token re-fetch + 401 → /signup
          // is preserved per tier.
          if (isFreeVerified) {
            const wireTierCta = (tier: "pro" | "advisor") => {
              const btn = card.querySelector(
                `.upgrade-card-tier-cta[data-cta="${tier}"]`
              ) as HTMLButtonElement | null;
              const errDiv = card.querySelector(
                `.upgrade-card-error[data-err="${tier}"]`
              ) as HTMLDivElement | null;
              if (!btn) return;
              const originalLabel = btn.textContent || "";
              btn.addEventListener("click", async () => {
                const { data: { session: freshSession } } = await supabase.auth.getSession();
                const token = freshSession?.access_token;
                if (!token) {
                  try {
                    localStorage.setItem("pendingPostAuthIntent", `upgrade-${tier}`);
                  } catch { /* ignore */ }
                  router.push(`/signup?after=upgrade-${tier}`);
                  return;
                }
                btn.disabled = true;
                btn.textContent = "Opening checkout…";
                try {
                  const res = await fetch("/api/stripe/checkout", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ tier }),
                  });
                  if (res.status === 401) {
                    try {
                      localStorage.setItem("pendingPostAuthIntent", `upgrade-${tier}`);
                    } catch { /* ignore */ }
                    router.push(`/signup?after=upgrade-${tier}`);
                    return;
                  }
                  const data = await res.json();
                  if (!res.ok || !data.url) {
                    throw new Error(data.error || "Checkout failed");
                  }
                  window.location.href = data.url;
                } catch (e) {
                  btn.disabled = false;
                  btn.textContent = originalLabel;
                  if (errDiv) {
                    errDiv.style.display = "block";
                    errDiv.textContent =
                      "Couldn't start checkout — try again or email team@raisefn.com.";
                  }
                  console.error("Stripe checkout error:", e);
                }
              });
            };
            wireTierCta("pro");
            wireTierCta("advisor");
          }

        limitReachedRef.current = null;
      }
    } catch (e) {
      const errDiv = document.createElement("div");
      errDiv.className = "error-msg";
      errDiv.textContent = "Connection error: " + (e instanceof Error ? e.message : "Unknown error");
      contentEl.innerHTML = "";
      contentEl.appendChild(errDiv);
    }

    brainStateRef.current = "idle";
    activeColorRef.current = null;
    setIsStreaming(false);
    if (sendBtnRef.current) sendBtnRef.current.disabled = false;
    textareaRef.current?.focus();
  }, [isStreaming, session, chatStarted, impersonating]);

  /* ── Session restore: load previous conversation or show welcome ── */
  useEffect(() => {
    if (!session || loading || hasAutoProbed.current || chatStarted) return;
    hasAutoProbed.current = true;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
    };
    if (impersonating) {
      headers["X-Impersonate"] = impersonating;
    }

    // Build welcome message from signup metadata — no API call, no fake conversation
    function buildWelcomeMessage(firstName: string): string {
      const meta = session?.user?.user_metadata || {};
      const role = (meta.role as string) || "founder";

      if (role === "investor") {
        return `Hey ${firstName}! A few quick questions to help me understand your investment focus.`;
      }
      if (role === "builder") {
        return `Hey ${firstName}! Welcome to raise(fn). What are you working on?`;
      }
      // Founder — two-bubble welcome aligned to Phase 3 locked plan
      // (2026-05-06). The old "tools unlock once we wrap" framing is gone
      // because tools are always free now. The new framing invites the
      // composable upload: drop a deck, paste a list, share a URL, or just
      // describe. Brain handles whatever comes in — deck extraction fires
      // automatically on uploads; chat auto-extract captures from text.
      return `Hey ${firstName}. Welcome to raise(fn).`;
    }

    function showWelcome(firstName: string) {
      const meta = session?.user?.user_metadata || {};
      const role = (meta.role as string) || "founder";

      if (role === "investor") {
        showWelcomeTwoBubbles(
          firstName,
          buildWelcomeMessage(firstName),
          "Tell me about your investment thesis — sectors, stages, and the types of companies you back."
        );
      } else if (role === "founder" || !role) {
        // Founders get the greeting bubble, then raise(fn) auto-fires a
        // session-open trigger (silent [session_open] message). Brain
        // calls plan_my_raise; eligible founders get an action-step card,
        // ineligible get the default "What's on your mind today?" reply.
        // Either way the second bubble comes from raise(fn), not local copy.
        showWelcomeThenAutoPlan(firstName, buildWelcomeMessage(firstName));
      } else {
        showWelcomeWithMessage(firstName, buildWelcomeMessage(firstName));
      }
    }

    function showWelcomeThenAutoPlan(_firstName: string, _message: string) {
      // 2026-06-25: the hardcoded "Hey [Name]. Welcome to raise(fn)." bubble
      // is gone. The LLM's [session_open] response IS the opening message
      // now (rule 20 in chat.py — the "plane / pilot / 5-step pathway").
      // Stacking the hardcoded greeting on top of the LLM response produced
      // a double-bubble: a hollow "Welcome" then a long delay then the real
      // opening. The LLM owns the welcome end-to-end.
      setChatStarted(true);
      setSessionReady(true);
      centerUiRef.current?.classList.add("at-bottom");
      messagesRef.current?.classList.add("active");
      // No bubble added here. The session_open useEffect below fires
      // [session_open] which goes through send(), which adds its own
      // assistant bubble with a typing indicator + streaming response.
    }

    function showWelcomeWithMessage(firstName: string, message: string) {
      setChatStarted(true);
      setSessionReady(true);
      centerUiRef.current?.classList.add("at-bottom");
      messagesRef.current?.classList.add("active");

      const typingEl = addMessageToDOM("assistant", "");
      const typingContent = typingEl.querySelector(".content") as HTMLElement;
      if (typingContent) {
        typingContent.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
        setTimeout(() => {
          typingContent.innerHTML = formatMarkdown(message);
          requestAnimationFrame(() => scrollToBottom());
        }, 800);
      }
    }

    function showWelcomeTwoBubbles(firstName: string, greeting: string, question: string) {
      setChatStarted(true);
      setSessionReady(true);
      centerUiRef.current?.classList.add("at-bottom");
      messagesRef.current?.classList.add("active");

      // First bubble — greeting
      const greetEl = addMessageToDOM("assistant", "");
      const greetContent = greetEl.querySelector(".content") as HTMLElement;
      if (greetContent) {
        greetContent.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
        setTimeout(() => {
          greetContent.innerHTML = formatMarkdown(greeting);
          requestAnimationFrame(() => scrollToBottom());

          // Second bubble — question, after a pause
          setTimeout(() => {
            const questionEl = addMessageToDOM("assistant", "");
            const questionContent = questionEl.querySelector(".content") as HTMLElement;
            if (questionContent) {
              questionContent.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
              setTimeout(() => {
                questionContent.innerHTML = formatMarkdown(question);
                requestAnimationFrame(() => scrollToBottom());
              }, 600);
            }
          }, 1000);
        }, 800);
      }
    }

    const fallbackName = (session.user?.user_metadata?.name as string)?.split(" ")[0]
      || session.user?.email?.split("@")[0] || "";

    fetch("/v1/brain/session", { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        // Session endpoint unavailable or errored — show welcome
        if (!data) {
          showWelcome(fallbackName);
          return;
        }

        // Store profile name and tier
        if (data.name) setProfileName(data.name);
        if (data.tier) setUserTier(data.tier);

        const firstName = data.name?.split(" ")[0] || fallbackName;

        // If there's an existing conversation with REAL messages, restore it
        // Filter out any __init__ or empty messages from old buggy sessions
        if (data.conversation && data.conversation.message_count > 0) {
          const realMessages = (data.conversation.messages || []).filter(
            (msg: { role: string; content: string }) =>
              msg.content
              && msg.content.trim() !== ""
              && msg.content !== "__init__"
              // Filter out the dashboard's silent session-open trigger —
              // it's a system marker, not a user message. Brain now skips
              // persisting it (conversation.append_messages), but old DB
              // rows still have it.
              && msg.content.trim() !== "[session_open]"
          );

          // If no real messages after filtering, treat as new user
          if (realMessages.length === 0) {
            showWelcome(firstName);
            return;
          }

          setChatStarted(true);
          setSessionReady(true);
          centerUiRef.current?.classList.add("at-bottom");
          messagesRef.current?.classList.add("active");

          conversationIdRef.current = data.conversation.id;
          if (data.conversation.campaign_id) {
            raiseIdRef.current = data.conversation.campaign_id;
          }

          // Render previous messages + track timestamp of the latest
          // assistant turn (drives the session_open auto-fire gate so we
          // don't stack synthesis on every refresh — see the session_open
          // useEffect below).
          for (const msg of realMessages) {
            let displayContent = msg.content;
            if (msg.role === "user" && typeof msg.content === "string" && msg.content.startsWith("[Attached file:")) {
              const fnMatch = msg.content.match(/\[Attached file: (.+?)\]/);
              const filename = fnMatch ? fnMatch[1] : "document";
              const parts = msg.content.split("\n\n");
              const userText = parts.length > 2 ? parts[parts.length - 1] : "";
              displayContent = `📎 ${filename}${userText ? "\n" + userText : ""}`;
            }
            addMessageToDOM(msg.role, displayContent);
            historyRef.current.push({ role: msg.role, content: msg.content });
            if (msg.role === "assistant") {
              restoredAssistantCountRef.current += 1;
            }
          }

          // Claude Code-style persistent thread: restore renders the prior
          // bubbles, then the autoProbe useEffect fires [session_open] and
          // raise(fn) appends a synthesis turn at the bottom (per system
          // prompt rule 20). No hardcoded "Welcome back" line — that
          // violates rule 2's active-voice principle.
          requestAnimationFrame(() => scrollToBottom());

          // Auto-retry the message that was blocked before upgrade
          const isCheckoutSuccess = new URLSearchParams(window.location.search).get("checkout") === "success";
          if (isCheckoutSuccess) {
            window.history.replaceState({}, "", "/brain/deploy");
            try {
              const retryMsg = sessionStorage.getItem("raisefn_retry_msg");
              if (retryMsg) {
                sessionStorage.removeItem("raisefn_retry_msg");
                setTimeout(() => send(retryMsg), 1200);
              }
            } catch {}
          }
          return;
        }

        // No previous conversation — check if this is a new paid user from checkout
        const isNewPaidUser = new URLSearchParams(window.location.search).get("checkout") === "success";
        if (isNewPaidUser) {
          window.history.replaceState({}, "", "/brain/deploy");
          showWelcomeWithMessage(firstName, `${firstName}, hell yeah. Let's get to work! What are you building? How much are we raising? Anything else that'll help us hit the ground running?`);
        } else {
          showWelcome(firstName);
        }
      })
      .catch(() => {
        showWelcome(fallbackName);
      });
  // impersonating in deps so switching the "Acting as" dropdown re-fetches
  // the impersonated user's prior conversation. Without it, the effect ran
  // once on initial page load and never re-fired after the dropdown handler
  // reset hasAutoProbed.current / chatStarted / historyRef — leaving the
  // new impersonation user's chat blank even when they had stored messages
  // (Taylor Bennett, 2026-06-16: 14-message conversation existed but never
  // restored on dropdown switch).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, loading, impersonating]);

  /* ── Session-open: every time founder opens raise(fn) ──────
   *
   * Fires once per browser session (chat page mount), after the welcome
   * OR a session restore lands. Two paths:
   *
   * 1. If there's an in-progress plan in localStorage → resume it
   *    (replay completed step bubbles + reopen the SSE stream so the
   *    next approval gate appears in chat).
   * 2. Otherwise → fire a silent `[session_open]` message. Brain rule 21
   *    routes it: advisor + active campaign → plan_my_raise + chat-turn
   *    execution. Ineligible → graceful "What are we working on today,
   *    or would you like me to suggest?"
   *
   * Runs even when a prior conversation was restored — the founder still
   * opens raise(fn) and should get action steps (Justin's directive). */
  /* ── Session-open auto-fire ────────────────────────────────
   * Fires a silent [session_open] message once per mount after the
   * greeting bubble lands. Skipped when the restored conversation
   * already has any assistant turn (founder is mid-session; the
   * thread itself is the continuity). Next-day sessions still get
   * synthesis because brain auto-rotates inactive conversations,
   * so restore returns zero turns next day. */
  const hasFiredSessionOpen = useRef(false);
  useEffect(() => {
    if (!session || !chatStarted || hasFiredSessionOpen.current) return;
    hasFiredSessionOpen.current = true;
    if (restoredAssistantCountRef.current > 0) return;
    void send("[session_open]", { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, chatStarted]);

  /* ── One-time cleanup of stale agent-loop localStorage ────────
   * The agent loop wrote raisefn_active_plan_id when a plan was
   * mid-execution. Phase 1 deletion removed the plan tool entirely;
   * this cleans up the key so it doesn't sit forever in returning
   * founders' browsers. Safe to remove this effect after a few weeks
   * of post-Phase-1 traffic. */
  useEffect(() => {
    try { localStorage.removeItem("raisefn_active_plan_id"); } catch { /* private browsing */ }
  }, []);

  /* ── DOM helpers (imperative, like the original) ── */
  function addMessageToDOM(role: string, content: string): HTMLDivElement {
    const inner = messagesInnerRef.current!;
    const div = document.createElement("div");
    div.className = `message ${role}`;
    if (role === "assistant") {
      div.innerHTML = `<div class="content">${formatMarkdown(content)}</div>`;
    } else {
      div.textContent = content;
    }
    inner.appendChild(div);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToBottom());
    });
    return div;
  }

  function scrollToBottom() {
    const m = messagesRef.current;
    if (m) m.scrollTop = m.scrollHeight + 200;
  }

  function safeLocalStorageGet(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function scrollToElement(el: HTMLElement) {
    const m = messagesRef.current;
    if (m && el) {
      const containerRect = m.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      m.scrollTop = m.scrollTop + (elRect.top - containerRect.top) - 20;
    }
  }

  function activateNode(statusText: string) {
    brainStateRef.current = "active";
    for (const [label, colorKey] of Object.entries(TOOL_COLORS)) {
      if (statusText.toLowerCase().includes(label)) {
        activeColorRef.current = COLORS[colorKey];
        return;
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendFromInput();
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to upload file.");
        return;
      }
      if (data.kind === "image") {
        setAttachedFile({
          kind: "image",
          name: data.filename,
          mediaType: data.media_type,
          data: data.data,
        });
      } else if (data.kind === "document") {
        setAttachedFile({
          kind: "document",
          name: data.filename,
          mediaType: data.media_type,
          data: data.data,
        });
      } else {
        setAttachedFile({ kind: "text", name: data.filename, text: data.text });
      }
    } catch {
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Paste handler — clipboard image (Cmd+V on a screenshot) becomes an
  // attached image, same path as the file picker.
  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === "file" && it.type.startsWith("image/")) {
        const file = it.getAsFile();
        if (file) {
          e.preventDefault();
          await uploadFile(file);
          return;
        }
      }
    }
  }

  function sendFromInput() {
    const userText = input.trim();
    if ((!userText && !attachedFile) || isStreaming) return;

    // Flag the round so the `done` handler dispatches documents_updated
    // and the sidebar refetches once the attachment is persisted.
    if (attachedFile && (attachedFile.kind === "document" || attachedFile.kind === "text")) {
      documentUploadedThisRoundRef.current = true;
    }

    // Build display message (what the user sees) and brain message (what gets sent)
    let displayMsg = userText;
    let brainMsg = userText;
    let imagePayload: { media_type: string; data: string }[] | undefined;
    let documentPayload: { media_type: string; data: string; filename: string }[] | undefined;

    if (attachedFile) {
      if (attachedFile.kind === "image") {
        // Images go to the brain as multimodal content blocks via `images`,
        // not stuffed into the text. The model sees the screenshot directly.
        const instruction = userText || "What's in this image?";
        displayMsg = `🖼 ${attachedFile.name}${userText ? "\n" + userText : ""}`;
        brainMsg = instruction;
        imagePayload = [{ media_type: attachedFile.mediaType, data: attachedFile.data }];
      } else if (attachedFile.kind === "document") {
        // Raw PDF — Claude reads it natively via document content block.
        // Used as the fallback for PDFs whose text layer can't be extracted
        // (Canva/Figma/Keynote exports). No `[Attached file: ...]` wrapper
        // in the text because the document IS the content; the wrapper is
        // a text-path concept.
        const instruction = userText || "Please analyze this deck.";
        displayMsg = `📎 ${attachedFile.name}${userText ? "\n" + userText : ""}`;
        brainMsg = instruction;
        documentPayload = [{
          media_type: attachedFile.mediaType,
          data: attachedFile.data,
          filename: attachedFile.name,
        }];
      } else {
        const instruction = userText || "Please analyze this document.";
        displayMsg = `📎 ${attachedFile.name}${userText ? "\n" + userText : ""}`;
        brainMsg = `[Attached file: ${attachedFile.name}]\n\n${attachedFile.text}\n\n${instruction}`;
      }
      setAttachedFile(null);
    }

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "48px";
    send(brainMsg, { displayMessage: displayMsg, images: imagePayload, documents: documentPayload });
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "48px";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  function switchClient(email: string) {
    setImpersonating(email);
    setImpersonateInput(email);
    // Clear conversation
    if (messagesInnerRef.current) messagesInnerRef.current.innerHTML = "";
    historyRef.current = [];
    raiseIdRef.current = null;
    conversationIdRef.current = null;
    setChatStarted(false);
    centerUiRef.current?.classList.remove("at-bottom");
    messagesRef.current?.classList.remove("active");
    // Re-enable the one-shot session-restore useEffect so the new impersonation
    // target's existing conversation (and welcome state) gets loaded via
    // /brain/session with the new X-Impersonate header. Without this reset,
    // the impersonated user's chat starts blank even when they have prior
    // conversations.
    hasAutoProbed.current = false;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="brain-root" style={{ alignItems: "center", justifyContent: "center" }}>
        <style>{BRAIN_CSS}</style>
        <p style={{ color: "#52525b", fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const userName = profileName || session.user?.user_metadata?.name || session.user?.email?.split("@")[0] || "";
  const displayName = impersonating ? `${impersonating} (via ${userName})` : userName;

  // Inject a prompt into the chat input from the sidebar. Founder still
  // hits send — the sidebar never sends on its own ("chat is the verb").
  const injectChatPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
    // If we're on mobile and the sidebar drawer is open, close it.
    setMobileSidebarOpen(false);
  };

  return (
    <div className="brain-root">
      <style>{BRAIN_CSS}</style>
      <style>{SURFACE_GRID_CSS}</style>

      {/* Checkout success banner */}
      {checkoutSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-teal-700/50 bg-teal-950/90 px-6 py-3 text-sm text-teal-300 shadow-lg backdrop-blur-sm">
          {"You're upgraded! All tools are now unlocked."}
        </div>
      )}

      {/* Unified product top bar — logo + account (tabs removed in v2 — sidebar surfaces matches/briefs directly) */}
      <BrainTabs />

      {/* Surface grid: sidebar (260px) + main chat + optional panel.
          Grid columns shift when a panel is open — chat compresses from
          flex-1 to ~40% so the panel can take ~60%. CSS transition the
          column widths so the chat doesn't jump. */}
      <div className={`surface-grid${mobileSidebarOpen ? " mobile-sidebar-open" : ""}${panel ? " panel-open" : ""}`}>
        {/* Mobile sidebar backdrop */}
        {mobileSidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className={`sidebar-wrap${mobileSidebarOpen ? " open" : ""}`}>
          <FounderSidebar
            session={session}
            impersonating={impersonating}
            injectChatPrompt={injectChatPrompt}
            openPanel={openPanel}
            adminHeader={
              isAdmin ? (
                <>
                  <span className="sb-admin-label">Acting as</span>
                  {adminUsers.length > 0 ? (
                    <select
                      value={impersonating}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          switchClient(val);
                        } else {
                          setImpersonating("");
                          setImpersonateInput("");
                          if (messagesInnerRef.current) messagesInnerRef.current.innerHTML = "";
                          historyRef.current = [];
                          raiseIdRef.current = null;
                          conversationIdRef.current = null;
                          setChatStarted(false);
                          hasAutoProbed.current = false;
                          centerUiRef.current?.classList.remove("at-bottom");
                          messagesRef.current?.classList.remove("active");
                        }
                      }}
                      className="sb-admin-select"
                    >
                      <option value="">Myself</option>
                      {adminUsers
                        .filter((u) => {
                          const e = (u.email || "").toLowerCase();
                          if (e.startsWith("demo+")) return false;
                          if (e === "service@raisefn.com") return false;
                          return true;
                        })
                        .map((u) => (
                          <option key={u.email} value={u.email}>
                            {u.name || u.email} — {u.role}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="email"
                      value={impersonateInput}
                      onChange={(e) => setImpersonateInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") switchClient(impersonateInput.trim().toLowerCase());
                      }}
                      placeholder="client@email.com"
                      className="sb-admin-select"
                    />
                  )}
                  {impersonating && (
                    <button
                      onClick={() => {
                        setImpersonating("");
                        setImpersonateInput("");
                        if (messagesInnerRef.current) messagesInnerRef.current.innerHTML = "";
                        historyRef.current = [];
                        raiseIdRef.current = null;
                        conversationIdRef.current = null;
                        setChatStarted(false);
                        hasAutoProbed.current = false;
                        centerUiRef.current?.classList.remove("at-bottom");
                        messagesRef.current?.classList.remove("active");
                      }}
                      className="sb-admin-clear"
                    >
                      Back to me
                    </button>
                  )}
                </>
              ) : null
            }
          />
        </div>

        {/* Main */}
        <div className="brain-main" ref={mainRef}>
          {/* Mobile sidebar toggle */}
          <button
            type="button"
            className="mobile-sidebar-toggle"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <canvas className="brain-canvas" ref={canvasRef} />

        <div className="messages-container" ref={messagesRef}>
          <div className="messages-inner" ref={messagesInnerRef} />
        </div>

        <div className="center-ui" ref={centerUiRef} style={{ opacity: sessionReady ? 1 : 0 }}>
          <div className="center-label">
            <span className="o">raise</span><span className="t">(fn)</span>
          </div>
          <div className="welcome-text">
            <h2>Tell me about your raise <span className="t">(or paste anything).</span></h2>
            <p>{impersonating ? `Acting as ${impersonating}` : "Deck, investor list, company URL, or just describe it."}</p>
          </div>
          {showSharpenNudge && (
            <div className="sharpen-nudge">
              <span className="sharpen-nudge-text">
                Want sharper outputs?{" "}
                <button
                  type="button"
                  onClick={() => {
                    dismissSharpenNudge();
                    openPanel({ kind: "sharpen", section: "basics" });
                  }}
                  className="sharpen-nudge-link"
                >
                  Fine tune your agent →
                </button>
              </span>
              <button
                onClick={dismissSharpenNudge}
                className="sharpen-nudge-close"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
          <div className="starters">
            {STARTERS.map((s) => (
              <button key={s} className="starter" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
          <div className="input-bar">
            {attachedFile && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", fontSize: "12px", color: "#2dd4bf", background: "#18181b", borderRadius: "8px", marginBottom: "6px" }}>
                <span>{attachedFile.kind === "image" ? "🖼" : "📎"} {attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: "14px", padding: "0 4px" }}>✕</button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.gif,image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Ask raise(fn)..."
              rows={1}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isStreaming}
              className="send-btn"
              style={{ opacity: 0.5, fontSize: "16px", minWidth: "auto", padding: "8px 10px" }}
              title="Upload a file or image (PDF, DOCX, TXT, PNG, JPG)"
            >
              {uploading ? "..." : "📎"}
            </button>
            <button
              ref={sendBtnRef}
              className="send-btn"
              onClick={sendFromInput}
              disabled={isStreaming || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over panel — third grid column, only present when state.panel is set */}
      <div className="panel-col">
        <PanelHost
          panel={panel}
          onClose={closePanel}
          onOpenPanel={openPanel}
          onPopPanel={popPanel}
          injectChatPrompt={injectChatPrompt}
          session={session}
          impersonating={impersonating}
        />
      </div>
      </div>{/* /surface-grid */}

    </div>
  );
}

const SURFACE_GRID_CSS = `
  .surface-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 300px 1fr 0fr;
    min-height: 0;
    position: relative;
    z-index: 1;
    transition: grid-template-columns 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .surface-grid.panel-open {
    grid-template-columns: 300px minmax(360px, 40fr) minmax(480px, 60fr);
  }
  .panel-col {
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .sidebar-wrap {
    min-height: 0;
    overflow: hidden;
    display: flex;
  }
  .sidebar-wrap > aside {
    flex: 1;
    min-height: 0;
  }
  .mobile-sidebar-toggle {
    display: none;
  }
  .sidebar-backdrop {
    display: none;
  }
  @media (max-width: 768px) {
    .surface-grid {
      grid-template-columns: 1fr;
    }
    .surface-grid.panel-open {
      grid-template-columns: 1fr;
    }
    .panel-col {
      position: fixed;
      top: 56px;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 70;
    }
    .sidebar-wrap {
      position: fixed;
      top: 56px;
      left: 0;
      bottom: 0;
      width: 260px;
      z-index: 60;
      transform: translateX(-100%);
      transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar-wrap.open {
      transform: translateX(0);
      box-shadow: 0 0 24px rgba(0, 0, 0, 0.6);
    }
    .mobile-sidebar-open .sidebar-backdrop {
      display: block;
      position: fixed;
      top: 56px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 55;
    }
    .mobile-sidebar-toggle {
      display: flex;
      position: absolute;
      top: 10px;
      left: 12px;
      z-index: 30;
      background: rgba(24, 24, 27, 0.8);
      border: 1px solid #27272a;
      color: #a1a1aa;
      width: 32px;
      height: 32px;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
    }
    .mobile-sidebar-toggle:hover {
      color: #e4e4e7;
      border-color: #3f3f46;
    }
  }
`;
