"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center"><p className="text-zinc-400 text-sm">Loading...</p></div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const authError = searchParams.get("error");

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    router.replace("/brain/deploy");
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("sent");
  }

  // Google OAuth — mirrors app/signup/page.tsx handleGoogle exactly.
  // Users who signed up with Google can sign back in with Google. Before
  // this (added 2026-07-02), the only way back in was magic link, because
  // no OAuth button existed on the login page. Same signInWithOAuth call
  // as signup, same redirect flow, same offline+consent params.
  async function handleGoogle() {
    setStatus("sending");
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    }
    // On success: browser redirects to Google → /auth/callback → /brain/deploy.
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            <span className="text-orange-500">raise</span>
            <span className="text-teal-400">(fn)</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-2">Sign in to access raise(fn)</p>
        </div>

        {authError && (
          <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            Authentication failed. Please try again.
          </div>
        )}

        {status === "sent" ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <h2 className="text-lg font-semibold text-white mb-2">Check your email</h2>
            <p className="text-sm text-zinc-400">
              We sent a sign-in link to{" "}
              <span className="text-zinc-200">{email}</span>.
              Click it to continue.
            </p>
          </div>
        ) : (
          <>
            {/* Google OAuth — shown above both password + magic-link modes.
                Mirrors signup page. Founders who signed up with Google
                can sign back in with Google. */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-3 rounded-full border border-zinc-700 bg-zinc-900 py-3 text-sm font-medium text-zinc-100 transition-all hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs text-zinc-600 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {mode === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
                placeholder="you@company.com"
                autoFocus
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
                placeholder="Your password"
              />
            </div>

            {status === "error" && errorMsg && (
              <p className="text-sm text-red-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-full border border-teal-700/50 bg-teal-950/30 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "Signing in..." : "Sign in"}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => { setMode("magic"); setStatus("idle"); setErrorMsg(""); }}
                className="text-zinc-600 hover:text-zinc-400 transition-colors py-1"
              >
                Use magic link instead
              </button>
              <a
                href="/forgot-password"
                className="text-zinc-600 hover:text-zinc-400 transition-colors py-1"
              >
                Forgot password?
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email-magic" className="block text-xs text-zinc-500 mb-1.5">
                Email
              </label>
              <input
                id="email-magic"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
                placeholder="you@company.com"
                autoFocus
              />
            </div>

            {status === "error" && errorMsg && (
              <p className="text-sm text-red-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-full border border-teal-700/50 bg-teal-950/30 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "Sending..." : "Send magic link"}
            </button>

            <button
              type="button"
              onClick={() => { setMode("password"); setStatus("idle"); setErrorMsg(""); }}
              className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-1"
            >
              Use password instead
            </button>
          </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
