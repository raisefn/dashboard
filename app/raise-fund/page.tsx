"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

// /raise-fund landing — audience: capital raisers.
// - Venture GPs raising Fund I / II
// - Real estate developers raising for specific deals
// - Angel syndicate leads scaling to $1-5M SPVs
// - Other capital raisers where the counterparty is LPs, not customers
//
// Voice: agent-first per feedback-raise-agent-not-raise-os. No database
// numbers per feedback-do-not-sell-the-database. Same four verbs as
// /founders (target, draft, prep, track), applied to LPs. Visual quality
// mirrors /founders — LP match card, brief preview, pipeline card.
// All LP names fictional per marketing rule.

/* ── Visual: LP match output mock card (GP POV) ── */
function LPMatchCard() {
  const lps = [
    { name: "Meridian Family Office", tag: "Family office", color: "#2dd4bf", note: "Direct venture $1-3M · SEA + US · engaged with 2 prior emerging managers" },
    { name: "Grant Halloway", tag: "HNW · ex-operator", color: "#34d399", note: "10-15 first-time GP checks/yr · $250-500K · thesis fit" },
    { name: "Blackpine Endowment", tag: "Endowment", color: "#fbbf24", note: "Emerging manager program · $2-5M · reviewing Q3" },
    { name: "Northgate Fund of Funds", tag: "FoF", color: "#fb923c", note: "Fund I-II bets · $3-8M · portfolio gap in your sector" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Top investor targets — Fund II, $18M target</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">Live</span>
      </div>
      <div className="p-4 space-y-2.5">
        {lps.map((lp, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
            <div className="shrink-0 w-2 h-2 mt-2 rounded-full" style={{ backgroundColor: lp.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-white">{lp.name}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold border" style={{ color: lp.color, backgroundColor: `${lp.color}10`, borderColor: `${lp.color}30` }}>
                  {lp.tag}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{lp.note}</p>
            </div>
            <button className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-md border border-teal-700/40 bg-teal-950/40 text-teal-300">
              Generate brief
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Visual: LP pipeline memory snippet ── */
function LPPipelineCard() {
  const items = [
    { name: "Grant Halloway", status: "Soft commit $500K — waiting on side letter", color: "#34d399", last: "2h ago" },
    { name: "Meridian (Alice Chen)", status: "Second meeting Thu — wants portfolio deep-dive", color: "#2dd4bf", last: "1d ago" },
    { name: "Blackpine Endowment", status: "DDQ submitted — under review", color: "#fbbf24", last: "3d ago" },
    { name: "Northgate FoF", status: "Passed — wants $50M+ funds", color: "#71717a", last: "1w ago" },
  ];
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Investor pipeline — Captured as you work</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">4 open</span>
      </div>
      <div className="p-4 space-y-2.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-2.5">
            <div className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: it.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{it.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{it.status}</p>
            </div>
            <span className="shrink-0 text-[10px] text-zinc-600">{it.last}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Visual: LP brief preview — clipped excerpt of the brief the
   agent generates for a specific LP. Same shape as founder brief:
   header → stat table → why fits → history → key contacts → what
   to bring, then faded to imply more. Fictional LP. ── */
function LPBriefPreviewCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Investor brief · Confidential</span>
        <span className="text-[10px] text-teal-400/70 font-semibold tracking-widest uppercase">Tailored</span>
      </div>
      <div className="relative">
        <div className="p-5 space-y-4 text-sm">
          {/* Title block — LP + one-line positioning */}
          <div>
            <h3 className="text-base font-bold text-white">Meridian Family Office</h3>
            <p className="text-zinc-400 text-xs mt-1 leading-snug">
              Single-family office · Direct venture allocation · SEA + US emerging managers.
            </p>
          </div>

          {/* Stat table — type / AUM / ticket / geo / cadence */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3 text-[11px]">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Type</span>
              <span className="text-zinc-200 font-medium">Family office</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Ticket</span>
              <span className="text-zinc-200 font-medium">$1-3M</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Geo</span>
              <span className="text-zinc-200 font-medium">SEA + US</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Cadence</span>
              <span className="text-zinc-200 font-medium">2-3 GP bets/yr</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Decision</span>
              <span className="text-zinc-200 font-medium">4-6 weeks</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[9px] mb-0.5">Last close</span>
              <span className="text-zinc-200 font-medium">Q1 (Fund I)</span>
            </div>
          </div>

          {/* Why we think this fits */}
          <div className="border-t border-zinc-800/60 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-teal-400/80 mb-1.5">Why we think this fits</p>
            <p className="text-zinc-300 leading-relaxed text-[13px]">
              Backed two emerging managers in the last 18 months — both Fund I, both SEA-anchored. Your Fund II geo overlap is direct. Ticket band lines up cleanly with your $18M target close ($2M anchor slot open). They&apos;ve historically favored operator-turned-GPs.
            </p>
          </div>

          {/* History */}
          <div className="border-t border-zinc-800/60 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Recent GP bets</p>
            <ul className="space-y-1.5 text-zinc-300 text-[13px]">
              <li className="flex gap-2">
                <span className="text-zinc-600">›</span>
                <span><span className="text-white font-semibold">Cardinal Ventures I</span> — $2M anchor · 2025 · SEA fintech</span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-600">›</span>
                <span><span className="text-white font-semibold">Halo Capital I</span> — $1.5M · 2024 · US B2B infra</span>
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-600">›</span>
                <span>Both cited &quot;operator background&quot; as a top reason. Your profile mirrors this.</span>
              </li>
            </ul>
          </div>

          {/* Key contacts */}
          <div className="border-t border-zinc-800/60 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Key contacts</p>
            <ul className="space-y-1.5 text-zinc-300 text-[13px]">
              <li className="flex gap-2">
                <span className="text-teal-400/80">·</span>
                <span><span className="text-white font-semibold">Alice Chen</span> — Principal, direct venture. Runs GP diligence end-to-end.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-400/80">·</span>
                <span><span className="text-white font-semibold">Marcus Reeve</span> — CIO. Final sign-off. Prefers a 30-min intro call before diligence.</span>
              </li>
            </ul>
          </div>

          {/* What to bring — faded, implies more below */}
          <div className="border-t border-zinc-800/60 pt-4 pb-2 opacity-60">
            <p className="text-[10px] uppercase tracking-wider text-orange-400/80 mb-2">What to bring</p>
            <p className="text-zinc-300 leading-relaxed text-[13px]">
              Portfolio construction slide with SEA/US split. Detailed operator background page. Ballpark check schedule for Fund II first close.
            </p>
          </div>
        </div>

        {/* Fade-out — implies the brief continues */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-20"
          style={{
            background:
              "linear-gradient(180deg, rgba(9,9,11,0) 0%, rgba(9,9,11,0.95) 80%, rgba(9,9,11,1) 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* ── Capability grid — everything else the agent handles for a
   fund raise ── */
const CAPABILITIES = [
  { icon: "🎯", name: "Targets the right investors", desc: "Family offices, endowments, HNWs, JV partners, syndicate backers — ranked by ticket, geo, cadence, historical fit." },
  { icon: "🔎", name: "Researches every investor", desc: "Prior bets, decision process, key contacts, side-letter patterns." },
  { icon: "✉️", name: "Writes and sends outreach", desc: "Per-archetype — family office vs endowment vs HNW each get a different angle." },
  { icon: "📅", name: "Books the investor meetings", desc: "Drafts the invite, confirms with you, fires it into Google Calendar." },
  { icon: "🎤", name: "Preps you for every meeting", desc: "Six-section briefing per investor: fit angle, likely questions, portfolio construction asks." },
  { icon: "🗒️", name: "Captures the debrief", desc: "Sentiment, objections, ticket-size signal, next step — nothing lost between calls." },
  { icon: "📋", name: "Handles the DDQ", desc: "Auto-fills from your fund profile and prior answers. You review and send." },
  { icon: "📜", name: "Closes with you", desc: "Side letter review, closing timeline, wire coordination. All the way to close." },
];

function CapabilityGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CAPABILITIES.map((c) => (
        <div
          key={c.name}
          className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 transition-colors"
        >
          <div className="text-xl mb-3">{c.icon}</div>
          <p className="text-sm font-semibold text-white mb-1.5">{c.name}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{c.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function RaiseFundPage() {
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
            The agent that runs your fund raise alongside you.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            raise(fn) targets the right investors, drafts the outreach, briefs
            you on every conversation, tracks your commitments, and coordinates
            the close. You take the calls. The agent runs the rest.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/raise-fund/join"
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Set up your agent →
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              See pricing →
            </Link>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            30-second signup. No credit card.
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            Your fund materials stay private. Never shared. Never used to train.
          </p>
        </div>
      </section>

      {/* ── Pillar 1: LP targeting ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                01 — Targeting
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Investors who actually anchor your raise.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Not a flat directory of every family office and endowment. The
                agent takes your fund or deal shape, sector, geo, and operator
                background, then sources and ranks investors whose ticket band,
                cadence, and historical fit actually match.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Family offices allocating quietly, endowment emerging-manager
                programs, HNW anchor investors, JV partners for deal-by-deal
                raises, syndicate members for SPVs, fund-of-funds open to
                Fund I / II.
              </p>
            </div>
            <div>
              <LPMatchCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 2: LP pipeline + memory ── */}
      <section className="relative py-20 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                02 — Memory
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Every conversation. Every commitment. Never lost.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                The agent captures every meeting, soft commit, side-letter ask,
                and next step as you work. No CRM to keep clean. No prior
                DDQ answers to hunt for at midnight before a second meeting.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Come back tomorrow, the agent knows where you left off with
                every investor. Come back after the close, it remembers for
                the next raise.
              </p>
            </div>
            <div className="md:order-1">
              <LPPipelineCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 3: LP briefs ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                03 — Briefs
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Investor briefs in minutes, not weekends.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                The agent writes a one-page brief tailored to any investor —
                how they allocate, what they&apos;ve backed, why this could
                fit, and who makes the call. Use them to prep meetings, ground
                your intro email, or send to your placement agent.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Works for investors the agent surfaced — and for anyone you
                already know. Drop in a name, get a brief.
              </p>
            </div>
            <div>
              <LPBriefPreviewCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Capability grid — everything else the agent does ── */}
      <section className="relative py-24 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                Everything else
              </p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4 leading-tight">
                The whole fund raise. In one agent.
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Targeting, briefs, and memory are the headline acts. Every
                other part of running a fund raise lives in the same agent.
              </p>
            </div>
            <CapabilityGrid />
          </div>
        </FadeInSection>
      </section>

      {/* ── Who it's for ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
                Who it&apos;s for
              </p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
                Built for capital raisers.
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Same architecture, different investor archetype. The agent adapts to
                the raise you&apos;re actually running.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  audience: "Emerging venture managers",
                  scope: "Fund I or II · $5-25M target",
                  desc: "Target the right family offices, endowments, and fund-of-funds. Handle DDQs. Track LP pipeline through close.",
                },
                {
                  audience: "Real estate developers",
                  scope: "Deal-by-deal · $1-15M target",
                  desc: "Target JV partners and HNW investors for the specific deal. Draft deal memos. Coordinate closing across the cap stack.",
                },
                {
                  audience: "Angel syndicate leads",
                  scope: "SPVs · $1-5M target",
                  desc: "Target the right backers for the specific deal. Coordinate the SPV close. Track investor commitments.",
                },
              ].map((seg) => (
                <div
                  key={seg.audience}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 hover:border-zinc-700 transition-colors"
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

      {/* ── Differentiation row ── */}
      <section className="relative py-24 px-4 bg-zinc-950/40">
        <FadeInSection>
          <div className="mx-auto max-w-4xl text-center mb-14">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              The difference
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Other tools point at investors. raise(fn) runs the raise.
            </p>
          </div>
          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-5">
                Most investor databases
              </p>
              <div className="space-y-3.5">
                {[
                  "Long list of investors with no signal on who's active for your kind of raise",
                  "Generic decks and templates you rewrite anyway",
                  "DDQ answers scattered across drives, prior raises, and your head",
                  "Re-explain your raise to every associate on the diligence call",
                  "No memory of what worked last time",
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
                  "Investors ranked by actual fit — ticket, geo, cadence, historical bets",
                  "Briefs and outreach tailored per investor archetype",
                  "Pipeline captured automatically as you talk to the agent",
                  "Memory across sessions — pick up where you left off with anyone",
                  "Gets sharper as more raises run through it",
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

      {/* ── Positioning tagline ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
              raise(fn) knows the investor.
              <br />
              <span className="text-teal-400">Your CRM knows the contact.</span>
              <br />
              <span className="text-zinc-500">Both are true.</span>
            </p>
            <p className="text-base text-zinc-500 leading-relaxed max-w-2xl mx-auto mt-8">
              raise(fn) is the intelligence and workflow layer for your fund
              raise. It runs the actions — targeting, drafting, prepping,
              tracking — with investor-specific context. Your existing CRM stays
              your system of record if you want. Or you don&apos;t need one at
              all: the agent tracks the pipeline in chat.
            </p>
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
                  q: "What is raise(fn) for investors?",
                  a: "The AI agent for your fund raise. If you're a venture GP raising Fund I or II, a real estate developer raising for a specific deal, or a syndicate lead running an SPV — raise(fn) targets the right investors, drafts the outreach, briefs you on every conversation, handles the DDQ, and tracks the pipeline through close. Same conversational surface founders use, adapted to how capital raises actually run.",
                },
                {
                  q: "Who is raise(fn) for on the investor side?",
                  a: "Emerging venture managers raising Fund I or II ($5-25M targets). Real estate developers raising for specific deals or funds ($1-15M target). Angel syndicate leads running SPVs ($1-5M target). Broadly, anyone raising capital where the counterparty is LPs, JV partners, or backers — not customers.",
                },
                {
                  q: "How is raise(fn) different from an LP database or a placement agent?",
                  a: "LP databases hand you a list. You still do the targeting, the outreach, the briefs, the DDQs, the follow-ups. Placement agents charge success fees and control the process — you get less leverage as the raise unfolds. raise(fn) runs the raise with you. Targeting, briefs, meeting prep, pipeline, DDQ, close — one conversation. No success fee, no equity, fixed pricing.",
                },
                {
                  q: "Will my LPs / investors see me on the platform?",
                  a: "No. raise(fn) is your working environment, not a marketplace. Your LPs and investors are never exposed to the platform — they get personal outreach and materials from you (drafted by the agent, sent through your tools). No public directory of raises, no cross-fund visibility. Your raise stays confidential.",
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
              Set up your agent. It takes it from there.
            </h2>
            <p className="text-zinc-400 mb-2 max-w-xl mx-auto">
              30-second signup. No credit card. The agent asks the rest in chat.
            </p>
            <p className="text-zinc-500 text-sm mb-8 max-w-xl mx-auto">
              Your fund materials stay private. Never shared. Never used to train.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/raise-fund/join"
                className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
              >
                Set up your agent →
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                See pricing →
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
