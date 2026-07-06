"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// /raise-fund/join — investor signup form (parity with /signup/founder).
//
// Chat-first principle: fund/deal/LP discovery happens in the agent
// conversation, NOT in a pre-signup form. This form captures the bare
// minimum (name + email + password) — same shape as the founder form.
//
// Phase 2 note: the investor-side brain surface isn't shipped yet, so
// post-signup we land on a "you're on the list" waitlist screen and
// Slack-ping Justin. When Phase 2 goes live, the confirmation screen
// gets swapped to route directly into /raise-fund/deploy (the investor
// chat). Same signup form, no form redesign needed at that point.
export default function RaiseFundJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center px-4">
          <p className="text-sm text-zinc-500">Loading…</p>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();

  // Capture post-auth intent for parity with the founder form.
  useEffect(() => {
    const after = searchParams.get("after");
    if (after) {
      try {
        localStorage.setItem("pendingPostAuthIntent", after);
      } catch {
        // localStorage may be disabled — intent is best-effort.
      }
    }
  }, [searchParams]);

  const [status, setStatus] = useState<
    "idle" | "sending" | "waitlisted" | "oauth_redirecting" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const inputClass =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors";

  function canSubmit() {
    if (!name.trim() || !email.trim()) return false;
    if (password.length < 6) return false;
    if (!agreedToTerms) return false;
    if (TURNSTILE_SITE_KEY && !turnstileToken) return false;
    return true;
  }

  // Google OAuth path — same as /signup/founder, but stashes an
  // "investor" role hint in localStorage before redirect. The
  // /auth/callback route reads that hint after Supabase establishes
  // the session and calls updateUser({data: {role: "investor"}}).
  // Google itself can't carry role metadata through the OAuth flow.
  async function handleGoogle() {
    setStatus("oauth_redirecting");
    setErrorMsg("");
    try {
      localStorage.setItem("pendingSignupRole", "investor");
    } catch {
      // localStorage may be disabled — fall back to founder default
      // routing. Better UX would be to error, but this is very rare
      // and worth degrading gracefully.
    }
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
      try { localStorage.removeItem("pendingSignupRole"); } catch { /* ignore */ }
    }
    // On success: browser redirects to Google → /auth/callback → role
    // set + destinationForCurrentSession routes to /raise-fund.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit()) return;
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    // Turnstile check before Supabase.
    if (TURNSTILE_SITE_KEY && turnstileToken) {
      const verifyRes = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setStatus("error");
        setErrorMsg("Verification failed. Please try again.");
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }
    }

    // Create Supabase account with role=investor. Post-Phase-2 the auth
    // callback will route this role into /raise-fund/deploy; today it
    // still lands in /brain/deploy, but we intercept below and show the
    // waitlist screen instead.
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          role: "investor",
        },
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      return;
    }

    // Slack ping so Justin knows someone's on the list.
    fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "investor",
      }),
    }).catch(() => {});

    setStatus("waitlisted");
  }

  // ── OAuth redirect screen ──

  if (status === "oauth_redirecting") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <p className="text-sm text-zinc-400">Redirecting to Google…</p>
      </div>
    );
  }

  // ── Waitlist screen (post-signup while Phase 2 is queued) ──

  if (status === "waitlisted") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-lg text-center py-8">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-950/40 text-2xl">
            💼
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            You&apos;re on the list.
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            The investor agent goes live shortly. We&apos;ll email{" "}
            <span className="text-zinc-200">{email}</span> the second it&apos;s
            ready — no forms to fill out on your end, no waitlist queue to
            work through. First in, first served.
          </p>
          <p className="text-xs text-zinc-500 mt-6 max-w-md mx-auto leading-relaxed">
            When it opens, you&apos;ll land in a chat. The agent will ask what
            you&apos;re raising — fund, deal, SPV — and start running the
            raise with you. No forms, no CRM to set up.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/raise-fund"
              className="rounded-full border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-600"
            >
              ← Back to overview
            </Link>
            <Link
              href="/raise-intel"
              className="rounded-full border border-teal-700/60 bg-teal-950/30 px-6 py-2.5 text-sm font-medium text-teal-300 transition-colors hover:bg-teal-900/40"
            >
              Read raise intel →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Signup form ──

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-3">
            Investor signup
          </p>
          <h1 className="text-2xl font-bold text-white">Set up your agent</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Free to start. No credit card. The agent asks the rest in chat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-zinc-700 bg-zinc-900 py-3 text-sm font-medium text-zinc-100 transition-all hover:border-zinc-600 hover:bg-zinc-800"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="rf-name" className="block text-xs text-zinc-500 mb-1.5">Name</label>
            <input
              id="rf-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="rf-email" className="block text-xs text-zinc-500 mb-1.5">Email</label>
            <input
              id="rf-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@yourfirm.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="rf-password" className="block text-xs text-zinc-500 mb-1.5">Password</label>
            <input
              id="rf-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="At least 6 characters"
            />
          </div>

          {/* Turnstile */}
          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center">
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                options={{ theme: "dark", size: "normal" }}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
              />
            </div>
          )}

          {/* Terms agreement */}
          <label className="flex items-start gap-2 text-xs text-zinc-500 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-teal-500 focus:ring-teal-700 focus:ring-offset-0 cursor-pointer"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-teal-400 hover:text-teal-300">
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link href="/privacy" target="_blank" className="text-teal-400 hover:text-teal-300">
                Privacy Policy
              </Link>
            </span>
          </label>

          {status === "error" && errorMsg && (
            <p className="text-sm text-red-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending" || !canSubmit()}
            className="w-full rounded-full bg-teal-500 py-3 text-sm font-semibold text-black transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-xs text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-400 hover:text-teal-300">Log in</Link>
          </p>

          {/* Path handoff — for someone who wandered here but is raising
              for a company, not a fund/deal. */}
          <p className="text-center text-xs text-zinc-600 pt-2 border-t border-zinc-900">
            Raising for a company?{" "}
            <Link href="/signup/founder" className="text-orange-400 hover:text-orange-300">
              Founder signup →
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
