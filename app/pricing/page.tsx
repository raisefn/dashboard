"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import FadeInSection from "@/components/fade-in-section";

export default function PricingPage() {
  const router = useRouter();
  const [authedToken, setAuthedToken] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthedToken(session?.access_token ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthedToken(session?.access_token ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Auto-resume the checkout if we got bounced here from /auth/confirm or
  // /auth/callback after a fresh signup (the post-auth helper redirects to
  // /pricing?checkout=resume when pendingPostAuthIntent === "upgrade-advisor").
  // Waits for the session to hydrate before firing.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "resume") return;
    if (!authedToken) return; // session not hydrated yet — wait for re-run
    // Strip the param so a refresh doesn't re-fire the redirect
    const stripped = window.location.pathname;
    window.history.replaceState({}, "", stripped);
    startAdvisorCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authedToken]);

  async function startAdvisorCheckout() {
    setCheckoutError(null);

    // Re-fetch the session at click time — React state can hold a stale
    // token (e.g., user signed out in another tab, JWT expired during page
    // dwell). The Supabase client also auto-refreshes here when possible.
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    const token = freshSession?.access_token;
    if (!token) {
      router.push("/signup?after=upgrade-advisor");
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: "advisor" }),
      });

      // If server rejects the token (expired between getSession + fetch,
      // or session revoked server-side), bounce to signup with intent
      // preserved instead of showing the generic error.
      if (res.status === 401) {
        router.push("/signup?after=upgrade-advisor");
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (e) {
      setCheckoutLoading(false);
      setCheckoutError(
        "Couldn't start checkout — try again or email team@raisefn.com."
      );
      console.error("Stripe checkout error:", e);
    }
  }

  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            Pricing
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            Fundraising intelligence built for founders
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Targeting, deck analysis, outreach drafts — grounded in 24,000+
            rounds of fundraising activity. Launchpad to try the brain.
            Advisor when you&apos;re running an active raise.
          </p>
        </div>
      </section>

      {/* ── Launchpad (free) ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Launchpad
              </h2>
              <span className="text-sm text-zinc-500">Free — 12 messages / month</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              Drop your deck, paste an investor list, or just ask. The brain
              reads what you give it, surfaces matches from public data plus
              named investors from its training, and answers real questions
              about your raise. No forms, no friction.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Drop your deck", "PDF or DOCX — profile auto-populates in seconds"],
                ["Investor research", "tracker firms + named partners across the public record"],
                ["Deck and narrative review", "calibrated feedback before you go out"],
                ["Outreach drafts", "cold and warm intros, drafted for your context"],
                ["All brain tools", "targeting, planning, term review — no feature gates"],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-3">
                  <span className="text-teal-400 text-lg leading-snug shrink-0">•</span>
                  <span className="text-sm leading-relaxed">
                    <strong className="text-zinc-100 font-semibold">{name}</strong>
                    <span className="text-zinc-400"> — {desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className="rounded-full border border-teal-700/50 bg-teal-950/20 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 inline-block"
            >
              Set Up Your Raise
            </a>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Advisor (paid, runs a full raise) ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Advisor
              </h2>
              <span className="text-sm text-zinc-500">$999 one-time, lifetime</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              For founders running an active raise. Unlimited product access,
              curated warm intros from our proprietary network, and a 1-hour
              advisory call. Pay once, keep it for the life of the platform.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Unlimited product access", "lifetime — no monthly cap, no recurring bill"],
                ["Curated warm intros", "from raisefn's proprietary investor network"],
                ["1hr advisory call", "with the raise(fn) team"],
                ["Pipeline memory", "every investor conversation logged so you never re-explain"],
                ["Targeting & outreach drafts", "who to reach, what to say, ready to send"],
                ["2% success fee", "only on capital from raisefn-introduced investors — we win when you do"],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-3">
                  <span className="text-orange-400 text-lg leading-snug shrink-0">•</span>
                  <span className="text-sm leading-relaxed">
                    <strong className="text-zinc-100 font-semibold">{name}</strong>
                    <span className="text-zinc-400"> — {desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={startAdvisorCheckout}
              disabled={checkoutLoading}
              className="rounded-full border border-orange-600/60 bg-orange-900/30 px-8 py-3 text-sm font-medium text-orange-200 transition-all hover:border-orange-500 hover:bg-orange-900/50 disabled:opacity-50"
            >
              {checkoutLoading ? "Opening checkout…" : "Get Advisor — $999"}
            </button>
            <p className="mt-3 text-xs text-zinc-500 max-w-xl">
              Engagement terms (including the 2% success fee) shown for review and acceptance at checkout. See the full{" "}
              <a
                href="/legal/engagement"
                target="_blank"
                rel="noopener"
                className="text-teal-400 hover:text-teal-300 underline"
              >
                Advisor engagement letter
              </a>
              .
            </p>
            {checkoutError && (
              <div className="mt-3 text-xs text-red-400 max-w-xl">{checkoutError}</div>
            )}
          </div>
        </FadeInSection>
      </section>

      {/* ── The Difference ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              The Difference
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div>
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">
                Raising capital today
              </p>
              <div className="space-y-4">
                {[
                  "Investor conversations tracked in spreadsheets, CRMs, or your head",
                  "Weeks of research to find who's actually writing checks",
                  "No way to know if an investor is serious or stringing you along",
                  "Every founder starts from scratch — no one shares what worked",
                  "The best intel lives in private networks you're not in",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-500 flex items-start gap-3 leading-relaxed">
                    <span className="text-zinc-600 text-lg leading-snug shrink-0">•</span>
                    <span>{text}</span>
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-6">
                raise(fn)
              </p>
              <div className="space-y-4">
                {[
                  "Live intelligence, not raw data",
                  "Answers, not spreadsheets",
                  "Gets smarter with every raise",
                  "Remembers everything — you don't have to",
                  "The intel founders never share, available to everyone",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-300 flex items-start gap-3 leading-relaxed">
                    <span className="text-teal-400 text-lg leading-snug shrink-0">•</span>
                    <span>{text}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Ready to raise smarter?
            </h2>
            <p className="text-zinc-500 mb-8">
              Sign up free. Tell us about your raise. We&apos;ll take it from there.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Set Up Your Raise
            </button>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
