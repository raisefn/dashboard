"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

// /raise-fund landing — audience: fund raisers.
// - Venture GPs raising Fund I / II
// - Real estate developers raising for specific deals
// - Angel syndicate leads scaling to $1-5M SPVs
// - Other capital raisers where the counterparty is LPs, not customers
//
// Voice: agent-first per feedback-raise-agent-not-raise-os. No database
// numbers per feedback-do-not-sell-the-database. Four verbs: target,
// draft, prep, track. Same architecture as /founders, different audience.
export default function RaiseFundPage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-6">
              For fund raisers
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-8">
              The AI agent for your{" "}
              <span className="text-teal-400">fund raise.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-400 leading-relaxed max-w-3xl mx-auto mb-4">
              Target the right LPs. Draft the outreach. Prep the meeting.
              Track the round. Close the fund.
            </p>
            <p className="text-base text-zinc-500 mb-12">
              One agent, whole raise. Chat as the interface. Real work as
              the output.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/raise-fund/join"
                className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-8 py-3 text-base font-semibold text-black hover:bg-teal-400 transition-colors"
              >
                Get started
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-8 py-3 text-base font-semibold text-white hover:border-zinc-500 transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── What it does — the four verbs ── */}
      <section id="how" className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl mb-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              What it does
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              One agent for the whole raise.
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-y-7 gap-x-10 sm:grid-cols-2">
            {[
              {
                verb: "Targets",
                title: "the right LPs",
                desc: "Ranked by actual fit. Fund vintage, sector, ticket size, geo, historical GP-LP relationships.",
              },
              {
                verb: "Drafts",
                title: "LP briefs",
                desc: "Per-LP research on portfolio history, thesis, decision cadence, key contacts.",
              },
              {
                verb: "Drafts",
                title: "your outreach",
                desc: "Personalized per LP archetype. Family office vs endowment vs fund-of-funds — each gets a different angle.",
              },
              {
                verb: "Preps",
                title: "every meeting",
                desc: "Brief on the LP, prior conversation notes, what they'll probe, what to ask them.",
              },
              {
                verb: "Debriefs",
                title: "after each call",
                desc: "Captures sentiment, objections, next step, ticket size signal. Feeds every subsequent meeting.",
              },
              {
                verb: "Tracks",
                title: "your pipeline",
                desc: "Every LP, every stage, every commitment, every follow-up. Auto-updated from your conversations.",
              },
              {
                verb: "Handles",
                title: "the DDQ",
                desc: "Auto-fills from your fund profile + prior answers. You review and send.",
              },
              {
                verb: "Closes",
                title: "the round with you",
                desc: "Term sheet review, side letter negotiation, closing timeline, wire coordination.",
              },
            ].map((cap) => (
              <div key={cap.title} className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-1.5 h-1.5 rounded-full bg-teal-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white leading-snug">
                    <span className="text-teal-400">{cap.verb}</span> {cap.title}
                  </p>
                  <p className="text-sm text-zinc-500 leading-relaxed mt-1">
                    {cap.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Who it's for ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
                Who it's for
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                Built for capital raisers.
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  audience: "Emerging venture managers",
                  scope: "Fund I or II, $5-25M target",
                  desc: "Target the right family offices, endowments, fund-of-funds. Handle DDQs. Track LP pipeline through close.",
                },
                {
                  audience: "Real estate developers",
                  scope: "Specific deals, $1-15M target",
                  desc: "Target LP JV partners and HNW investors. Draft deal memos. Coordinate closing across LPs.",
                },
                {
                  audience: "Angel syndicate leads",
                  scope: "SPVs, $1-5M target",
                  desc: "Target the right backers for the specific deal. Coordinate the SPV close. Track investor commitments.",
                },
              ].map((seg) => (
                <div
                  key={seg.audience}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6"
                >
                  <p className="text-lg font-semibold text-white">
                    {seg.audience}
                  </p>
                  <p className="text-sm text-teal-400 mt-1">{seg.scope}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed mt-4">
                    {seg.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Positioning tagline ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
              raise(fn) knows the LP.
              <br />
              <span className="text-teal-400">Your CRM knows the contact.</span>
              <br />
              <span className="text-zinc-500">Both are true.</span>
            </p>
            <p className="text-base text-zinc-500 leading-relaxed max-w-2xl mx-auto mt-8">
              raise(fn) is the intelligence + workflow layer for your fund
              raise. It runs the actions — targeting, drafting, prepping,
              tracking — with LP-specific context. Your existing CRM stays
              your system of record if you want. Or you don't need one at
              all: the agent tracks the pipeline in chat.
            </p>
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-6">
              Start raising your fund.
            </h2>
            <p className="text-base text-zinc-400 mb-8">
              5-minute signup. No credit card. The agent starts running as
              soon as you finish.
            </p>
            <Link
              href="/raise-fund/join"
              className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-10 py-4 text-base font-semibold text-black hover:bg-teal-400 transition-colors"
            >
              Get started
            </Link>
          </div>
        </FadeInSection>
      </section>
    </main>
  );
}
