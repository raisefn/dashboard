"use client";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

type Role = "founder" | "investor" | "builder";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function SignupPage() {
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "builder_done" | "oauth_redirecting" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Founder is the default role — the "Set Up Your Raise" CTA brings the
  // founder cohort here. Investors and Builders still have access via the
  // role toggle below. Phase 3 dropped company/phone/raising_status from
  // the form; brain captures those naturally during chat.
  const [role, setRole] = useState<Role>("founder");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // Cloudflare Turnstile token — populated by the widget when challenge
  // completes. Required for email/password signup; Google OAuth path
  // doesn't need it (Google already does its own bot detection).
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const inputClass =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-700 transition-colors";

  const roleOptions: { value: Role; label: string }[] = [
    { value: "founder", label: "Founder" },
    { value: "investor", label: "Investor" },
    { value: "builder", label: "Builder" },
  ];

  // Builder path: no Supabase account, just Slack notification.
  const isBuilder = role === "builder";
  const needsPassword = !isBuilder;

  function canSubmit() {
    if (!name.trim() || !email.trim()) return false;
    if (needsPassword && password.length < 6) return false;
    if (!agreedToTerms) return false;
    // Turnstile required for non-builder email/password path. Builder skips
    // (no Supabase account to protect). Google OAuth path doesn't go through
    // this submit handler — Google does its own bot defense upstream.
    if (TURNSTILE_SITE_KEY && needsPassword && !turnstileToken) return false;
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
    // No further code runs here.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit()) return;
    if (needsPassword && password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    // Verify Turnstile token server-side BEFORE touching Supabase. Block
    // bot signups at the perimeter so we don't burn auth-provider rate
    // limits or DB rows on automated junk. Builders skip this since their
    // path is just a Slack notification.
    if (TURNSTILE_SITE_KEY && needsPassword && turnstileToken) {
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

    if (isBuilder) {
      // Builder: just notify Slack, no Supabase account.
      fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: "builder",
        }),
      }).catch(() => {});

      setStatus("builder_done");
      return;
    }

    // Founder / Investor: create Supabase account. Email verification
    // step is still required (security + anti-abuse); user lands at
    // /auth/callback → /brain/deploy after clicking the link.
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          role,
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
        role,
      }),
    }).catch(() => {});

    setStatus("sent");
  }

  function resetForm() {
    setStatus("idle");
    setName("");
    setEmail("");
    setPassword("");
    setRole("founder");
    setAgreedToTerms(false);
    setErrorMsg("");
  }

  // ── Confirmation screens ──

  if (status === "sent") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center py-8">
          <h3 className="text-2xl font-bold text-white mb-3">Check your email</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            We sent a verification link to <span className="text-zinc-200">{email}</span>.
            Click it to get started.
          </p>
          <button onClick={resetForm} className="mt-6 text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
            Sign up with a different email
          </button>
        </div>
      </div>
    );
  }

  if (status === "builder_done") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center py-8">
          <h3 className="text-2xl font-bold text-white mb-3">Thanks, {name.split(" ")[0]}!</h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            We&apos;re building for founders first, but we&apos;re paying close attention to what builders need.
            We&apos;ll reach out when we&apos;re ready for you.
          </p>
          <p className="text-sm text-zinc-500 mb-6">
            In the meantime, our tracker data is open:
          </p>
          <Link
            href="/tracker"
            className="rounded-full border border-teal-700/50 bg-teal-950/30 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30"
          >
            Explore the data
          </Link>
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
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Get started</h1>
          <p className="text-sm text-zinc-500 mt-2">Create your account in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection — at the TOP so users see it before any
              auth method. Defaults to Founder (the Set-Up-Your-Raise
              CTA brings the founder cohort here). When user explicitly
              picks Investor or Builder, the Google button hides below —
              Google OAuth can't carry role metadata cleanly, so we route
              non-founders through email/password where role IS captured. */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2">I am a...</label>
            <div className="flex gap-2">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    role === opt.value
                      ? "border-teal-600 bg-teal-950/40 text-teal-300"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Google OAuth — only for founders. Investor + Builder
              flows need role metadata that OAuth doesn't carry, so
              they get the email/password path only. */}
          {role === "founder" && (
            <>
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
            </>
          )}

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

          {/* Password — founders and investors only (builders submit without auth) */}
          {needsPassword && (
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
          )}

          {/* Cloudflare Turnstile — bot defense at the door. Skips
              when role=builder (no Supabase account to protect) and
              when the site key isn't configured (graceful local-dev
              fallback). Token is submitted with the form and verified
              server-side via /api/turnstile/verify before Supabase
              gets touched. */}
          {TURNSTILE_SITE_KEY && needsPassword && (
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
            className="w-full rounded-full border border-teal-700/50 bg-teal-950/30 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Creating account..." : isBuilder ? "Submit" : "Create account"}
          </button>

          <p className="text-center text-xs text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-400 hover:text-teal-300">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
