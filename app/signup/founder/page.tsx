"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Founder signup form. Investors use /raise-fund/join (fund-specific
// questions), so this form is founder-only — no role picker. The chooser
// at /signup routes the ambiguous entries.
//
// Suspense wrapper — Next.js 14+ requires useSearchParams to live under
// a Suspense boundary or the whole page becomes dynamic.
export default function SignupFounderPage() {
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

  // Capture post-auth intent (e.g., ?after=upgrade-advisor) into
  // localStorage. Survives email-click + OAuth round-trip back to
  // /auth/confirm or /auth/callback, where it's read + cleared to route
  // the user to the right destination (e.g., /pricing?checkout=resume
  // instead of the default /brain/deploy).
  useEffect(() => {
    const after = searchParams.get("after");
    if (after) {
      try {
        localStorage.setItem("pendingPostAuthIntent", after);
      } catch {
        // localStorage can be disabled (incognito Safari, some configs);
        // intent is best-effort, drop silently on failure.
      }
    }
  }, [searchParams]);

  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "oauth_redirecting" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  // Resend state for the "check your email" screen. Verify email can land
  // in spam (notably Microsoft 365 junks young sending domains), so users
  // need an escape hatch instead of going silent or bouncing.
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // Cloudflare Turnstile token — populated by the widget when challenge
  // completes. Required for email/password signup; Google OAuth path
  // doesn't need it (Google already does its own bot detection).
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

  async function handleGoogle() {
    setStatus("oauth_redirecting");
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

    // Verify Turnstile token server-side BEFORE touching Supabase. Block
    // bot signups at the perimeter so we don't burn auth-provider rate
    // limits or DB rows on automated junk.
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

    // Create Supabase account. Email verification step is still required
    // (security + anti-abuse); user lands at /auth/callback → /brain/deploy
    // after clicking the link.
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          role: "founder",
        },
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      // Token is single-use after verify — reset for any retry.
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      return;
    }

    fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "founder",
      }),
    }).catch(() => {});

    setStatus("sent");
  }

  function resetForm() {
    setStatus("idle");
    setName("");
    setEmail("");
    setPassword("");
    setAgreedToTerms(false);
    setErrorMsg("");
    setResendStatus("idle");
  }

  async function handleResend() {
    if (resendStatus === "sending") return;
    setResendStatus("sending");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });
    setResendStatus(error ? "error" : "sent");
  }

  // ── Confirmation screens ──

  if (status === "sent") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center py-8">
          <h3 className="text-2xl font-bold text-white mb-3">Check your email</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            We sent a verification link to <span className="text-zinc-200">{email}</span>.
            Click it to get started. It may take a minute, and{" "}
            <span className="text-zinc-300">check your spam/junk folder</span> — it sometimes lands there.
          </p>

          <div className="mt-6">
            {resendStatus === "sent" ? (
              <p className="text-sm text-teal-400">Sent again — check your inbox and spam folder.</p>
            ) : resendStatus === "error" ? (
              <p className="text-sm text-amber-400">
                Couldn&apos;t resend. Email{" "}
                <a href="mailto:justin@raisefn.com" className="underline hover:text-amber-300">
                  justin@raisefn.com
                </a>{" "}
                and we&apos;ll get you in manually.
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendStatus === "sending"}
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-50"
              >
                {resendStatus === "sending" ? "Resending…" : "Didn't get it? Resend the email"}
              </button>
            )}
          </div>

          <p className="mt-4 text-xs text-zinc-600">
            Still stuck? Email{" "}
            <a href="mailto:justin@raisefn.com" className="text-zinc-500 underline hover:text-zinc-400">
              justin@raisefn.com
            </a>{" "}
            and we&apos;ll verify you manually.
          </p>

          <button onClick={resetForm} className="mt-6 text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
            Sign up with a different email
          </button>
        </div>
      </div>
    );
  }

  if (status === "oauth_redirecting") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <p className="text-sm text-zinc-400">Redirecting to Google…</p>
      </div>
    );
  }

  // ── Signup form ──

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-3">
            Founder signup
          </p>
          <h1 className="text-2xl font-bold text-white">Set up your agent</h1>
          <p className="text-sm text-zinc-500 mt-2">Free to start. No credit card.</p>
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
            <label htmlFor="su-name" className="block text-xs text-zinc-500 mb-1.5">Name</label>
            <input
              id="su-name"
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
            <label htmlFor="su-email" className="block text-xs text-zinc-500 mb-1.5">Email</label>
            <input
              id="su-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@company.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="su-password" className="block text-xs text-zinc-500 mb-1.5">Password</label>
            <input
              id="su-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="At least 6 characters"
            />
          </div>

          {/* Cloudflare Turnstile — bot defense at the door. Token is
              submitted with the form and verified server-side via
              /api/turnstile/verify before Supabase gets touched. */}
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
            className="w-full rounded-full bg-orange-600 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-xs text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-400 hover:text-teal-300">Log in</Link>
          </p>

          {/* Path handoff — someone landed on the founder form but is
              actually raising a fund/deal/SPV. Give them an out. */}
          <p className="text-center text-xs text-zinc-600 pt-2 border-t border-zinc-900">
            Raising a fund, deal, or SPV?{" "}
            <Link href="/raise-fund/join" className="text-teal-400 hover:text-teal-300">
              Investor signup →
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
