"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  .messages-container.active { display: flex; flex-direction: column; }
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
  const router = useRouter();

  // Auth
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
  const raiseIdRef = useRef<string | null>(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("raise_id")
      : null
  );
  const conversationIdRef = useRef<string | null>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

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
  const send = useCallback(async (message: string, opts?: { silent?: boolean }) => {
    if (isStreaming || !session) return;
    const silent = opts?.silent ?? false;

    // Transition to chat mode
    if (!chatStarted) {
      setChatStarted(true);
      centerUiRef.current?.classList.add("at-bottom");
      messagesRef.current?.classList.add("active");
    }

    // Add user message to DOM (skip if silent — auto-probe)
    if (!silent) addMessageToDOM("user", message);
    historyRef.current.push({ role: "user", content: message });

    // Add empty assistant message
    const assistantEl = addMessageToDOM("assistant", "");
    const contentEl = assistantEl.querySelector(".content") as HTMLElement;

    setIsStreaming(true);
    if (sendBtnRef.current) sendBtnRef.current.disabled = true;
    contentEl.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    brainStateRef.current = "thinking";
    activeColorRef.current = null;
    requestAnimationFrame(() => scrollToBottom());

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
        history: historyRef.current.slice(0, -1),
        ...(raiseIdRef.current && { raise_id: raiseIdRef.current }),
        ...(conversationIdRef.current && { conversation_id: conversationIdRef.current }),
      });

      let response = await fetch("/v1/brain/chat", { method: "POST", headers, body: reqBody });

      // Token expired — refresh and retry once
      if (response.status === 401) {
        const { data: { session: fresh } } = await supabase.auth.refreshSession();
        if (fresh) {
          setSession(fresh);
          headers.Authorization = `Bearer ${fresh.access_token}`;
          response = await fetch("/v1/brain/chat", { method: "POST", headers, body: reqBody });
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

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "", buffer = "";
      let hasScrolledToResponse = false;
      contentEl.innerHTML = "";

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
              contentEl.innerHTML = formatMarkdown(fullText);
              // On first text chunk, scroll to show the response
              if (!hasScrolledToResponse) {
                hasScrolledToResponse = true;
                requestAnimationFrame(() => scrollToElement(assistantEl));
              } else {
                // For subsequent chunks, only scroll down if user is near the bottom
                const m = messagesRef.current;
                if (m) {
                  const nearBottom = m.scrollHeight - m.scrollTop - m.clientHeight < 150;
                  if (nearBottom) scrollToBottom();
                }
              }
            } else if (event.type === "status") {
              activateNode(event.content);
              // Replace typing dots with status message
              contentEl.innerHTML = `<div class="status-msg">${event.content}</div>`;
              requestAnimationFrame(() => scrollToBottom());
            } else if (event.type === "error") {
              const errDiv = document.createElement("div");
              errDiv.className = "error-msg";
              errDiv.textContent = event.content;
              contentEl.appendChild(errDiv);
            } else if (event.type === "done") {
              if (event.raise_id) raiseIdRef.current = event.raise_id;
              if (event.conversation_id) conversationIdRef.current = event.conversation_id;
              brainStateRef.current = "idle";
              activeColorRef.current = null;
            }
          } catch { /* ignore parse errors */ }
        }
      }
      if (fullText) historyRef.current.push({ role: "assistant", content: fullText });
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

    function showWelcome(firstName: string) {
      setChatStarted(true);
      setSessionReady(true);
      centerUiRef.current?.classList.add("at-bottom");
      messagesRef.current?.classList.add("active");

      const role = (session?.user?.user_metadata?.role as string) || "founder";
      const company = session?.user?.user_metadata?.company as string | undefined;

      let welcome: string;
      if (role === "founder" && company) {
        welcome = `Hey ${firstName}! I see you're building ${company}. Tell me more — what stage are you at and how much are you looking to raise?`;
      } else if (role === "founder") {
        welcome = `Hey ${firstName}! Are you looking to raise? Tell me about the company and where you're at today.`;
      } else if (role === "investor" && company) {
        welcome = `Hey ${firstName}! Welcome to raise(fn). I'm here to help you track deals, evaluate companies, and stay on top of your pipeline. What are you working on?`;
      } else if (role === "investor") {
        welcome = `Hey ${firstName}! Are you currently deploying? What kinds of companies? Check size?\n\nI can help analyze deals, surface new companies, and track your deal flow. Just let me know how I can help.`;
      } else {
        welcome = `Hey ${firstName}! Welcome to raise(fn). What are we working on?`;
      }

      const typingEl = addMessageToDOM("assistant", "");
      const typingContent = typingEl.querySelector(".content") as HTMLElement;
      if (typingContent) {
        typingContent.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
        setTimeout(() => {
          typingContent.innerHTML = formatMarkdown(welcome);
        }, 800);
      }
    }

    const fallbackName = (session.user?.user_metadata?.name as string)?.split(" ")[0]
      || session.user?.email?.split("@")[0] || "";

    fetch("/v1/brain/session", { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        // Session endpoint unavailable or errored — show normal welcome
        if (!data) {
          showWelcome(fallbackName);
          return;
        }

        // Store profile name
        if (data.name) setProfileName(data.name);

        const firstName = data.name?.split(" ")[0] || fallbackName;

        // If there's an existing conversation, restore it
        if (data.conversation && data.conversation.message_count > 0) {
          setChatStarted(true);
          setSessionReady(true);
          centerUiRef.current?.classList.add("at-bottom");
          messagesRef.current?.classList.add("active");

          conversationIdRef.current = data.conversation.id;
          if (data.conversation.campaign_id) {
            raiseIdRef.current = data.conversation.campaign_id;
          }

          // Render previous messages
          for (const msg of data.conversation.messages) {
            addMessageToDOM(msg.role, msg.content);
            historyRef.current.push({ role: msg.role, content: msg.content });
          }

          // Add a welcome-back message with typing dots
          const welcomeBack = `Welcome back, ${firstName}! I remember where we left off. What would you like to work on?`;
          const welcomeEl = addMessageToDOM("assistant", "");
          const welcomeContent = welcomeEl.querySelector(".content") as HTMLElement;
          if (welcomeContent) {
            welcomeContent.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
            requestAnimationFrame(() => scrollToBottom());
            setTimeout(() => {
              welcomeContent.innerHTML = formatMarkdown(welcomeBack);
              requestAnimationFrame(() => scrollToBottom());
            }, 800);
          }
          return;
        }

        // No previous conversation — show first-time welcome
        showWelcome(firstName);
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
    scrollToBottom();
    return div;
  }

  function scrollToBottom() {
    const m = messagesRef.current;
    if (m) m.scrollTop = m.scrollHeight;
  }

  function scrollToElement(el: HTMLElement) {
    const m = messagesRef.current;
    if (m) {
      const containerRect = m.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = elRect.top - containerRect.top + m.scrollTop - 20;
      m.scrollTo({ top: offset, behavior: "smooth" });
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

  function sendFromInput() {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "48px";
    send(msg);
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

      {/* Header */}
      <header>
        <nav>
          <div className="brain-logo">
            <span className="raise">raise</span>
            <span className="fn">(fn)</span>
          </div>
          <div className="nav-right">
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
                {adminUsers.map((u) => (
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
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask the Brain..."
              rows={1}
            />
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
