"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

const STATE_KEY = "raisefn.stripeConnectState";

export default function StripeCallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <StripeCallbackInner />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-zinc-400 text-sm">Connecting your Stripe account...</p>
    </div>
  );
}

function StripeCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const stripeError = searchParams.get("error");

      // Stripe surfaces user denial / errors via ?error=...
      if (stripeError) {
        setError(searchParams.get("error_description") || stripeError);
        sessionStorage.removeItem(STATE_KEY);
        return;
      }

      if (!code || !state) {
        setError("Missing authorization code from Stripe.");
        return;
      }

      // CSRF protection: the state we sent must match the state we got back.
      const expectedState = sessionStorage.getItem(STATE_KEY);
      sessionStorage.removeItem(STATE_KEY);
      if (!expectedState || expectedState !== state) {
        setError("Security check failed. Please try connecting again.");
        return;
      }

      // We need the user's Supabase JWT to forward to the exchange route.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Please log in again before connecting Stripe.");
        return;
      }

      const resp = await fetch("/api/integrations/stripe/exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data.error || "Failed to complete Stripe connection.");
        return;
      }

      router.replace("/brain/deploy?stripe=connected");
    }

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <a
            href="/brain/deploy"
            className="text-sm text-teal-400 hover:underline"
          >
            Back to brain
          </a>
        </div>
      </div>
    );
  }

  return <Loading />;
}
