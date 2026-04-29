"use client";

import { useRouter } from "next/navigation";
import FadeInSection from "@/components/fade-in-section";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Free ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Free
              </h2>
              <span className="text-sm text-zinc-500">verify to unlock</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              The full Brain. Investor matching, pipeline tracking, meeting
              ingestion, outreach strategy — all from conversation. No forms,
              no dashboards. Verify your LinkedIn + company website to
              unlock — takes about a minute.
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
                  <span className="text-teal-400 mt-0.5 shrink-0">—</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>

            <a
              href="/signup"
              className="rounded-full border border-teal-700/50 bg-teal-950/20 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30 inline-block"
            >
              Get started
            </a>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Catalyst (Concierge) ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Concierge
              </h2>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              Hands-on fundraising support from a team that&apos;s collectively raised
              over $21M across 1,100+ investor meetings. We work alongside you
              for the duration of your raise.
            </p>

            <div className="space-y-2 mb-10">
              {[
                "Everything in Launchpad — full Brain access, all tools, unlimited queries",
                "Investor matching + warm introductions from our network",
                "Pitch positioning — how to land the narrative with each investor",
                "Outreach strategy — who to contact, in what order, and what to lead with",
                "Meeting prep and debrief — before and after every investor conversation",
                "Term sheet review — comp data, red flags, and negotiation strategy",
                "Dramatically cheaper than a placement agent (3–5% of round)",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-orange-400 mt-0.5 shrink-0">—</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>

            <a
              href="mailto:team@raisefn.com?subject=Concierge%20inquiry"
              className="rounded-full border border-orange-700/50 bg-orange-950/20 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30 inline-block"
            >
              Contact us
            </a>
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
              actually work.
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
              Get started
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
                  <p key={text} className="text-sm text-zinc-500 flex items-start gap-2">
                    <span className="text-zinc-600 mt-0.5">—</span>
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
                  "Live intelligence, not raw data",
                  "Answers, not spreadsheets",
                  "Gets smarter with every raise",
                  "Remembers everything — you don't have to",
                  "The intel founders never share, available to everyone",
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
              Ready to raise smarter?
            </h2>
            <p className="text-zinc-500 mb-8">
              Sign up free. Tell us about your raise. We&apos;ll take it from there.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Get started
            </button>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
