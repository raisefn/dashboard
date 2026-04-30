"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
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
  .message.assistant .content em { color: #71717a; }

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
  const [attachedFile, setAttachedFile] = useState<{ name: string; text: string } | null>(null);
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
  const send = useCallback(async (message: string, opts?: { silent?: boolean; displayMessage?: string }) => {
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
      contentEl.innerHTML = '<div class="status-msg">Searching brain intelligence...</div>';
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

      // Read SSE stream — show status messages live as they arrive
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "", buffer = "";

      while (true) {
        const { done, value } = await reader.read();
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
            }
          } catch { /* ignore parse errors */ }
        }
      }

      // Show response with typewriter effect
      if (fullText) {
        historyRef.current.push({ role: "assistant", content: fullText });

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

        // Render the upgrade card below the response when the cap was hit.
        if (limitReachedRef.current) {
          const lr = limitReachedRef.current;
          const card = document.createElement("div");
          card.className =
            "mt-4 rounded-lg border border-orange-700/40 bg-orange-950/20 p-4 text-sm text-zinc-200";
          const isFreeVerified = lr.tier === "free_verified";
          const heading = isFreeVerified ? "Ready to run a real raise?" : "Time for hands-on support?";
          const ctaLabel = isFreeVerified
            ? "Upgrade to Advisor — $200/mo"
            : "Contact us about Concierge";
          const capDetail = lr.cap ? `${lr.cap} messages a month` : "your monthly allotment";
          const description = isFreeVerified
            ? `You've used ${capDetail} on Launchpad. Advisor ($200/mo) gives you full access to every tool throughout your raise — investor matching, outreach drafting, deck analysis, pipeline tracking, the works.`
            : "Concierge brings hands-on support to your raise — pitch positioning, warm intros, meeting prep, term sheet review. Reach out and we'll set it up.";

          card.innerHTML = `
            <div class="font-semibold text-orange-200 mb-1">${heading}</div>
            <div class="text-zinc-400 mb-3 text-xs leading-relaxed">${description}</div>
            <button data-cta="${isFreeVerified ? "launchpad" : "concierge"}"
                    class="cta-btn inline-block rounded-full border border-orange-600/60 bg-orange-900/30 px-5 py-2 text-xs font-medium text-orange-200 transition-all hover:border-orange-500 hover:bg-orange-900/50 disabled:opacity-50">
              ${ctaLabel}
            </button>
            <div class="cta-error mt-2 text-xs text-red-400" style="display:none"></div>
          `;
          contentEl.appendChild(card);

          // Wire the CTA — Launchpad → Stripe checkout, Concierge → mailto.
          const btn = card.querySelector(".cta-btn") as HTMLButtonElement | null;
          const errDiv = card.querySelector(".cta-error") as HTMLDivElement | null;
          btn?.addEventListener("click", async () => {
            if (btn.dataset.cta === "concierge") {
              window.location.href = "mailto:team@raisefn.com?subject=Concierge%20inquiry";
              return;
            }
            // Launchpad → POST /api/stripe/checkout, redirect to session.url
            if (!session?.access_token) {
              if (errDiv) {
                errDiv.style.display = "block";
                errDiv.textContent = "Session expired — refresh and try again.";
              }
              return;
            }
            btn.disabled = true;
            btn.textContent = "Opening checkout…";
            try {
              const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ tier: "launchpad" }),
              });
              const data = await res.json();
              if (!res.ok || !data.url) {
                throw new Error(data.error || "Checkout failed");
              }
              window.location.href = data.url;
            } catch (e) {
              btn.disabled = false;
              btn.textContent = ctaLabel;
              if (errDiv) {
                errDiv.style.display = "block";
                errDiv.textContent =
                  "Couldn't start checkout — try again or email team@raisefn.com.";
              }
              console.error("Stripe checkout error:", e);
            }
          });

          limitReachedRef.current = null;
        }
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
      // Founder — two-bubble welcome (second bubble set in showWelcome).
      // Names the unlock concretely so the founder knows the bargain:
      // walk through discovery → tools + matching unlock.
      return (
        `Hey ${firstName}! Quick walk-through to get your profile set up. ` +
        `Once we wrap, all the AI tools unlock — investor matching, outreach drafting, ` +
        `deck analysis, term sheet review, pipeline tracking — and we start surfacing ` +
        `you to investors raising at your stage.`
      );
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
          "What problem are you solving? Any traction yet?"
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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
      setAttachedFile({ name: data.filename, text: data.text });
    } catch {
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function sendFromInput() {
    const userText = input.trim();
    if ((!userText && !attachedFile) || isStreaming) return;

    // Build display message (what the user sees) and brain message (what gets sent)
    let displayMsg = userText;
    let brainMsg = userText;

    if (attachedFile) {
      const instruction = userText || "Please analyze this document.";
      displayMsg = `📎 ${attachedFile.name}${userText ? "\n" + userText : ""}`;
      brainMsg = `[Attached file: ${attachedFile.name}]\n\n${attachedFile.text}\n\n${instruction}`;
      setAttachedFile(null);
    }

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "48px";
    send(brainMsg, { displayMessage: displayMsg });
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
  }

  async function handleManagePlan() {
    if (!session) return;
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Portal error:", err);
    }
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
          You're upgraded! All tools are now unlocked.
        </div>
      )}

      {/* Header */}
      <header>
        <nav>
          <a href="/" className="brain-logo" style={{ textDecoration: "none" }}>
            <span className="raise">raise</span>
            <span className="fn">(fn)</span>
          </a>
          <div className="nav-right">
            {userTier !== "free" ? (
              <button className="nav-link-btn" onClick={handleManagePlan}>Manage plan</button>
            ) : (
              <a href="/pricing" className="nav-link">Pricing</a>
            )}
            <span className="user-name">{displayName}</span>
            <div className="key-dot" />
            <button className="sign-out" onClick={handleSignOut}>Sign out</button>
          </div>
        </nav>
      </header>

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
            <h2>Ask a real question. <span className="t">Get a real answer.</span></h2>
            <p>{impersonating ? `Acting as ${impersonating}` : "You\u2019re inside the Brain."}</p>
          </div>
          <div className="starters">
            {STARTERS.map((s) => (
              <button key={s} className="starter" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
          <div className="input-bar">
            {attachedFile && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", fontSize: "12px", color: "#2dd4bf", background: "#18181b", borderRadius: "8px", marginBottom: "6px" }}>
                <span>📎 {attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: "14px", padding: "0 4px" }}>✕</button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask the Brain..."
              rows={1}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isStreaming}
              className="send-btn"
              style={{ opacity: 0.5, fontSize: "16px", minWidth: "auto", padding: "8px 10px" }}
              title="Upload a file (PDF, DOCX, TXT)"
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
