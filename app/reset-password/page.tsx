"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

/**
 * Forgot-password flow — Step 2: set new password.
 *
 * Reached from /auth/callback when type=recovery was verified. At this
 * point Supabase has set a session for the user; calling updateUser({
 * password }) sets the new password against that session, no further
 * verification needed.
 *
 * If the user navigates here directly without a session (e.g. bookmark
 * or stale tab), we redirect them to /forgot-password to restart.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setHasSession(!!data.session);
    }
    check();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setStatus("error");
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setErrorMsg("Passwords don't match.");
      return;
    }

    setStatus("saving");
    setErrorMsg("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("saved");
    // Brief pause for the user to register the success state, then land
    // them in the brain.
    setTimeout(() => router.replace("/brain/deploy"), 1200);
  }

  // No active session — recovery link wasn't followed correctly, or
  // it's expired. Send them back to start a fresh reset.
  if (hasSession === false) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Reset link expired</h2>
          <p className="text-sm text-zinc-400 mb-6">
            This password reset session has expired or wasn&apos;t opened
            from a valid recovery link.
          </p>
          <Link
            href="/forgot-password"
            className="rounded-full border border-teal-700/50 bg-teal-950/30 px-6 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 inline-block"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (hasSession === null) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <p className="text-sm text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Password updated</h2>
          <p className="text-sm text-zinc-400">
            Signing you in…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Set a new password</h1>
          <p className="text-sm text-zinc-500 mt-2">
            At least 8 characters. You&apos;ll be signed in after.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rp-password" className="block text-xs text-zinc-500 mb-1.5">
              New password
            </label>
            <input
              id="rp-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
              placeholder="At least 8 characters"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="rp-confirm" className="block text-xs text-zinc-500 mb-1.5">
              Confirm password
            </label>
            <input
              id="rp-confirm"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors"
              placeholder="Confirm your password"
            />
          </div>

          {status === "error" && errorMsg && (
            <p className="text-sm text-red-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "saving" || password.length < 8}
            className="w-full rounded-full border border-teal-700/50 bg-teal-950/30 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "saving" ? "Saving…" : "Set new password & continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
