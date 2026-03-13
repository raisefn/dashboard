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
