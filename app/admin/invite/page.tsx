"use client";

import { useState } from "react";

interface InviteResult {
  success?: boolean;
  email?: string;
  role?: string;
  error?: string;
}

export default function AdminInvitePage() {
  const [secret, setSecret] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("rfn_admin_secret") || "" : ""
  );
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"founder" | "investor" | "builder">("founder");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [result, setResult] = useState<InviteResult | null>(null);
  const [history, setHistory] = useState<InviteResult[]>([]);

  function saveSecret(val: string) {
    setSecret(val);
    localStorage.setItem("rfn_admin_secret", val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!secret) return;

    setStatus("sending");
    setResult(null);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ email, name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setResult({ error: data.error || `Error ${res.status}` });
        return;
      }

      const entry = { success: true, email: data.email, role: data.role };
      setResult(entry);
      setHistory((prev) => [entry, ...prev]);
      setStatus("sent");
      setEmail("");
      setName("");
    } catch {
      setStatus("error");
      setResult({ error: "Network error" });
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-white">Invite User</h1>
          <p className="text-xs text-zinc-600 mt-1">Admin only — not linked from public site</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin secret (persisted in localStorage) */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Admin Secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => saveSecret(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors font-mono"
              placeholder="your-admin-secret"
            />
          </div>

          <hr className="border-zinc-800/50" />

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
              placeholder="founder@startup.com"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
              placeholder="Jane (optional)"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-2">Role</label>
            <div className="flex gap-2">
              {(["founder", "investor", "builder"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all capitalize ${
                    role === r
                      ? "border-teal-600 bg-teal-950/40 text-teal-300"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {status === "error" && result?.error && (
            <p className="text-sm text-red-400">{result.error}</p>
          )}

          {status === "sent" && result?.success && (
            <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-400">
              Invite sent to {result.email} ({result.role})
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending" || !secret}
            className="w-full rounded-full border border-orange-700/50 bg-orange-950/30 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Sending invite..." : "Send Invite"}
          </button>
        </form>

        {/* Invite history (session only) */}
        {history.length > 0 && (
          <div className="mt-8">
            <p className="text-xs text-zinc-600 mb-2">Sent this session</p>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2 text-xs"
                >
                  <span className="text-zinc-400">{h.email}</span>
                  <span className="text-zinc-600 capitalize">{h.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
