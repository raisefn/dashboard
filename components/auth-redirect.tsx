"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

/**
 * Detects Supabase invite tokens in the URL hash (#access_token=...)
 * and redirects to the auth confirm page to complete setup.
 */
export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash.includes("access_token")) return;

    // Supabase client automatically picks up the hash tokens
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;

      // Clear the hash from the URL
      window.history.replaceState(null, "", window.location.pathname);

      // OAuth users (Google, etc.) already have a working credential —
      // route them straight to the app instead of into the password setup
      // flow at /auth/confirm. Same provider detection as /auth/confirm.
      const provider = session.user?.app_metadata?.provider;
      const providers = (session.user?.app_metadata?.providers as string[] | undefined) || [];
      const isOauth =
        (provider && provider !== "email") ||
        providers.some((p) => p && p !== "email");
      if (isOauth) {
        router.replace("/brain/deploy");
        return;
      }
      const hasSetPassword = session.user?.user_metadata?.password_set;
      if (hasSetPassword) {
        router.replace("/brain/deploy");
      } else {
        router.replace("/auth/confirm");
      }
    });
  }, [router]);

  return null;
}
