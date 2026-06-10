"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrainTabs from "@/components/brain-tabs";
import { supabase } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";

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

  // Walk text nodes in the brain's rendered response and inject a small
  // "+ brief" button immediately AFTER the first occurrence of each known
  // investor name. Founder reads the brain's recommendation and acts
  // inline — no scroll-down-and-hunt.
  const used = new Set<string>();
  const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (
        p.tagName === "CODE" ||
        p.tagName === "PRE" ||
        p.closest(".inline-brief-btn")
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const textNodes: Text[] = [];
  let n: Text | null;
  while ((n = walker.nextNode() as Text | null)) textNodes.push(n);

  const wordChar = /[a-z0-9]/i;
  for (const textNode of textNodes) {
    const text = textNode.textContent || "";
    if (!text.trim()) continue;
    const lower = text.toLowerCase();

    // Find the EARLIEST match across all un-used investor keys in this node.
    let bestIdx = -1;
    let bestEntry: MatchEntry | null = null;
    for (const entry of entries) {
      if (used.has(entry.key)) continue;
      const idx = lower.indexOf(entry.key);
      if (idx === -1) continue;
      const before = idx === 0 ? " " : text[idx - 1];
      const after =
        idx + entry.key.length >= text.length ? " " : text[idx + entry.key.length];
      if (wordChar.test(before) || wordChar.test(after)) continue;
      // Capitalization gate — investor names are proper nouns, so the
      // first character of the match in the ORIGINAL text must be uppercase.
      // Prevents single-word firms like "Science" (Science Inc., LA-based)
      // from matching the lowercased word "science" in prose ("materials
      // science", "hard science").
      const firstChar = text[idx];
      if (firstChar && firstChar !== firstChar.toUpperCase()) continue;
      if (bestIdx === -1 || idx < bestIdx) {
        bestIdx = idx;
        bestEntry = entry;
      }
    }
    if (bestIdx === -1 || !bestEntry) continue;

    // Negative-context skip — the brain frequently mentions investors in
    // dismissive contexts ("DCG, Tribe Capital — all skipped", "not worth
    // chasing X", "pass on Y"). Injecting a "Generate brief for DCG"
    // button right next to "all skipped" makes the product look broken.
    // Scan a ~60-char window around the match for dismissive keywords;
    // if present, mark the name as used and move on without the button.
    const winStart = Math.max(0, bestIdx - 60);
    const winEnd = Math.min(text.length, bestIdx + bestEntry.key.length + 60);
    const win = text.slice(winStart, winEnd).toLowerCase();
    const NEGATIVE_CONTEXT = /\b(skip|skipped|skipping|ignore|ignored|pass on|passed on|rejected|not worth|don'?t bother)\b/;
    if (NEGATIVE_CONTEXT.test(win)) {
      used.add(bestEntry.key);
      continue;
    }

    // Skip table cells — the matches page already grids those out cleanly
    // and inline-button injection inside a <td> looks broken.
    if (textNode.parentElement?.closest("table")) {
      used.add(bestEntry.key);
      continue;
    }

    const matchedText = text.substring(bestIdx, bestIdx + bestEntry.key.length);
    const beforeText = text.substring(0, bestIdx);
    const afterText = text.substring(bestIdx + bestEntry.key.length);

    const parent = textNode.parentNode;
    if (!parent) continue;

    // Leave the text exactly as the brain wrote it. No inline button.
    const beforeNode = document.createTextNode(beforeText);
    const matchedSpan = document.createElement("span");
    matchedSpan.textContent = matchedText;
    const afterNode = document.createTextNode(afterText);

    parent.insertBefore(beforeNode, textNode);
    parent.insertBefore(matchedSpan, textNode);
    parent.insertBefore(afterNode, textNode);
    parent.removeChild(textNode);

    // Inject the button on its own line AT THE END of the paragraph
    // containing the name. The markdown formatter only emits <br> tags
    // (no <p> wrapping), so paragraphs are runs of inline content
    // separated by <br>s. Names are often wrapped in <strong>/<em>/<a>
    // by the formatter, so we walk UP through ancestors (stopping at the
    // contentEl boundary) looking for the next <br> in document flow.
    const button = createInlineBriefButton(bestEntry.investor, session, impersonating);
    let nextBr: Element | null = null;
    let walkFrom: Node | null = afterNode;
    while (walkFrom && walkFrom !== contentEl) {
      let cursor: Node | null = walkFrom.nextSibling;
      while (cursor) {
        if (
          cursor.nodeType === Node.ELEMENT_NODE &&
          (cursor as Element).tagName === "BR"
        ) {
          nextBr = cursor as Element;
          break;
        }
        cursor = cursor.nextSibling;
      }
      if (nextBr) break;
      walkFrom = walkFrom.parentNode;
    }
    if (nextBr && nextBr.parentNode) {
      nextBr.parentNode.insertBefore(button, nextBr);
    } else {
      // No <br> found anywhere downstream — name is in the last line of
      // the message. Append button to contentEl so it lands right under
      // the line, before the View-more summary that comes after.
      contentEl.appendChild(button);
    }

    used.add(bestEntry.key);
  }

  // Always show a primary CTA back to the full match list. Button-styled so
  // it doesn't get lost in surrounding prose. Total count uses the current
  // batch size when available; falls back to the cross-batch cache size.
  const total = ordered.length || SESSION_INVESTOR_CACHE.size;
  const remainder = Math.max(0, total - used.size);
  let label: string;
  if (used.size > 0 && remainder > 0) {
    label = `View ${remainder} more match${remainder === 1 ? "" : "es"}`;
  } else if (used.size === 0) {
    label = `View all ${total} matches`;
  } else {
    label = "View all matches";
  }

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

function formatMarkdown(text: string): string {
  if (!text) return "";
  let t = text;
  t = t.replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trimEnd();
    return `<pre class="code-block"><code>${escaped}</code></pre>`;
  });
  t = t.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  t = t.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  t = t.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  t = t.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  // Differentiate bold-labels ("Thesis:", "Check:", "Geo:") from bold-names
  // ("GSR Ventures", "Vinnie Lauria") so the rendered chat has real visual
  // hierarchy. Label = bold text ending in a colon → muted gray. Anything
  // else → the brand teal we use for investor names.
  t = t.replace(/\*\*(.+?)\*\*/g, (_match, content: string) => {
    if (/:\s*$/.test(content)) {
      return `<strong class="label">${content}</strong>`;
    }
    return `<strong>${content}</strong>`;
  });
  t = t.replace(/\*(.+?)\*/g, "<em>$1</em>");
  t = t.replace(/^(\d+)\. (.+)$/gm, '<li class="numbered"><span class="li-num">$1.</span> $2</li>');
  t = t.replace(/^- (.+)$/gm, '<li class="bulleted">$1</li>');
  t = t.replace(/((?:<li class="numbered">[\s\S]*?<\/li>\n?)+)/g, "<ol>$1</ol>");
  t = t.replace(/((?:<li class="bulleted">[\s\S]*?<\/li>\n?)+)/g, "<ul>$1</ul>");
  t = t.replace(/^---$/gm, "<hr>");
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  t = t.replace(/(^|[^"=])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  t = t.replace(/\n/g, "<br>");
  t = t.replace(/<br>\s*(<\/?(?:ol|ul|li|pre|h[1-3]|hr))/g, "$1");
  t = t.replace(/(<\/(?:ol|ul|pre|h[1-3]|hr)>)\s*<br>/g, "$1");
  return t;
}

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
      // Capture the match panel payload when the brain emits it mid-stream.
      // We render it INLINE after the typewriter completes so the cards
      // appear right under the brain's text response with per-row "Generate
      // brief" buttons. V1 step 3 take-aways surface.
      let matchesPanelData: {
        individuals_to_target?: Array<Record<string, unknown>>;
        firms_to_consider?: Array<Record<string, unknown>>;
        generated_at?: string;
      } | null = null;
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
            } else if (event.type === "matches_panel") {
              matchesPanelData = {
                individuals_to_target: event.individuals_to_target || [],
                firms_to_consider: event.firms_to_consider || [],
                generated_at: event.generated_at,
              };
              // Tell BrainTabs to refresh its match count badge.
              try {
                window.dispatchEvent(new CustomEvent("raisefn:matches_updated"));
              } catch { /* defensive */ }
            }
          } catch { /* ignore parse errors */ }
        }
      }

      // Show response with typewriter effect — UNLESS this response carries
      // matches_panel data. Match responses need their inline "Generate
      // brief" buttons to appear WITH the text, not after a 15-20 second
      // typewriter animation finishes. Justin's observation: the buttons
      // were placed correctly per investor but became visible all at once
      // at the end (because the text revealing them was blanked until the
      // typewriter caught up). Match responses get rendered immediately;
      // every other response keeps the typewriter for chat-feel.
      if (fullText) {
        historyRef.current.push({ role: "assistant", content: fullText });

        if (matchesPanelData) {
          // Immediate render path — no animation, buttons visible with text.
          contentEl.innerHTML = formatMarkdown(fullText);
          scrollToElement(assistantEl);
        } else {
          // Render markdown once into a temp container
          const temp = document.createElement("div");
          temp.innerHTML = formatMarkdown(fullText);

          // Collect all text nodes and their parent elements
          contentEl.innerHTML = "";
          const nodes = Array.from(temp.childNodes);

          // Clone the structure but empty all text
          for (const node of nodes) {
            contentEl.appendChild(node.cloneNode(true));
          }

          // Get all text nodes in the rendered content
          const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT);
          const textNodes: Text[] = [];
          let tn: Text | null;
          while ((tn = walker.nextNode() as Text | null)) textNodes.push(tn);

          // Store original text and blank them
          const originals = textNodes.map(t => t.textContent || "");
          textNodes.forEach(t => { t.textContent = ""; });

          // Scroll to TOP of the response
          scrollToElement(assistantEl);

          // Reveal text character by character across all text nodes
          const TICK_MS = 15;
          const charsPerTick = 1;
          let nodeIdx = 0;
          let charIdx = 0;

          await new Promise<void>((resolve) => {
            const timer = setInterval(() => {
              for (let c = 0; c < charsPerTick; c++) {
                if (nodeIdx >= textNodes.length) {
                  clearInterval(timer);
                  // Ensure final state is perfect
                  contentEl.innerHTML = formatMarkdown(fullText);
                  resolve();
                  return;
                }
                const orig = originals[nodeIdx];
                charIdx++;
                textNodes[nodeIdx].textContent = orig.slice(0, charIdx);
                if (charIdx >= orig.length) {
                  nodeIdx++;
                  charIdx = 0;
                }
              }

              // Scroll to keep latest text visible — scroll container, not to bottom
              const m = messagesRef.current;
              if (m) {
                const nearBottom = m.scrollHeight - m.scrollTop - m.clientHeight < 200;
                if (nearBottom) m.scrollTop = m.scrollHeight;
              }
            }, TICK_MS);
          });
        }

        // ── Inline matches panel (V1 step 3 take-aways surface) ────
        // When match_investors fired, brain emitted matches_panel via SSE.
        // Render structured cards under the brain's text response with
        // one-click "Generate brief" per row. This is where the founder
        // ACTS on matches — no nav to /brain/matches required, no form.
        if (matchesPanelData) {
          try {
            renderMatchesPanel(
              matchesPanelData,
              contentEl,
              session,
              impersonating,
            );
          } catch (e) {
            console.error("Failed to render matches panel:", e);
          }
        }

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

        // ── Soft upgrade card (one-time at message-12 lifetime) ────
        // Fires once per browser when a free user crosses 12 lifetime
        // messages. Pitches Advisor (concierge), dismissible. Stored in
        // localStorage so it never re-fires on this device. Advisor /
        // already-dismissed users see nothing.
        try {
          const tier = (typeof window !== "undefined"
            ? localStorage.getItem("raisefn_user_tier")
            : null) || userTier;
          const dismissed = typeof window !== "undefined"
            ? localStorage.getItem("raisefn_upgrade_card_dismissed_v1") === "1"
            : true;
          const lc = lifetimeCountRef.current ?? 0;
          if (tier === "free" && !dismissed && lc >= 12) {
            // All inline styles — Tailwind classes get purged when assigned
            // via dynamic className strings, which was rendering this card
            // as raw unstyled text.
            const card = document.createElement("div");
            card.style.cssText = [
              "margin-top: 20px",
              "padding: 22px 24px",
              "border-radius: 14px",
              "border: 1px solid rgba(194, 65, 12, 0.4)",
              "background: linear-gradient(135deg, rgba(124, 45, 18, 0.32) 0%, rgba(24, 24, 27, 0.55) 100%)",
              "box-shadow: 0 8px 24px -8px rgba(124, 45, 18, 0.35)",
            ].join("; ");

            const title = document.createElement("div");
            title.style.cssText = [
              "font-size: 15px",
              "font-weight: 600",
              "color: #fed7aa",
              "margin-bottom: 6px",
              "letter-spacing: -0.005em",
            ].join("; ");
            title.textContent = "Want raise(fn) Team in the loop?";

            const body = document.createElement("div");
            body.style.cssText = [
              "font-size: 13px",
              "color: #d4d4d8",
              "line-height: 1.6",
              "margin-bottom: 16px",
            ].join("; ");
            body.innerHTML = `You've used raise(fn) for ${lc} messages now. The brain handles your prep and pipeline. Advisor adds the human side: warm intros to portfolio-fit investors, deck review by raise(fn) Team, and meeting prep when it counts.<br><br><strong style="color: #f4f4f5; font-weight: 600;">$999 one-time, lifetime access.</strong> 2% success fee on capital raised through raise(fn)-introduced investors. <a href="/legal/engagement" style="color: #fdba74; text-decoration: underline;">Full terms</a>.`;

            const buttonRow = document.createElement("div");
            buttonRow.style.cssText = "display: flex; gap: 10px; align-items: center;";

            const ctaBtn = document.createElement("button");
            ctaBtn.style.cssText = [
              "display: inline-flex",
              "align-items: center",
              "gap: 6px",
              "padding: 9px 18px",
              "border-radius: 8px",
              "border: none",
              "background: #ea580c",
              "color: #ffffff",
              "font-family: inherit",
              "font-size: 13px",
              "font-weight: 600",
              "cursor: pointer",
              "box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
              "transition: background-color 0.15s ease",
            ].join("; ");
            ctaBtn.textContent = "See Advisor →";
            ctaBtn.onmouseenter = () => { ctaBtn.style.background = "#c2410c"; };
            ctaBtn.onmouseleave = () => { ctaBtn.style.background = "#ea580c"; };

            const dismissBtn = document.createElement("button");
            dismissBtn.style.cssText = [
              "display: inline-flex",
              "align-items: center",
              "padding: 8px 16px",
              "border-radius: 8px",
              "border: 1px solid #3f3f46",
              "background: transparent",
              "color: #a1a1aa",
              "font-family: inherit",
              "font-size: 13px",
              "font-weight: 500",
              "cursor: pointer",
              "transition: border-color 0.15s ease, color 0.15s ease",
            ].join("; ");
            dismissBtn.textContent = "Not now";
            dismissBtn.onmouseenter = () => {
              dismissBtn.style.borderColor = "#52525b";
              dismissBtn.style.color = "#d4d4d8";
            };
            dismissBtn.onmouseleave = () => {
              dismissBtn.style.borderColor = "#3f3f46";
              dismissBtn.style.color = "#a1a1aa";
            };

            buttonRow.appendChild(ctaBtn);
            buttonRow.appendChild(dismissBtn);
            card.appendChild(title);
            card.appendChild(body);
            card.appendChild(buttonRow);
            contentEl.parentElement?.appendChild(card);

            ctaBtn.addEventListener("click", () => {
              try { localStorage.setItem("raisefn_upgrade_card_dismissed_v1", "1"); } catch { /* ignore */ }
              router.push("/pricing");
            });
            dismissBtn.addEventListener("click", () => {
              try { localStorage.setItem("raisefn_upgrade_card_dismissed_v1", "1"); } catch { /* ignore */ }
              card.style.opacity = "0";
              card.style.transition = "opacity 200ms";
              setTimeout(() => card.remove(), 200);
            });
          }
        } catch { /* defensive — card is best-effort */ }

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
            // Dynamic lead-in. The reason field is "monthly" for the new
            // 50/mo free cap; reset_label is server-formatted ("Jul 1").
            const reasonWord = lr.reason === "monthly" ? "this month" :
                               lr.reason === "daily" ? "today" :
                               lr.reason === "hourly" ? "this hour" : "";
            const capWord = lr.cap ? `${lr.cap} ` : "";
            const resetText = lr.reset_label && lr.reset_label !== "never"
              ? ` Resets ${lr.reset_label}.`
              : "";
            card.innerHTML = `
              <div class="upgrade-card-leadin">
                That's your ${capWord}free messages ${reasonWord}.${resetText} Want to keep going right now? Upgrade unlocks the rest:
              </div>
              <div class="upgrade-card-header">Ready to run a real raise?</div>
              <div class="upgrade-card-subhead">
                Advisor is a one-time purchase — lifetime product access, curated warm intros, and a 1hr advisory call.
              </div>

              <div class="upgrade-card-section">
                <div class="upgrade-card-section-label">Proprietary Network</div>
                <div class="upgrade-card-grid-item">
                  Investors who signed up to raise(fn) directly — not in any
                  public database. Curated warm intros only.
                </div>
              </div>

              <div class="upgrade-card-section">
                <div class="upgrade-card-section-label">Persistent Memory</div>
                <div class="upgrade-card-grid-item">
                  The brain remembers your entire raise across sessions — every
                  conversation, every investor decision, every comp.
                </div>
              </div>

              <div class="upgrade-card-section">
                <div class="upgrade-card-section-label">Unlimited Product + Intelligence</div>
                <div class="upgrade-card-grid">
                  <div class="upgrade-card-grid-item">Investor matching</div>
                  <div class="upgrade-card-grid-item">Outreach drafting</div>
                  <div class="upgrade-card-grid-item">Term sheet analysis</div>
                  <div class="upgrade-card-grid-item">Pitch positioning</div>
                  <div class="upgrade-card-grid-item">Signal reading</div>
                  <div class="upgrade-card-grid-item">Deck analysis</div>
                </div>
              </div>

              <div class="upgrade-card-section">
                <div class="upgrade-card-section-label">Pipeline CRM</div>
                <div class="upgrade-card-grid">
                  <div class="upgrade-card-grid-item">Auto-track conversations</div>
                  <div class="upgrade-card-grid-item">Meeting ingestion</div>
                  <div class="upgrade-card-grid-item">Instant pipeline recall</div>
                  <div class="upgrade-card-grid-item">Smarter every interaction</div>
                </div>
              </div>

              <div class="upgrade-card-cta-row">
                <button class="upgrade-card-btn" data-cta="advisor">
                  Get Advisor — $999 lifetime
                </button>
                <div class="upgrade-card-error" style="display:none"></div>
              </div>
              <div style="margin-top:14px;font-size:12px;color:#a1a1aa;line-height:1.5">
                Actively closing a raise and need the cap bumped this month?
                <a href="mailto:team@raisefn.com?subject=Cap%20bump%20request" style="color:#fb923c;text-decoration:underline">Email team@raisefn.com</a>.
              </div>
            `;
          } else {
            // Paid tier hit a soft cap — no upsell. Lifetime customers already
            // paid. Just acknowledge and offer direct contact if they need more.
            card.innerHTML = `
              <div class="upgrade-card-leadin">
                Heavy month — you've hit a monthly soft cap on Advisor usage. Your
                lifetime access continues; this is a temporary cost protection.
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

          // Wire the upgrade CTA → Stripe checkout (free user only).
          // Pricing v2 (2026-05-25): consent collected natively on Stripe's
          // Checkout page via consent_collection.terms_of_service, so we can
          // go straight from card → Stripe (no /pricing pitstop needed).
          //
          // Defense (mirrors /pricing): re-fetch session at click time
          // (state may be stale across long chat sessions), and handle 401
          // by routing to /signup with intent preserved instead of showing
          // the generic error.
          if (isFreeVerified) {
            const btn = card.querySelector(".upgrade-card-btn") as HTMLButtonElement | null;
            const errDiv = card.querySelector(".upgrade-card-error") as HTMLDivElement | null;
            const originalLabel = btn?.textContent || "";
            btn?.addEventListener("click", async () => {
              // Re-fetch the session in case the in-React-state token has
              // expired during a long chat (Supabase auto-refresh handles
              // this when possible).
              const { data: { session: freshSession } } = await supabase.auth.getSession();
              const token = freshSession?.access_token;
              if (!token) {
                try {
                  localStorage.setItem("pendingPostAuthIntent", "upgrade-advisor");
                } catch {
                  /* localStorage unavailable — fall through */
                }
                router.push("/signup?after=upgrade-advisor");
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
                  body: JSON.stringify({ tier: "advisor" }),
                });

                // Server rejected the token (expired between getSession +
                // fetch, session revoked). Same recovery path: preserve
                // intent + route to signup.
                if (res.status === 401) {
                  try {
                    localStorage.setItem("pendingPostAuthIntent", "upgrade-advisor");
                  } catch {
                    /* localStorage unavailable — fall through */
                  }
                  router.push("/signup?after=upgrade-advisor");
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
        showWelcomeTwoBubbles(
          firstName,
          buildWelcomeMessage(firstName),
          "Tell me about your raise. Drop your deck, paste an investor list, share your company URL — or just describe what you're building."
        );
      } else {
        showWelcomeWithMessage(firstName, buildWelcomeMessage(firstName));
      }
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
              msg.content && msg.content.trim() !== "" && msg.content !== "__init__"
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

          // Render previous messages
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
          }

          // Welcome back message — upgrade celebration or normal return
          const isCheckoutSuccess = new URLSearchParams(window.location.search).get("checkout") === "success";
          const welcomeBack = isCheckoutSuccess
            ? `${firstName}, hell yeah, let's do this. All tools unlocked. How can I help?`
            : `Welcome back, ${firstName}! Pick up where we left off, or where should we focus today?`;
          if (isCheckoutSuccess) window.history.replaceState({}, "", "/brain/deploy");
          const welcomeEl = addMessageToDOM("assistant", "");
          const welcomeContent = welcomeEl.querySelector(".content") as HTMLElement;
          if (welcomeContent) {
            welcomeContent.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
            requestAnimationFrame(() => scrollToBottom());
            setTimeout(() => {
              welcomeContent.innerHTML = formatMarkdown(welcomeBack);
              requestAnimationFrame(() => scrollToBottom());

              // Auto-retry the message that was blocked before upgrade
              if (isCheckoutSuccess) {
                try {
                  const retryMsg = sessionStorage.getItem("raisefn_retry_msg");
                  if (retryMsg) {
                    sessionStorage.removeItem("raisefn_retry_msg");
                    setTimeout(() => send(retryMsg), 1200);
                  }
                } catch {}
              }
            }, 800);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, loading]);

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

  return (
    <div className="brain-root">
      <style>{BRAIN_CSS}</style>

      {/* Checkout success banner */}
      {checkoutSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-teal-700/50 bg-teal-950/90 px-6 py-3 text-sm text-teal-300 shadow-lg backdrop-blur-sm">
          {"You're upgraded! All tools are now unlocked."}
        </div>
      )}

      {/* Unified product top bar — logo + tabs + account */}
      <BrainTabs />

      {/* Admin impersonation bar */}
      {isAdmin && (
        <div className="admin-bar">
          <div className="admin-bar-inner">
            <span className="admin-label">Acting as</span>
            {adminUsers.length > 0 ? (
              <select
                value={impersonating}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) switchClient(val);
                  else {
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
                className="admin-input"
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
                    {u.name || u.email} — {u.role}{u.campaign ? ` — ${u.campaign.company || "no company"}` : ""} ({u.events} events)
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  type="email"
                  value={impersonateInput}
                  onChange={(e) => setImpersonateInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") switchClient(impersonateInput.trim().toLowerCase());
                  }}
                  placeholder="client@email.com"
                  className="admin-input"
                />
                <button
                  onClick={() => switchClient(impersonateInput.trim().toLowerCase())}
                  disabled={!impersonateInput.trim()}
                  className="admin-btn"
                >
                  Switch
                </button>
              </>
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
                className="admin-clear"
              >
                Back to me
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="brain-main" ref={mainRef}>
        <canvas className="brain-canvas" ref={canvasRef} />

        <div className="messages-container" ref={messagesRef}>
          <div className="messages-inner" ref={messagesInnerRef} />
        </div>

        <div className="center-ui" ref={centerUiRef} style={{ opacity: sessionReady ? 1 : 0 }}>
          <div className="center-label">
            <span className="o">raise</span><span className="t">(fn)</span> brain
          </div>
          <div className="welcome-text">
            <h2>Tell me about your raise <span className="t">(or paste anything).</span></h2>
            <p>{impersonating ? `Acting as ${impersonating}` : "Deck, investor list, company URL, or just describe it."}</p>
          </div>
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
              placeholder="Ask the Brain..."
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

    </div>
  );
}
