"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

/**
 * Forgot-password flow — Step 1: request reset email.
 *
 * Supabase sends an email with a recovery link. Link target:
 *   {origin}/auth/callback?token_hash=...&type=recovery
 *
 * /auth/callback already exists and handles signup/email verification.
 * It needs to be extended to handle type=recovery by routing the user
 * to /reset-password after verifying the OTP. That extension + the
 * /reset-password page complete this flow.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      }
    );

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Check your email</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            If an account exists for{" "}
            <span className="text-zinc-200">{email}</span>, we&apos;ve sent a
            password reset link. Click it to set a new password.
          </p>
          <p className="text-xs text-zinc-600 mt-4">
            Didn&apos;t get it? Check your spam folder, or try again.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Enter the email you signed up with — we&apos;ll send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fp-email" className="block text-xs text-zinc-500 mb-1.5">
              Email
            </label>
            <input
              id="fp-email"
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
            disabled={status === "sending" || !email.trim()}
            className="w-full rounded-full border border-teal-700/50 bg-teal-950/30 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Sending..." : "Send reset link"}
          </button>

          <p className="text-center text-xs text-zinc-600">
            Remembered it?{" "}
            <Link href="/login" className="text-teal-400 hover:text-teal-300">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
