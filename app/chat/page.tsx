"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || "https://brain-production.up.railway.app";
const ADMIN_EMAILS = ["justinpetsche@gmail.com"];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "Who should I pitch?",
  "Am I ready to raise?",
  "Are these terms fair?",
  "How should I position this?",
];

export default function ChatPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [raiseId, setRaiseId] = useState<string | null>(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("raise_id")
      : null
  );

  // Impersonation (admin only)
  const [impersonating, setImpersonating] = useState("");
  const [impersonateInput, setImpersonateInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatStarted = messages.length > 0;

  const isAdmin = session?.user?.email
    ? ADMIN_EMAILS.includes(session.user.email)
    : false;

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) {
        router.replace("/login");
        return;
      }
      setSession(s);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!s) router.replace("/login");
      else setSession(s);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const send = useCallback(
    async (message: string) => {
      if (isStreaming || !session) return;

      const userMsg: Message = { role: "user", content: message };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsStreaming(true);
      setStreamingContent("");
      setStatusMsg("");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };

      // Add impersonation header if active
      if (impersonating) {
        headers["X-Impersonate"] = impersonating;
      }

      try {
        const response = await fetch(`${BRAIN_URL}/v1/brain/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
            ...(raiseId && { raise_id: raiseId }),
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `Error ${response.status}: ${err}` },
          ]);
          setIsStreaming(false);
          return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

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
                setStreamingContent(fullText);
              } else if (event.type === "status") {
                setStatusMsg(event.content);
              } else if (event.type === "done") {
                if (event.raise_id) setRaiseId(event.raise_id);
                setStatusMsg("");
              }
            } catch {
              // ignore parse errors
            }
          }
        }

        if (fullText) {
          setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
        }
        setStreamingContent("");
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Connection error: ${e instanceof Error ? e.message : "Unknown error"}`,
          },
        ]);
      }

      setIsStreaming(false);
      setStatusMsg("");
      textareaRef.current?.focus();
    },
    [isStreaming, session, messages, raiseId, impersonating]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const msg = input.trim();
      if (msg) send(msg);
    }
  }

  function switchClient(email: string) {
    setImpersonating(email);
    setImpersonateInput(email);
    // Clear conversation when switching clients
    setMessages([]);
    setRaiseId(null);
    setStreamingContent("");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    );
  }

  const userName = session?.user?.user_metadata?.name || session?.user?.email?.split("@")[0] || "";
  const displayName = impersonating
    ? `${impersonating} (via ${userName})`
    : userName;

  return (
    <>
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <a href="/" className="text-lg font-bold">
              <span className="text-orange-500">raise</span>
              <span className="text-teal-400">(fn)</span>
            </a>
            <span className="text-xs text-zinc-600">brain</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">{displayName}</span>
            <button
              onClick={handleSignOut}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>

      {/* Admin impersonation bar */}
      {isAdmin && (
        <div className="shrink-0 border-b border-orange-900/30 bg-orange-950/10 px-4 py-2">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600">
              Acting as
            </span>
            <input
              type="email"
              value={impersonateInput}
              onChange={(e) => setImpersonateInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") switchClient(impersonateInput.trim().toLowerCase());
              }}
              placeholder="client@email.com"
              className="flex-1 max-w-xs rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-700 transition-colors"
            />
            <button
              onClick={() => switchClient(impersonateInput.trim().toLowerCase())}
              disabled={!impersonateInput.trim()}
              className="rounded-md bg-orange-900/30 border border-orange-800/50 px-3 py-1 text-[11px] font-medium text-orange-300 hover:bg-orange-900/50 disabled:opacity-40 transition-colors"
            >
              Switch
            </button>
            {impersonating && (
              <button
                onClick={() => {
                  setImpersonating("");
                  setImpersonateInput("");
                  setMessages([]);
                  setRaiseId(null);
                }}
                className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Back to me
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!chatStarted ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600 mb-5">
              <span className="text-orange-500">raise</span>
              <span className="text-teal-400">(fn)</span> brain
            </p>
            <h2 className="text-xl font-bold text-zinc-200 mb-1.5">
              Ask a real question.{" "}
              <span className="text-teal-400">Get a real answer.</span>
            </h2>
            <p className="text-xs text-zinc-600 mb-6">
              {impersonating
                ? `Acting as ${impersonating}`
                : "You\u2019re inside the Brain."}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mb-8">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-5 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${
                  msg.role === "user"
                    ? "ml-auto max-w-[55%] rounded-2xl rounded-br-sm border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-zinc-300"
                    : "max-w-[65%] text-zinc-400"
                } text-sm leading-relaxed whitespace-pre-wrap`}
              >
                {msg.content}
              </div>
            ))}

            {/* Streaming response */}
            {isStreaming && (
              <>
                {statusMsg && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                    {statusMsg}
                  </div>
                )}
                {streamingContent ? (
                  <div className="max-w-[65%] text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap">
                    {streamingContent}
                  </div>
                ) : (
                  <div className="flex gap-1 py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:300ms]" />
                  </div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-zinc-800/50 bg-zinc-950/90 px-4 py-3">
        <div className="mx-auto flex max-w-3xl gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the Brain..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-700 transition-colors"
          />
          <button
            onClick={() => {
              const msg = input.trim();
              if (msg) send(msg);
            }}
            disabled={isStreaming || !input.trim()}
            className="shrink-0 rounded-full bg-orange-600 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition-all hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
