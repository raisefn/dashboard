"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (key) {
      posthog.init(key, {
        api_host: host,
        capture_pageview: true,
        capture_pageleave: true,
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          posthog.identify(session.user.id, {
            email: session.user.email,
            name: session.user.user_metadata?.name,
            role: session.user.user_metadata?.role,
          });
        } else {
          posthog.reset();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
