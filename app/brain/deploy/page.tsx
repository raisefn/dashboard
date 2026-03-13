"use client";

import { useEffect, useRef, useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BRAIN_URL =
  process.env.NEXT_PUBLIC_BRAIN_URL ||
  "https://brain-production.up.railway.app";

const ADMIN_EMAILS = ["justinpetsche@gmail.com"];

const STARTER_PROMPTS = [
  "Who are the best seed investors for a dev-tools company?",
  "Help me qualify my raise — Series A, $8M target.",
  "What signals should I look for before reaching out to a VC?",
  "Analyze my fundraising narrative.",
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  role: "user" | "assistant" | "status";
  content: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  g: number;
  b: number;
  baseR: number;
  baseG: number;
  baseB: number;
  radius: number;
  speed: number;
}

type CanvasState = "idle" | "thinking" | "active";

/* ------------------------------------------------------------------ */
/*  Tool → color mapping                                               */
/* ------------------------------------------------------------------ */

const TOOL_COLORS: Record<string, { r: number; g: number; b: number }> = {
  "match investors": { r: 45, g: 212, b: 191 },
  "match_investors": { r: 45, g: 212, b: 191 },
  "qualify raise": { r: 52, g: 211, b: 153 },
  "qualify_raise": { r: 52, g: 211, b: 153 },
  "analyze narrative": { r: 249, g: 115, b: 22 },
  "analyze_narrative": { r: 249, g: 115, b: 22 },
  "read signal": { r: 249, g: 115, b: 22 },
  "read_signal": { r: 249, g: 115, b: 22 },
  "plan outreach": { r: 249, g: 115, b: 22 },
  "plan_outreach": { r: 249, g: 115, b: 22 },
  "analyze terms": { r: 167, g: 139, b: 250 },
  "analyze_terms": { r: 167, g: 139, b: 250 },
};

const BRAND_COLORS = [
  { r: 45, g: 212, b: 191 }, // teal
  { r: 249, g: 115, b: 22 }, // orange
  { r: 52, g: 211, b: 153 }, // emerald
  { r: 167, g: 139, b: 250 }, // violet
  { r: 161, g: 161, b: 170 }, // zinc-400
];

/* ------------------------------------------------------------------ */
/*  Markdown renderer                                                  */
/* ------------------------------------------------------------------ */

function renderMarkdown(text: string): string {
  let html = text;

  // Escape HTML entities (but preserve our own tags later)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (``` ... ```)
  html = html.replace(
    /```(\w*)\n?([\s\S]*?)```/g,
    (_match, _lang, code) =>
      `<pre class="bg-zinc-900 border border-zinc-800 rounded-lg p-4 my-3 overflow-x-auto text-sm font-mono text-zinc-300"><code>${code.trim()}</code></pre>`
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-teal-300">$1</code>'
  );

  // Headings
  html = html.replace(
    /^#### (.+)$/gm,
    '<h4 class="text-base font-semibold text-zinc-100 mt-4 mb-1">$1</h4>'
  );
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="text-lg font-semibold text-zinc-100 mt-5 mb-2">$1</h3>'
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-xl font-bold text-zinc-100 mt-6 mb-2">$1</h2>'
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="text-2xl font-bold text-zinc-100 mt-6 mb-3">$1</h1>'
  );

  // Horizontal rules
  html = html.replace(
    /^---$/gm,
    '<hr class="border-zinc-800 my-4" />'
  );

  // Bold + italic
  html = html.replace(
    /\*\*\*(.+?)\*\*\*/g,
    '<strong class="font-bold text-zinc-100"><em>$1</em></strong>'
  );
  // Bold
  html = html.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="font-bold text-zinc-100">$1</strong>'
  );
  // Italic
  html = html.replace(
    /\*(.+?)\*/g,
    '<em class="italic text-zinc-300">$1</em>'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline underline-offset-2">$1</a>'
  );

  // Unordered lists
  html = html.replace(/^[\t ]*[-*] (.+)$/gm, (_, content) => {
    return `<li class="ml-4 list-disc text-zinc-300">${content}</li>`;
  });
  // Wrap consecutive <li> in <ul>
  html = html.replace(
    /(<li[^>]*>[^]*?<\/li>\n?)+/g,
    (match) => `<ul class="my-2 space-y-1">${match}</ul>`
  );

  // Ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, (_, _num, content) => {
    return `<oli class="ml-4 list-decimal text-zinc-300">${content}</oli>`;
  });
  html = html.replace(
    /(<oli[^>]*>[^]*?<\/oli>\n?)+/g,
    (match) => {
      const fixed = match.replace(/oli/g, "li");
      return `<ol class="my-2 space-y-1 list-decimal">${fixed}</ol>`;
    }
  );

  // Paragraphs: wrap lines that aren't already in a block element
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<li")
      ) {
        return trimmed;
      }
      return `<p class="text-zinc-300 leading-relaxed my-2">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}

/* ------------------------------------------------------------------ */
/*  Particle system                                                    */
/* ------------------------------------------------------------------ */

function createParticles(count: number, w: number, h: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
    const speed = 0.15 + Math.random() * 0.35;
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      r: color.r,
      g: color.g,
      b: color.b,
      baseR: color.r,
      baseG: color.g,
      baseB: color.b,
      radius: 1.5 + Math.random() * 1.5,
      speed,
    });
  }
  return particles;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BrainDeployPage() {
  const router = useRouter();

  /* Auth state */
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  /* Admin impersonation */
  const [isAdmin, setIsAdmin] = useState(false);
  const [impersonateEmail, setImpersonateEmail] = useState("");
  const [impersonating, setImpersonating] = useState(false);

  /* Chat state */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [started, setStarted] = useState(false);

  /* Canvas state */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const canvasStateRef = useRef<CanvasState>("idle");
  const activeToolColorRef = useRef<{ r: number; g: number; b: number } | null>(null);
  const animFrameRef = useRef<number>(0);

  /* Refs */
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Auth                                                             */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) {
        router.replace("/login");
        return;
      }
      setSession(s);
      setIsAdmin(ADMIN_EMAILS.includes(s.user.email ?? ""));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) router.replace("/login");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  /* ---------------------------------------------------------------- */
  /*  Particle canvas animation                                        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0) {
        particlesRef.current = createParticles(80, canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const CONNECTION_DIST = 150;

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const state = canvasStateRef.current;
      const toolColor = activeToolColorRef.current;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const particles = particlesRef.current;

      for (const p of particles) {
        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        // Pull toward center when thinking/active
        if (state === "thinking" || state === "active") {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = state === "active" ? 0.008 : 0.004;
          p.vx += (dx / dist) * pull;
          p.vy += (dy / dist) * pull;
          // Dampen
          p.vx *= 0.995;
          p.vy *= 0.995;
        } else {
          // Return to base drift
          const targetVx = (Math.random() - 0.5) * p.speed;
          const targetVy = (Math.random() - 0.5) * p.speed;
          p.vx += (targetVx - p.vx) * 0.01;
          p.vy += (targetVy - p.vy) * 0.01;
        }

        // Color blending
        if (toolColor && (state === "thinking" || state === "active")) {
          const blend = 0.04;
          p.r += (toolColor.r - p.r) * blend;
          p.g += (toolColor.g - p.g) * blend;
          p.b += (toolColor.b - p.b) * blend;
        } else {
          const blend = 0.02;
          p.r += (p.baseR - p.r) * blend;
          p.g += (p.baseG - p.g) * blend;
          p.b += (p.baseB - p.b) * blend;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(p.r)},${Math.round(p.g)},${Math.round(p.b)},0.7)`;
        ctx.fill();
      }

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.2;
            const mr = Math.round((a.r + b.r) / 2);
            const mg = Math.round((a.g + b.g) / 2);
            const mb = Math.round((a.b + b.b) / 2);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${mr},${mg},${mb},${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [loading]);

  /* ---------------------------------------------------------------- */
  /*  Auto-scroll                                                      */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------------------------------------------------------- */
  /*  Send message                                                     */
  /* ---------------------------------------------------------------- */

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !session) return;

      if (!started) setStarted(true);

      const userMsg: ChatMessage = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setStreaming(true);

      canvasStateRef.current = "thinking";
      activeToolColorRef.current = BRAND_COLORS[0]; // default teal

      // Build history for the API
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        };
        if (impersonating && impersonateEmail) {
          headers["X-Impersonate"] = impersonateEmail;
        }

        const res = await fetch(`${BRAIN_URL}/v1/brain/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: text.trim(),
            history,
            raise_id: null,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorText = await res.text().catch(() => "Unknown error");
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `Error: ${res.status} — ${errorText}` },
          ]);
          setStreaming(false);
          canvasStateRef.current = "idle";
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let assistantContent = "";
        let buffer = "";

        // Add an empty assistant message we will stream into
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const evt = JSON.parse(payload);

              if (evt.type === "text" || evt.event === "text") {
                const chunk = evt.data ?? evt.content ?? "";
                assistantContent += chunk;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: assistantContent,
                    };
                  }
                  return updated;
                });
                canvasStateRef.current = "active";
              } else if (evt.type === "status" || evt.event === "status") {
                const statusText = evt.data ?? evt.content ?? "";
                // Detect tool from status text and set canvas color
                const lower = statusText.toLowerCase();
                for (const [key, color] of Object.entries(TOOL_COLORS)) {
                  if (lower.includes(key.replace("_", " "))) {
                    activeToolColorRef.current = color;
                    break;
                  }
                }
                canvasStateRef.current = "thinking";
                // Insert status before the assistant message
                setMessages((prev) => {
                  const updated = [...prev];
                  // Find last assistant message index
                  const lastAssistIdx = updated.length - 1;
                  if (
                    lastAssistIdx >= 0 &&
                    updated[lastAssistIdx].role === "assistant"
                  ) {
                    updated.splice(lastAssistIdx, 0, {
                      role: "status",
                      content: statusText,
                    });
                  }
                  return updated;
                });
              } else if (evt.type === "error" || evt.event === "error") {
                const errorContent = evt.data ?? evt.content ?? "Unknown error";
                assistantContent += `\n\nError: ${errorContent}`;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: assistantContent,
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // Non-JSON line, skip
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // User cancelled
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Connection error: ${err instanceof Error ? err.message : "Unknown error"}`,
            },
          ]);
        }
      } finally {
        setStreaming(false);
        canvasStateRef.current = "idle";
        activeToolColorRef.current = null;
        abortRef.current = null;
      }
    },
    [session, messages, started, impersonating, impersonateEmail]
  );

  /* ---------------------------------------------------------------- */
  /*  Auto-probe on first visit                                        */
  /* ---------------------------------------------------------------- */

  const hasAutoProbed = useRef(false);

  useEffect(() => {
    if (!session || loading || hasAutoProbed.current || messages.length > 0 || streaming) return;
    hasAutoProbed.current = true;

    const role = (session.user?.user_metadata?.role as string) || "founder";
    const name = (session.user?.user_metadata?.name as string) || session.user?.email?.split("@")[0] || "";

    const ROLE_INTROS: Record<string, string> = {
      founder: `Hi, I'm ${name}. I'm a founder — just got access.`,
      investor: `Hi, I'm ${name}. I'm an investor — just got access.`,
      builder: `Hi, I'm ${name}. I'm a builder — just got access.`,
    };

    const intro = ROLE_INTROS[role] || ROLE_INTROS.founder;
    sendMessage(intro);
  }, [session, loading, messages.length, streaming, sendMessage]);

  /* ---------------------------------------------------------------- */
  /*  Handle submit                                                    */
  /* ---------------------------------------------------------------- */

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Sign out                                                         */
  /* ---------------------------------------------------------------- */

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  /* ---------------------------------------------------------------- */
  /*  Loading / unauthenticated                                        */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-zinc-500">
        <div className="animate-pulse text-sm tracking-wide">Loading…</div>
      </div>
    );
  }

  if (!session) return null;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  const userName =
    session.user.user_metadata?.full_name ??
    session.user.email?.split("@")[0] ??
    "User";

  return (
    <div className="relative flex flex-col h-full w-full bg-zinc-950 text-zinc-100">
      {/* Neural particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm"
        style={{ minHeight: 56 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-zinc-100">
            raise<span className="text-teal-400">(</span>fn
            <span className="text-teal-400">)</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{userName}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Admin impersonation bar */}
      {isAdmin && (
        <div className="relative z-10 flex items-center gap-3 px-5 py-2 bg-zinc-900/80 border-b border-zinc-800/40 backdrop-blur-sm">
          <span className="text-xs font-medium text-orange-400 tracking-wide uppercase">
            Acting as
          </span>
          <input
            type="email"
            value={impersonateEmail}
            onChange={(e) => setImpersonateEmail(e.target.value)}
            placeholder="client@example.com"
            className="flex-1 max-w-xs px-3 py-1.5 text-sm bg-zinc-800/80 border border-zinc-700 rounded-md text-zinc-200 placeholder-zinc-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
          />
          {impersonating ? (
            <button
              onClick={() => {
                setImpersonating(false);
                setImpersonateEmail("");
              }}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-md hover:text-zinc-200 hover:border-zinc-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
          ) : (
            <button
              onClick={() => {
                if (impersonateEmail.trim()) setImpersonating(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-md hover:bg-orange-500/20 transition-colors cursor-pointer disabled:opacity-40"
              disabled={!impersonateEmail.trim()}
            >
              Switch
            </button>
          )}
          {impersonating && (
            <span className="text-xs text-zinc-500">
              Impersonating{" "}
              <span className="text-orange-300">{impersonateEmail}</span>
            </span>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Welcome / centered state */}
        {!started && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 animate-in fade-in duration-500">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-teal-400 bg-teal-400/10 border border-teal-400/20 rounded-full">
                raise(fn) brain
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 text-center mb-3 tracking-tight">
              Ask a real question.
              <br />
              Get a real answer.
            </h1>
            <p className="text-zinc-500 text-center mb-10 max-w-md text-sm">
              Your AI fundraising analyst — powered by live investor data,
              market signals, and fundraising intelligence.
            </p>

            {/* Starter buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full mb-8">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left px-4 py-3 text-sm text-zinc-400 bg-zinc-900/60 border border-zinc-800/60 rounded-xl hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input bar (centered) */}
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-2xl"
            >
              <div className="flex items-end gap-2 bg-zinc-900/70 border border-zinc-800/60 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the brain anything…"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none resize-none max-h-32"
                  style={{ minHeight: 24 }}
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  className="shrink-0 p-2 rounded-lg bg-teal-500 text-white hover:bg-teal-400 disabled:opacity-30 disabled:hover:bg-teal-500 transition-colors cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Chat state */}
        {started && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-0 py-6">
              <div className="max-w-2xl mx-auto space-y-4">
                {messages.map((msg, i) => {
                  if (msg.role === "status") {
                    return (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                        </span>
                        <span className="text-xs text-zinc-500 italic">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  if (msg.role === "user") {
                    return (
                      <div key={i} className="flex justify-end">
                        <div className="max-w-[80%] px-4 py-2.5 text-sm text-zinc-200 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl rounded-br-md">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  // Assistant message
                  return (
                    <div key={i} className="flex justify-start">
                      <div className="max-w-[85%]">
                        {msg.content ? (
                          <div
                            className="prose-brain text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(msg.content),
                            }}
                          />
                        ) : (
                          /* Typing indicator */
                          <div className="flex items-center gap-1 py-3 px-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom input bar */}
            <div className="border-t border-zinc-800/40 bg-zinc-950/80 backdrop-blur-sm px-4 py-3">
              <form
                onSubmit={handleSubmit}
                className="max-w-2xl mx-auto"
              >
                <div className="flex items-end gap-2 bg-zinc-900/70 border border-zinc-800/60 rounded-2xl px-4 py-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the brain anything…"
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none resize-none max-h-32"
                    style={{ minHeight: 24 }}
                  />
                  <button
                    type="submit"
                    disabled={streaming || !input.trim()}
                    className="shrink-0 p-2 rounded-lg bg-teal-500 text-white hover:bg-teal-400 disabled:opacity-30 disabled:hover:bg-teal-500 transition-colors cursor-pointer"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
