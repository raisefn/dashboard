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
    "idle" | "sending" | "waitlisted" | "error"
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
