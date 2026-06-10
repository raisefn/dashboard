"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import FadeInSection from "@/components/fade-in-section";

type Tier = "pro" | "advisor";

export default function PricingPage() {
  const router = useRouter();
  const [, setAuthedToken] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<Tier | null>(null);
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

  // Auto-resume checkout after fresh signup. Supports both Pro and Advisor
  // intents (pendingPostAuthIntent set by the wall card before bouncing to
  // /signup when the user wasn't authed yet).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const resume = params.get("checkout");
    if (resume !== "resume-pro" && resume !== "resume-advisor") return;
    window.history.replaceState({}, "", window.location.pathname);
    const tier: Tier = resume === "resume-pro" ? "pro" : "advisor";
    startCheckout(tier, { fromAutoResume: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function waitForSession(timeoutMs: number): Promise<string | null> {
    const { data: { session: immediate } } = await supabase.auth.getSession();
    if (immediate?.access_token) return immediate.access_token;
    return new Promise<string | null>((resolve) => {
      let settled = false;
      const finish = (token: string | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        sub.subscription.unsubscribe();
        resolve(token);
      };
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session?.access_token) finish(session.access_token);
      });
      const timer = setTimeout(() => finish(null), timeoutMs);
    });
  }

  async function startCheckout(tier: Tier, opts?: { fromAutoResume?: boolean }) {
    setCheckoutError(null);
    let token: string | null = null;
    if (opts?.fromAutoResume) {
      token = await waitForSession(5000);
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token ?? null;
    }
    if (!token) {
      router.push(`/signup?after=upgrade-${tier}`);
      return;
    }

    setCheckoutLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });
      if (res.status === 401) {
        router.push(`/signup?after=upgrade-${tier}`);
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (e) {
      setCheckoutLoading(null);
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
            rounds of fundraising activity. Free to try. Pro when you&apos;re
            in the work. Advisor when you want raise(fn) Team in the loop.
          </p>
        </div>
      </section>

      {/* ── Free ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Free
              </h2>
              <span className="text-sm text-zinc-500">$0 — try the brain</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              Drop your deck, ask the brain anything, get real matches. Free
              to get started. Upgrade when you need more.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Brain chat", "limited — explore your raise end-to-end"],
                ["Investor briefs", "limited — one-page summaries for any investor, matched or known"],
                ["Investor matches", "limited — discover new investors that fit"],
                ["Full product otherwise", "no feature gates — every brain tool available"],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-3">
                  <span className="text-zinc-500 text-lg leading-snug shrink-0">•</span>
                  <span className="text-sm leading-relaxed">
                    <strong className="text-zinc-100 font-semibold">{name}</strong>
                    <span className="text-zinc-400"> — {desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className="rounded-full border border-zinc-700 bg-zinc-900/40 px-8 py-3 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-500 hover:bg-zinc-800/60 inline-block"
            >
              Start Free
            </a>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Pro ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Pro
              </h2>
              <span className="text-sm text-zinc-500">$199/mo · cancel anytime</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              For founders actively raising. Same brain, no walls. Pay monthly,
              cancel anytime. No engagement letter, no success fee.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Uncapped chat with the brain", "ask anything, as often as you need"],
                ["Uncapped investor matches", "keep exploring until you find your fit"],
                ["Uncapped briefs", "one-page summaries for every investor you target"],
                ["Pipeline + memory across sessions", "the brain remembers every conversation"],
                ["All brain tools", "targeting, deck review, outreach drafts, meeting prep"],
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

            <button
              onClick={() => startCheckout("pro")}
              disabled={checkoutLoading === "pro"}
              className="rounded-full border border-teal-600/60 bg-teal-900/30 px-8 py-3 text-sm font-medium text-teal-200 transition-all hover:border-teal-500 hover:bg-teal-900/50 disabled:opacity-50"
            >
              {checkoutLoading === "pro" ? "Opening checkout…" : "Get Pro — $199/mo"}
            </button>
            <p className="mt-3 text-xs text-zinc-500 max-w-xl">
              Cancel anytime from your account. Access continues through the
              end of your billing period.
            </p>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Advisor ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Advisor
              </h2>
              <span className="text-sm text-zinc-500">$999 once + 3% success fee · lifetime</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              Everything in Pro, plus raise(fn) Team in the loop. Warm intros
              from our proprietary network, deck review, meeting prep when it
              counts. Pay once, keep it for the life of the platform.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Everything Pro has, uncapped", "lifetime access — no monthly bill"],
                ["Curated warm intros", "from raisefn's proprietary investor network"],
                ["Deck review by raise(fn) Team", "calibrated feedback before you send"],
                ["Meeting prep when it counts", "tailored briefs and talking points per investor"],
                ["3% success fee", "only on capital from raisefn-introduced investors — we win when you do"],
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
              onClick={() => startCheckout("advisor")}
              disabled={checkoutLoading === "advisor"}
              className="rounded-full border border-orange-600/60 bg-orange-900/30 px-8 py-3 text-sm font-medium text-orange-200 transition-all hover:border-orange-500 hover:bg-orange-900/50 disabled:opacity-50"
            >
              {checkoutLoading === "advisor" ? "Opening checkout…" : "Get Advisor — $999"}
            </button>
            <p className="mt-3 text-xs text-zinc-500 max-w-xl">
              Engagement terms (including the 3% success fee) shown for review and acceptance at checkout. See the full{" "}
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
