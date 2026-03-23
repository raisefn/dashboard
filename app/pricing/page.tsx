"use client";

import FadeInSection from "@/components/fade-in-section";
import EarlyAccessModal from "@/components/early-access-modal";
import { useState } from "react";

export default function PricingPage() {
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The data is free. The intelligence is not. Pick the model that
            matches how you work.
          </p>
        </div>
      </section>

      {/* ── Explorer (Free) ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Explorer
              </h2>
              <span className="text-2xl font-bold text-teal-400">Free</span>
            </div>
            <p className="text-sm text-zinc-400 mb-8 max-w-xl">
              Full access to the tracker &mdash; companies, rounds,
              and investors cross-referenced from SEC filings, accelerator directories, and traction signals. Browse, search, and export.
              Plus one free Brain query to see what the intelligence can
              do.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Live tracker data — projects, rounds, investors",
                "Search and filter across the full dataset",
                "One free investor match query",
                "One free readiness snapshot",
                "Open source — run it yourself if you want",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-teal-400 mt-0.5 shrink-0">—</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowEarlyAccess(true)}
              className="rounded-full border border-teal-700/50 bg-teal-950/20 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30"
            >
              Request Early Access
            </button>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Founder (Per-raise) ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Founder
              </h2>
              <span className="text-2xl font-bold text-orange-400">
                Per raise
              </span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              Brain access for the duration of your raise. Pay once, raise with
              intelligence until you close. Pick the tier that matches your
              needs.
            </p>

            {/* Launchpad */}
            <div className="mb-10">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-lg font-bold text-orange-300">
                  Launchpad
                </span>
                <span className="text-lg font-bold text-orange-400">
                  $2,500
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-4">
                Full Brain access for the duration of your raise
              </p>
              <div className="space-y-2">
                {[
                  "Investor matching — ranked by fit, stage, sector, and check size",
                  "Readiness evaluation — how fundable you are right now",
                  "Narrative analysis — what story your data tells investors",
                  "Signal reading — what investors are actually doing, not just saying",
                  "Outreach guidance — who to contact, how, and when",
                  "Term sheet intelligence — comp data and negotiation context",
                  "Meeting ingestion — paste a transcript, the Brain captures everything",
                  "Persistent context — the Brain remembers your entire raise",
                  "Unlimited queries for the duration of your raise",
                  "Live data — calibrated against current market conditions",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5 shrink-0">—</span>
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Catalyst */}
            <div className="mb-10">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-lg font-bold text-orange-300">
                  Catalyst
                </span>
                <span className="text-lg font-bold text-orange-400">
                  $7,500
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-4">
                Everything in Launchpad, plus
              </p>
              <div className="space-y-2">
                {[
                  "Everything in Launchpad — full Brain access, all intelligence, unlimited queries",
                  "Professional fundraising consulting from someone who\u2019s been there",
                  "Dramatically cheaper than a placement agent (3\u20135% of round)",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="text-orange-400 mt-0.5 shrink-0">—</span>
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowEarlyAccess(true)}
              className="rounded-full border border-orange-700/50 bg-orange-950/20 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30"
            >
              Request Early Access
            </button>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Professional (Consultants + Investors) ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Professional
              </h2>
              <span className="text-2xl font-bold text-orange-400">
                $1,000
              </span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
            <p className="text-sm text-zinc-400 mb-10 max-w-xl">
              For fundraising consultants and investors who use the Brain as
              a daily tool. Continuous intelligence across multiple deals,
              persistent context, and the ability to run multiple raises or
              evaluations simultaneously.
            </p>

            <div className="space-y-2 mb-10">
              {[
                "Full Brain access — all six intelligence capabilities",
                "Multiple concurrent raises or deal evaluations",
                "Live deal flow matching and investor activity monitoring",
                "Sector trend analysis and valuation benchmarking",
                "Term sheet intelligence with comp data",
                "Persistent context — the Brain remembers your portfolio and thesis",
                "Unlimited queries",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-orange-400 mt-0.5 shrink-0">—</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowEarlyAccess(true)}
              className="rounded-full border border-orange-700/50 bg-orange-950/20 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30"
            >
              Request Early Access
            </button>
          </div>
        </FadeInSection>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="border-t border-zinc-800/50" />
      </div>

      {/* ── Developer (API) ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Developer
              </h2>
              <span className="text-2xl font-bold text-violet-400">
                API pricing
              </span>
            </div>
            <p className="text-sm text-zinc-400 mb-8 max-w-xl">
              Per-call pricing for developers embedding fundraising intelligence
              in their products. Each endpoint has a defined cost. The marginal
              cost is low. The volume potential is enormous.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Per-call pricing — investor match, readiness score, signal read, term analysis",
                "x402 compatible — agents pay per call in USDC, no API key required",
                "LangChain, CrewAI, Claude/MCP, and REST integrations",
                "Build fundraising tools on top of raisefn intelligence",
                "Scales non-linearly — one integration, thousands of calls",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-violet-400 mt-0.5 shrink-0">—</span>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowEarlyAccess(true)}
              className="rounded-full border border-violet-700/50 bg-violet-950/20 px-8 py-3 text-sm font-medium text-violet-300 transition-all hover:border-violet-500 hover:bg-violet-900/30"
            >
              Request Early Access
            </button>
          </div>
        </FadeInSection>
      </section>

      {/* ── Comparison anchor ── */}
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
                  <p
                    key={text}
                    className="text-sm text-zinc-500 flex items-start gap-2"
                  >
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
                  <p
                    key={text}
                    className="text-sm text-zinc-500 flex items-start gap-2"
                  >
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
                  "Founder raise: $2.5K–$7.5K flat",
                  "Professional: $1K/mo",
                  "Live intelligence, not raw data",
                  "Answers, not spreadsheets",
                  "Gets smarter with every raise",
                ].map((text) => (
                  <p
                    key={text}
                    className="text-sm text-zinc-300 flex items-start gap-2"
                  >
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
              Start with the data. Raise with the Brain.
            </h2>
            <p className="text-zinc-500 mb-8">
              The tracker is free and open source. The Brain is where the value
              lives.
            </p>
            <button
              onClick={() => setShowEarlyAccess(true)}
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Request Early Access
            </button>
          </div>
        </FadeInSection>
      </section>

      <EarlyAccessModal open={showEarlyAccess} onClose={() => setShowEarlyAccess(false)} />
    </div>
  );
}
