"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

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
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const code = searchParams.get("code");

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

        router.replace(isRecovery ? "/reset-password" : "/brain/deploy");
        return;
      }

      if (code) {
        // PKCE flow (magic link or OAuth)
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setError(error.message);
          return;
        }

        router.replace(isRecovery ? "/reset-password" : "/brain/deploy");
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
