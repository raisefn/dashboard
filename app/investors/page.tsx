"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

// Marketing v3 — /investors landing.
// Audience: angels, VC partners, family offices, sector-agnostic firms.
// Pitch: deep founder capture + a real thesis-matching engine = qualified
// inbound, not noise. raise(fn) does the deep work the inbound floods of
// today can't.
//
// v1 CTA points to /investors/join (existing signup form). v2 will embed
// the form inline.

/* ── Visual: incoming founder card from investor POV ── */
function ThesisMatchCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">New founder · matches your thesis</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">94% fit</span>
      </div>
      <div className="p-5 space-y-3">
        <div>
          <p className="text-lg font-semibold text-white">OpenBooks AI</p>
          <p className="text-xs text-zinc-500 mt-0.5">B2B SaaS · Seed · Raising $2.5M · San Diego</p>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">MRR</p>
            <p className="text-sm font-semibold text-white">$18K</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Growth</p>
            <p className="text-sm font-semibold text-emerald-400">22% MoM</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Team</p>
            <p className="text-sm font-semibold text-white">2 cofounders · 4 FTE</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Stage</p>
            <p className="text-sm font-semibold text-white">Post-revenue seed</p>
          </div>
        </div>
        <div className="pt-3 border-t border-zinc-800/60">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Why this matches you</p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Sector fit: B2B SaaS + AI. Stage fit: post-revenue seed,
            $2.5M check range. Geo fit: US-based. Lead profile: open to
            participation; no committee required.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Visual: warm intro email from raise(fn) Team to an investor ── */
function WarmIntroCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">From: raise(fn) Team · justin@raisefn.com</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">Warm intro</span>
      </div>
      <div className="px-5 py-3 border-b border-zinc-800/40 space-y-1">
        <div className="flex gap-2 text-[11px]">
          <span className="text-zinc-500 w-12">To</span>
          <span className="text-zinc-300">you@firm.com</span>
        </div>
        <div className="flex gap-2 text-[11px]">
          <span className="text-zinc-500 w-12">Subject</span>
          <span className="text-white font-medium">OpenBooks AI — B2B SaaS seed, matches your thesis</span>
        </div>
      </div>
      <div className="p-5 space-y-3 text-sm">
        <p className="text-zinc-300 leading-relaxed">
          Hi —
        </p>
        <p className="text-zinc-300 leading-relaxed">
          <span className="text-white font-semibold">OpenBooks AI</span> hits your thesis cleanly. B2B SaaS for SMB
          CPAs, $18K MRR, 22% MoM growth, raising a $2.5M seed,
          San Diego based. Two technical cofounders, ex-Big4 audit.
        </p>
        <p className="text-zinc-300 leading-relaxed">
          They&apos;re open to participation checks alongside their lead. I
          pulled together a short brief on them for you:{" "}
          <span className="text-teal-400 underline underline-offset-2">raisefn.com/brief/...</span>
        </p>
        <p className="text-zinc-300 leading-relaxed">
          If interested, reply and I&apos;ll drop you both in the same
          thread.
        </p>
        <p className="text-zinc-400 leading-relaxed">— Justin</p>
        <div className="pt-2 flex gap-2 border-t border-zinc-800/60 mt-2">
          <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-teal-700/40 bg-teal-950/40 text-teal-300 mt-3">
            Interested
          </button>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-md border border-zinc-700/60 bg-zinc-900/40 text-zinc-300 mt-3">
            Read brief
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Visual: pre-qualification / no-scattershot card ── */
function QualityControlCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">This week — founders surfaced to you</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">Quality control</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Founders raising in your sectors</span>
          <span className="text-zinc-300 font-medium">126</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Pass the matching engine (stage + check + geo)</span>
          <span className="text-zinc-300 font-medium">31</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Pass raise(fn) Team quality review</span>
          <span className="text-zinc-300 font-medium">12</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-800/60">
          <span className="text-white font-semibold">Surfaced to you this week</span>
          <span className="text-teal-400 font-semibold text-base">3</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed pt-2 border-t border-zinc-800/60">
          The funnel narrows on purpose. You see the three founders worth
          your time — not 126.
        </p>
      </div>
    </div>
  );
}

/* ── Visual: founder profile depth ── */
function FounderDepthCard() {
  const fields = [
    { label: "Sector intent", value: "AI bookkeeping for SMB CPAs", source: "Deck + clarifying chat" },
    { label: "MRR / growth", value: "$18K · 22% MoM", source: "Auto-extracted from deck" },
    { label: "Burn / runway", value: "$45K/mo · 14 months", source: "Founder profile" },
    { label: "Cofounder split", value: "60 / 40, technical lead", source: "Discovery chat" },
    { label: "Customer profile", value: "20-50 person CPA firms, US", source: "ICP definition" },
    { label: "Current investors", value: "$200K from 4 angels", source: "Pipeline capture" },
    { label: "Stage edge case", value: "Sector-agnostic angels welcome", source: "Founder preference" },
  ];
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Founder depth — captured automatically</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">7 of 14 surfaced</span>
      </div>
      <div className="p-4 space-y-2.5">
        {fields.map((f, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-2.5">
            <div className="shrink-0 w-1 h-1 mt-2 rounded-full bg-teal-400" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500">
                <span className="font-semibold text-zinc-300">{f.label}</span>
                <span className="text-zinc-600"> · {f.source}</span>
              </p>
              <p className="text-sm text-white mt-0.5">{f.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InvestorsPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            For Investors
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6 leading-tight">
            Founders matched to your thesis. Not your inbox.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            raise(fn) does the deep thesis-matching work for you. The
            founders we surface fit the criteria you actually invest in —
            sector, stage, check size, geography, and the edge cases
            most platforms miss.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/investors/join"
              className="rounded-full bg-teal-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-500 shadow-lg shadow-teal-900/30"
            >
              Set up your investor profile
            </Link>
            <Link
              href="/how-we-match"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              How we match →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pillar 1: Deep founder capture ── */}
      <section id="how" className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                01 — Capture
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Founder profiles built by the brain, not by a form.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We don&apos;t ask founders to fill in 47 fields they&apos;ll
                abandon halfway through. The brain captures everything —
                sector intent, MRR, growth rate, team shape, burn, ICP,
                current investors, stage edge cases — by working alongside
                them on the raise.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                The result: founder profiles deep enough to match on real
                criteria, not keyword soup.
              </p>
            </div>
            <div>
              <FounderDepthCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 2: Thesis matching ── */}
      <section className="relative py-20 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                02 — Matching
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Thesis matching, not keyword soup.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                The matching engine handles the cases other platforms break
                on: sector-agnostic firms, participation checks below the
                round size, regional fit beyond &quot;US/EU/Asia&quot;,
                stage edge cases like sector-agnostic angels for vertical
                SaaS founders.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                When a founder hits your thesis, we tell you. Tight matches
                only — no scattershot.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/how-we-match"
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-700/50 bg-teal-950/40 px-4 py-2.5 text-xs font-semibold text-teal-200 hover:bg-teal-900/40 hover:border-teal-600/70 transition-all"
                >
                  How we match
                  <span aria-hidden className="text-teal-400">→</span>
                </Link>
                <Link
                  href="/how-we-learn"
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-700/50 bg-teal-950/40 px-4 py-2.5 text-xs font-semibold text-teal-200 hover:bg-teal-900/40 hover:border-teal-600/70 transition-all"
                >
                  How we learn
                  <span aria-hidden className="text-teal-400">→</span>
                </Link>
              </div>
            </div>
            <div className="md:order-1">
              <ThesisMatchCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 3: Warm intros via raise(fn) Team ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                03 — Warm intros
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Brokered intros, not cold inbound.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                When a founder hits your thesis, the raise(fn) Team writes
                the intro personally — context up front, the brief
                attached, and a clear ask. You reply when interested.
                That&apos;s it.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                You control the volume. We control the quality. No founder
                in our network ever reaches out cold. Your inbox stays
                clean and the people who do reach you arrive pre-qualified.
              </p>
            </div>
            <div>
              <WarmIntroCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 4: Quality control ── */}
      <section className="relative py-20 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                04 — Quality control
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                We narrow the funnel. You hear about the survivors.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Every founder raising in your sectors gets profiled by the
                brain. Most don&apos;t pass the thesis-matching engine.
                The ones who do go through a quality review by raise(fn)
                Team — traction quality, founder coachability, deal
                sanity.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                What lands in your inbox is what survived. Typically a few
                founders a week, not a deluge.
              </p>
            </div>
            <div className="md:order-1">
              <QualityControlCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Differentiation ── */}
      <section className="relative py-20 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-4xl text-center mb-14">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              The difference
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Other platforms make founders push at investors. We make
              founders fit before anyone reaches out.
            </p>
          </div>
          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-5">
                Inbound today
              </p>
              <div className="space-y-3.5">
                {[
                  "1,200 cold emails a quarter, most missing thesis",
                  "Founder profiles padded with marketing fluff",
                  "Generic platforms surfacing every deal to every fund",
                  "No way to filter by stage edge cases",
                  "You spend hours qualifying out, minutes qualifying in",
                ].map((text) => (
                  <p key={text} className="text-sm text-zinc-500 flex items-start gap-3 leading-relaxed">
                    <span className="text-zinc-600 text-lg leading-snug shrink-0">•</span>
                    <span>{text}</span>
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-5">
                raise(fn)
              </p>
              <div className="space-y-3.5">
                {[
                  "Founder profiles built by the brain — deep, structured, honest",
                  "Thesis-matched alerts only when fit is tight",
                  "Stage edge cases handled (sector-agnostic, participation, regional)",
                  "Warm intros brokered by the raise(fn) Team — no cold inbound",
                  "Your inbox stays clean; you spend time on founders who fit",
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

      {/* ── FAQ (cherry-picked from /faq — no FAQPage JSON-LD here; the
           canonical schema lives on /faq) ── */}
      <section className="relative py-20 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-400/80 mb-2">
              Common questions
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
              For investors.
            </h2>
            <div className="space-y-8">
              {[
                {
                  q: "How does raise(fn) help me as an investor?",
                  a: "Surfaces founders that actually match your check behavior — what your portfolio reveals, not what your website says. Hand-curated. No bulk feeds, no daily deal-flow firehose. Quality over volume.",
                },
                {
                  q: "Will founders see me before I want to engage?",
                  a: "No. Investors are invisible to founders by default. No public ratings, no 'passed on' lists, no exposure of who turned down what. Engagement is private and happens only when you signal it.",
                },
                {
                  q: "Can I connect raise(fn) to my own agent?",
                  a: "MCP support coming soon. You'll be able to connect your investor agent directly and have raise(fn) deal flow surface inside your existing workflow — your agent gets the matches, you stay in your tools.",
                },
                {
                  q: "What does raise(fn) cost an investor?",
                  a: "Free, for now. Won't always be — pricing will come once the platform matures. Founders fund the platform today.",
                },
              ].map((qa) => (
                <div key={qa.q}>
                  <h3 className="text-lg font-semibold text-white leading-snug mb-2">
                    {qa.q}
                  </h3>
                  <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                    {qa.a}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/faq"
                className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
              >
                Read the full FAQ →
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Get tighter founder matches.
            </h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Set up your investor profile in 2 minutes. Tell the brain
              your thesis. We&apos;ll surface the founders who fit.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/investors/join"
                className="rounded-full bg-teal-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-500 shadow-lg shadow-teal-900/30"
              >
                Set up your investor profile
              </Link>
              <Link
                href="mailto:team@raisefn.com?subject=raise(fn)%20for%20investors"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Email team@raisefn.com
              </Link>
            </div>
            <p className="mt-6 text-xs text-zinc-500 max-w-md mx-auto">
              No subscription, no setup fee. We coordinate warm intros to
              founders that match your stated thesis.
            </p>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
