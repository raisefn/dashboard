"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

// Map of post-auth intent values → destination URLs. Set at /signup via
// localStorage.setItem("pendingPostAuthIntent", "<key>"), consumed here.
// Returns "/brain/deploy" (the default) if no recognized intent.
function consumePostAuthDestination(): string {
  if (typeof window === "undefined") return "/brain/deploy";
  try {
    const intent = localStorage.getItem("pendingPostAuthIntent");
    if (!intent) return "/brain/deploy";
    localStorage.removeItem("pendingPostAuthIntent");
    if (intent === "upgrade-founder") return "/pricing?checkout=resume-founder";
    if (intent === "upgrade-investor") return "/pricing?checkout=resume-investor";
    return "/brain/deploy";
  } catch {
    return "/brain/deploy";
  }
}

// Investor signups (role=investor, set at /raise-fund/join) route to
// /raise-fund on any post-auth entry — the investor-side brain surface
// (Phase 2) isn't shipped yet, so dropping them into /brain/deploy
// (the founder chat) would be broken UX. Once Phase 2 ships, swap this
// to route to /raise-fund/deploy.
async function destinationForCurrentSession(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const role = session?.user?.user_metadata?.role;
  if (role === "investor") return "/raise-fund";
  return consumePostAuthDestination();
}

// Google OAuth from /raise-fund/join sets a "pendingSignupRole" flag in
// localStorage before redirect (Google itself can't carry role
// metadata through the OAuth flow). Here we read the flag right after
// Supabase establishes the session, promote the user to that role via
// updateUser, and fire the Slack ping so Justin knows an investor
// signed up — same side effects the email/password path already had.
async function applyPendingSignupRole(): Promise<void> {
  if (typeof window === "undefined") return;
  let pendingRole: string | null = null;
  try {
    pendingRole = localStorage.getItem("pendingSignupRole");
  } catch {
    return;
  }
  if (pendingRole !== "investor") return;
  try { localStorage.removeItem("pendingSignupRole"); } catch { /* ignore */ }

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;

  // Idempotent: skip if role is already set (e.g. user visits /auth/callback
  // twice, or an email-flow user re-authenticates via OAuth).
  if (user.user_metadata?.role === "investor") return;

  const nameFromGoogle =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "";

  await supabase.auth.updateUser({
    data: {
      role: "investor",
      // Preserve name if Google provided it; fall back gracefully.
      name: nameFromGoogle,
    },
  });

  // Slack ping — mirrors the /api/signup call the email/password path
  // fires from raise-fund/join. Best-effort; failures don't block.
  fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameFromGoogle,
      email: (user.email || "").toLowerCase(),
      role: "investor",
    }),
  }).catch(() => {});
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthCallbackInner />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-zinc-400 text-sm">Signing you in...</p>
    </div>
  );
}

function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      // useSearchParams() can return empty on the first effect run before
      // Next.js hydrates. Fall back to window.location.search so we don't
      // briefly fall through the "Invalid confirmation link" branch on
      // every successful OAuth callback.
      const windowParams =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const tokenHash =
        searchParams.get("token_hash") || windowParams?.get("token_hash");
      const type =
        searchParams.get("type") || windowParams?.get("type");
      const code =
        searchParams.get("code") || windowParams?.get("code");

      // Belt-and-suspenders: if Supabase already established a session
      // (it auto-processes hash-token implicit flows like #access_token=...
      // on page load), redirect immediately instead of falling through to
      // the no-params error branch. Covers PKCE, implicit, and any other
      // flow where the session is already valid by the time we render.
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        const isRecovery = type === "recovery";
        await applyPendingSignupRole();
        router.replace(isRecovery ? "/reset-password" : await destinationForCurrentSession());
        return;
      }

      // Password reset flow — Supabase appends type=recovery to the
      // redirectTo URL we passed at resetPasswordForEmail() time. After
      // verifying the OTP the user has a valid session; we route them
      // to /reset-password to actually set a new password instead of
      // dropping them into the brain authenticated-but-unprompted.
      const isRecovery = type === "recovery";

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "signup" | "email" | "recovery",
        });

        if (error) {
          setError(error.message);
          return;
        }

        await applyPendingSignupRole();
        router.replace(isRecovery ? "/reset-password" : await destinationForCurrentSession());
        return;
      }

      if (code) {
        // PKCE flow (magic link or OAuth)
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setError(error.message);
          return;
        }

        await applyPendingSignupRole();
        router.replace(isRecovery ? "/reset-password" : await destinationForCurrentSession());
        return;
      }

      setError("Invalid confirmation link. Please try signing up again.");
    }

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/signup" className="text-sm text-teal-400 hover:underline">
            Back to signup
          </a>
        </div>
      </div>
    );
  }

  return <Loading />;
}
