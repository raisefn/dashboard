"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import FadeInSection from "@/components/fade-in-section";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(tier: string) {
    setLoading(tier);
    try {
      // Build headers — include auth if logged in, works without it too
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Start free. Upgrade when the Brain proves its value.
          </p>
        </div>
      </section>

      {/* ── Free ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Free
              </h2>
              <span className="text-2xl font-bold text-teal-400">$0</span>
            </div>
            <p className="text-sm text-zinc-400 mb-8 max-w-xl">
              Discovery conversation and a raise readiness assessment grounded
              in real data. See how you stack up before you spend a dollar.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Raise readiness assessment — benchmarked against real rounds",
                "Raise intelligence briefing for active raisers — comps, market context, investor teaser",
                "General fundraising conversation — strategy, timing, structure",
                "Honest, data-grounded advice you can't get from ChatGPT",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-teal-400 mt-0.5 shrink-0">—</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full border border-teal-700/50 bg-teal-950/20 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30"
            >
              Get started
            </button>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Launchpad ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Launchpad
              </h2>
              <span className="text-2xl font-bold text-orange-400">$500</span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
            <p className="text-xs text-zinc-500 mb-1">or $3,000/year (save $3K)</p>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              The full Brain runs your raise. Investor matching, pipeline
              tracking, meeting ingestion, outreach strategy — all from
              conversation. No forms, no dashboards. Cancel anytime.
            </p>

            <div className="space-y-2 mb-10">
              {[
                "Investor matching — ranked by fit from 24,000+ rounds of real data",
                "Pipeline CRM — the Brain tracks every investor interaction automatically",
                "Meeting ingestion — paste a transcript, the Brain captures everything",
                "Outreach strategy — who to contact, how, and when",
                "Signal reading — what investors are actually doing, not just saying",
                "Term sheet intelligence — comp data and negotiation context",
                "Narrative analysis — how your story lands with target investors",
                "Persistent memory — the Brain remembers your entire raise across sessions",
                "Unlimited queries for the duration of your raise",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-orange-400 mt-0.5 shrink-0">—</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleCheckout("launchpad")}
                disabled={loading === "launchpad"}
                className="rounded-full border border-orange-700/50 bg-orange-950/20 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30 disabled:opacity-50"
              >
                {loading === "launchpad" ? "Loading..." : "$500/month"}
              </button>
              <button
                onClick={() => handleCheckout("launchpad_annual")}
                disabled={loading === "launchpad_annual"}
                className="rounded-full border border-zinc-700/50 bg-zinc-900/20 px-8 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-600 hover:bg-zinc-800/30 disabled:opacity-50"
              >
                {loading === "launchpad_annual" ? "Loading..." : "$3,000/year"}
              </button>
            </div>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Catalyst ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Catalyst
              </h2>
              <span className="text-2xl font-bold text-orange-400">$2,500</span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              Everything in Launchpad, plus hands-on fundraising consulting from
              someone who's been there. Dramatically cheaper than a placement
              agent.
            </p>

            <div className="space-y-2 mb-10">
              {[
                "Everything in Launchpad — full Brain access, all tools, unlimited queries",
                "Hands-on fundraising consulting",
                "Dramatically cheaper than a placement agent (3–5% of round)",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-orange-400 mt-0.5 shrink-0">—</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout("catalyst")}
              disabled={loading === "catalyst"}
              className="rounded-full border border-orange-700/50 bg-orange-950/20 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30 disabled:opacity-50"
            >
              {loading === "catalyst" ? "Loading..." : "$2,500/month"}
            </button>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Investors ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Investors
              </h2>
            </div>
            <p className="text-sm text-zinc-400 mb-8 max-w-xl">
              Market intelligence and deal management built for how investors
              actually work. Sign up to get early access.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Deal flow matching — active raises matched to your thesis, sectors, and check size",
                "Market intelligence — sector trends, valuation benchmarking, and funding activity from 24,000+ rounds",
                "Deal pipeline CRM — track every company you're evaluating, from conversation",
                "Portfolio monitoring — stay on top of your existing companies",
                "Term sheet benchmarking — comp data for evaluating deals",
                "Valuation comps — where any deal sits relative to the market",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-teal-400 mt-0.5 shrink-0">—</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full border border-teal-700/50 bg-teal-950/20 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30"
            >
              Get early access
            </button>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Builders ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Builders
              </h2>
              <span className="text-2xl font-bold text-teal-400">Coming soon</span>
            </div>
            <p className="text-sm text-zinc-400 mb-8 max-w-xl">
              SDKs, APIs, and integrations for developers embedding fundraising
              intelligence in their products. We're building for founders first —
              sign up and we'll reach out when the builder tools are ready.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full border border-teal-700/50 bg-teal-950/20 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30"
            >
              Join the waitlist
            </button>
          </div>
        </FadeInSection>
      </section>

      {/* ── Comparison ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              For context
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">
                Traditional
              </p>
              <div className="space-y-4">
                {[
                  "Placement agent: 3–5% of round",
                  "Fundraising advisor: $500–$1K/hr",
                  "Months of manual research",
                  "Stale data, static reports",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-500 flex items-start gap-2">
                    <span className="text-zinc-600 mt-0.5">—</span>
                    {text}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">
                Data platforms
              </p>
              <div className="space-y-4">
                {[
                  "Crunchbase Pro: $49–$99/mo",
                  "PitchBook: $20K–$50K/yr",
                  "Raw data, no intelligence",
                  "You do the analysis yourself",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-500 flex items-start gap-2">
                    <span className="text-zinc-500 mt-0.5">—</span>
                    {text}
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
                  "Full Brain: $500/mo",
                  "Brain + consulting: $2,500/mo",
                  "Live intelligence, not raw data",
                  "Answers, not spreadsheets",
                  "Gets smarter with every raise",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-teal-400 mt-0.5">—</span>
                    {text}
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
              Start with the assessment. Raise with the Brain.
            </h2>
            <p className="text-zinc-500 mb-8">
              The assessment is free. The Brain is where the value lives.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Get started free
            </button>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
