"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "@/context/auth";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/tracker");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const supabase = getSupabaseBrowser();

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      if (mode === "signup") {
        setStatus("idle");
        setErrorMsg("");
        // Show confirmation message
        setMode("signin");
        setErrorMsg("Account created — check your email to confirm, then sign in.");
        setStatus("idle");
      } else {
        router.replace("/tracker");
      }
    }
  }

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold mb-1">
            <span className="text-orange-500">raise</span>
            <span className="text-teal-400">(fn)</span>
          </div>
          <p className="text-sm text-zinc-500">
            {mode === "signin" ? "Sign in to access the Tracker" : "Create your free account"}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs text-zinc-500 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs text-zinc-500 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <p className={`text-sm ${errorMsg.includes("check your email") ? "text-teal-400" : "text-red-400"}`}>
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-full bg-teal-700 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "submitting"
                ? "..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setErrorMsg("");
                setStatus("idle");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {mode === "signin"
                ? "No account? Sign up free"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
