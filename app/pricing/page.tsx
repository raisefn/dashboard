"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import FadeInSection from "@/components/fade-in-section";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  async function startLaunchpadCheckout() {
    setCheckoutError(null);
    if (!authedToken) {
      router.push("/signup?after=upgrade-launchpad");
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authedToken}`,
        },
        body: JSON.stringify({ tier: "launchpad" }),
      });
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
            Investor matching, deck analysis, outreach strategy — grounded in
            24,000+ rounds of fundraising activity. Free for verified founders.
            Advisor when you&apos;re running the full raise.
          </p>
        </div>
      </section>

      {/* ── Launchpad (free, verified) ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Launchpad
              </h2>
              <span className="text-sm text-zinc-500">$0 — verification required</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              Guidance to start your raise, backed by real founder knowledge
              and live market data. Verify your LinkedIn and company website
              to unlock the AI tools — investor matching, deck analysis,
              outreach drafting, all of it.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Readiness check", "where you stand, what to work on before you pitch"],
                ["Investor research", "who's writing checks at your stage and sector"],
                ["Deck and narrative review", "calibrated feedback before you go out"],
                ["First outreach drafts", "your initial cold and warm intros"],
                ["Persistent memory", "the Brain remembers your raise across sessions"],
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
              <span className="text-sm text-zinc-500">$200 / month</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              For founders running an active raise. Run your entire raise on
              the platform — every tool, every conversation, end-to-end. Pipeline
              tracking, deck iteration, investor matching, outreach drafting,
              term sheet review.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Run your entire raise", "no caps during an active raise"],
                ["Pipeline CRM", "every investor interaction tracked automatically"],
                ["Sustained outreach", "drafts, follow-ups, replies across your full pipeline"],
                ["Term sheet intelligence", "comp data and negotiation strategy when offers land"],
                ["Priority on warm intros", "verified raisers move first through the match queue"],
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
              onClick={startLaunchpadCheckout}
              disabled={checkoutLoading}
              className="rounded-full border border-orange-600/60 bg-orange-900/30 px-8 py-3 text-sm font-medium text-orange-200 transition-all hover:border-orange-500 hover:bg-orange-900/50 disabled:opacity-50"
            >
              {checkoutLoading ? "Opening checkout…" : "Upgrade to Advisor"}
            </button>
            {checkoutError && (
              <div className="mt-3 text-xs text-red-400 max-w-xl">{checkoutError}</div>
            )}
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Concierge ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Concierge
              </h2>
              <span className="text-sm text-zinc-500">Contact us</span>
            </div>
            <p className="text-sm text-zinc-400 mb-4 max-w-xl">
              Hands-on fundraising support from a team that&apos;s been there.
              Together we&apos;ve raised over $21M across 1,100+ investor
              meetings — and we&apos;ve watched every kind of &ldquo;no&rdquo;
              and &ldquo;yes.&rdquo; We bring that pattern recognition to
              your raise.
            </p>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              We work alongside you for the duration of your raise — pitch
              positioning, investor matching, warm intros, meeting prep, term
              sheet review. Whatever the raise needs.
            </p>

            <ul className="space-y-4 mb-10 list-none">
              {[
                ["Pitch positioning", "how to land the narrative with each investor"],
                ["Investor matching", "warm introductions from our network"],
                ["Outreach strategy", "who to contact, in what order, what to lead with"],
                ["Meeting prep and debrief", "before and after every investor conversation"],
                ["Term sheet review", "comp data, red flags, and negotiation strategy"],
                ["Full Brain access", "every tool, throughout the raise, no friction"],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-3">
                  <span className="text-purple-400 text-lg leading-snug shrink-0">•</span>
                  <span className="text-sm leading-relaxed">
                    <strong className="text-zinc-100 font-semibold">{name}</strong>
                    <span className="text-zinc-400"> — {desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="mailto:team@raisefn.com?subject=Concierge%20inquiry"
              className="rounded-full border border-purple-700/50 bg-purple-950/20 px-8 py-3 text-sm font-medium text-purple-300 transition-all hover:border-purple-500 hover:bg-purple-900/30 inline-block"
            >
              Contact us
            </a>
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
