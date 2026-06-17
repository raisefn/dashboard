"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

// Marketing — /how-we-learn. Public trust page.
// Comprehensive map of every learning loop in the system. Goal: show that
// raise(fn) gets sharper every time a founder runs a raise, every time an
// investor takes a meeting, every time a deal closes. Not magic — feedback.

/* ── Reusable: loop card with input → output framing ── */
type Loop = {
  title: string;
  input: string;
  output: string;
  accent?: string;
};
function LoopCard({ title, input, output, accent = "#10b981" }: Loop) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 transition-colors">
      <p className="text-sm font-semibold text-white mb-3">{title}</p>
      <div className="space-y-2.5 text-xs leading-relaxed">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">Signal in</span>
          <p className="text-zinc-400 mt-1">{input}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-700">↓</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: accent }}>What gets sharper</span>
          <p className="text-zinc-400 mt-1">{output}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Flywheel visual — five nodes circling a center ── */
function LearningFlywheel() {
  const NODES = [
    { label: "Founders", desc: "Pitch, deck, diligence", color: "#2dd4bf", angle: -90 },
    { label: "Investors", desc: "Yes/no, objections", color: "#a78bfa", angle: -18 },
    { label: "Outcomes", desc: "Met, passed, closed", color: "#fbbf24", angle: 54 },
    { label: "Network", desc: "Warm paths, intros", color: "#22d3ee", angle: 126 },
    { label: "Market", desc: "Cohort benchmarks", color: "#fb923c", angle: 198 },
  ];
  const R = 130;
  const CX = 200;
  const CY = 200;
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden"
         style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Every signal feeds back</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">Flywheel</span>
      </div>
      <div className="p-6">
        <svg viewBox="0 0 400 400" className="w-full h-auto">
          <defs>
            <radialGradient id="learnCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0d9488" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* spokes */}
          {NODES.map((n, i) => {
            const x = CX + R * Math.cos((n.angle * Math.PI) / 180);
            const y = CY + R * Math.sin((n.angle * Math.PI) / 180);
            return (
              <line
                key={`s-${i}`}
                x1={CX}
                y1={CY}
                x2={x}
                y2={y}
                stroke={n.color}
                strokeOpacity="0.3"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
            );
          })}
          {/* outer ring */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#3f3f46" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 6" />
          {/* center */}
          <circle cx={CX} cy={CY} r="70" fill="url(#learnCore)" />
          <circle cx={CX} cy={CY} r="40" fill="#0d9488" fillOpacity="0.12" stroke="#10b981" strokeOpacity="0.7" strokeWidth="1.4" />
          <text x={CX} y={CY - 6} fontSize="13" fill="#e4e4e7" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.05em">
            BETTER
          </text>
          <text x={CX} y={CY + 12} fontSize="13" fill="#e4e4e7" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.05em">
            MATCHES
          </text>
          {/* orbit nodes */}
          {NODES.map((n, i) => {
            const x = CX + R * Math.cos((n.angle * Math.PI) / 180);
            const y = CY + R * Math.sin((n.angle * Math.PI) / 180);
            return (
              <g key={`n-${i}`}>
                <circle cx={x} cy={y} r="32" fill={n.color} fillOpacity="0.08" stroke={n.color} strokeOpacity="0.65" strokeWidth="1.2" />
                <circle cx={x} cy={y} r="6" fill={n.color} fillOpacity="0.95">
                  <animate attributeName="r" values="6;9;6" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </circle>
                <text x={x} y={y - 42} fontSize="11" fill="#e4e4e7" textAnchor="middle" fontFamily="sans-serif" fontWeight="600">
                  {n.label}
                </text>
                <text x={x} y={y - 28} fontSize="9" fill="#71717a" textAnchor="middle" fontFamily="sans-serif">
                  {n.desc}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mt-3 text-xs text-zinc-500 text-center leading-relaxed">
          Each raise sharpens the system for the next.
        </p>
      </div>
    </div>
  );
}

export default function HowWeLearnPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            How we learn
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6 leading-tight">
            Every raise teaches the next one.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            We don&apos;t guess. Every email sent, every meeting taken, every
            term sheet signed, every soft pass — they all feed back into the
            system. The next founder who looks like you gets sharper matches
            because of what we learned from yours.
          </p>
        </div>
      </section>

      {/* ── Flywheel intro ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                The flywheel
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Five feedback loops. One compounding edge.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Founders teach us what works. Investors teach us what they
                actually want. Outcomes — good and bad — teach us where the
                model is off. The network shows us who knows who. Market data
                shows us what&apos;s changing.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Every loop closes back on matching, recommendations, and
                briefs. The product gets sharper the more it&apos;s used.
              </p>
            </div>
            <LearningFlywheel />
          </div>
        </FadeInSection>
      </section>

      {/* ── Category 1: Founder artifacts ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                01 — Founder artifacts
              </p>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                Every email, deck, and conversation teaches the system.
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                When you write an outreach email, iterate a pitch, upload a
                new deck, or log a diligence question — the brain extracts
                structured patterns and benchmarks them against everyone else
                who&apos;s raised in your sector and stage.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <LoopCard
                title="Outreach email patterns"
                input="Founders send cold and warm emails through the brain — subject lines, openings, asks, metrics included."
                output="Cohort response rates by opening style. Next founder sees which subject patterns get replies in their sector."
                accent="#2dd4bf"
              />
              <LoopCard
                title="Pitch narrative iteration"
                input="Founders update their positioning. The brain extracts problem framing, hook style, traction emphasis."
                output="Which framings convert fastest in your sector. Test your next version against what&apos;s already working."
                accent="#2dd4bf"
              />
              <LoopCard
                title="Deck structure evolution"
                input="Each new deck version is parsed: section order, slide count, traction/team inclusion, ask clarity."
                output="Section orderings linked to closed-raise outcomes. The brain points out what&apos;s missing before you go out wide."
                accent="#2dd4bf"
              />
              <LoopCard
                title="Diligence Q&amp;A topics"
                input="Founders log the questions investors ask + how they answered + whether the deal progressed."
                output="The 8 questions investors will ask you, by sector. Which ones swing outcomes vs which ones are noise."
                accent="#2dd4bf"
              />
              <LoopCard
                title="Founder profile snapshot"
                input="qualify_raise captures founder profile: repeat founder, technical, prior exits, current metrics."
                output="&quot;Founders like you in this sector close in 45 days, with 8 term sheets after 150 meetings.&quot;"
                accent="#2dd4bf"
              />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Category 2: Investor behavior ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300 mb-3">
                02 — Investor behavior
              </p>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                What investors actually do — not what they say.
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Investor decks and websites describe an ideal. Their actual
                checks, ghost rates, objections, and resonance themes tell a
                different story. We aggregate the real behavior across every
                founder interaction — privately, no founder attribution — so
                the next founder knows what to expect.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <LoopCard
                title="Commitment rate"
                input="Founders log every status change: met, passed, committed, ghosted, term sheet, invested."
                output="Per-investor commitment rate and avg days to decision. Matching down-weights ghosters; up-weights deciders."
                accent="#a78bfa"
              />
              <LoopCard
                title="Objection playbook"
                input="Founders log key objections after every meeting — &quot;market too small,&quot; &quot;team gap,&quot; &quot;burn rate.&quot;"
                output="Playbook per investor: top objections, how often founders overcame them, what argument worked."
                accent="#a78bfa"
              />
              <LoopCard
                title="What resonated"
                input="Founders log what landed in the room — traction numbers, founder fit, TAM thesis, market timing."
                output="Which positioning angles work with which investors. Tailor the pitch to the audience automatically."
                accent="#a78bfa"
              />
              <LoopCard
                title="Responsiveness tier"
                input="Time-to-meeting, ghost rate, days-to-decision tracked per investor across all interactions."
                output="Highly-responsive / responsive / selective / low-response tier. Outreach sequencing prioritizes responders."
                accent="#a78bfa"
              />
              <LoopCard
                title="Behavioral profile"
                input="Actual check sizes written, lead frequency, follower frequency aggregated across all logged deals."
                output="&quot;This investor writes $50K-$250K, leads 30% of rounds, cares about unit economics&quot; — based on real data."
                accent="#a78bfa"
              />
              <LoopCard
                title="Warm intro paths"
                input="Each founder&apos;s pipeline reveals which investors they have relationships with, at what depth."
                output="When a new match fires, the system surfaces existing warm-intro routes through the network. No double-asks."
                accent="#a78bfa"
              />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Category 3: Cohort + market benchmarks ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                03 — Cohort &amp; market signal
              </p>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                What the market is doing right now — not last quarter.
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Every closed raise and recorded pass becomes data. We compute
                sector cycle trends, average days-to-close, real pass reasons
                — and surface them in the moment so founders calibrate
                expectations against reality.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LoopCard
                title="Timing intelligence"
                input="Closed-at and started-at timestamps from every successful raise, by sector and stage."
                output="&quot;Fintech seed closes accelerated from 120d to 95d this quarter.&quot; Adjust your outreach cadence accordingly."
                accent="#fbbf24"
              />
              <LoopCard
                title="Sector benchmarks"
                input="Closed campaigns: duration, raise amount, # investors contacted, # meetings, # term sheets."
                output="Expected baseline: &quot;45 days, 150 meetings, 8 term sheets for AI seed.&quot; You know if you&apos;re ahead or behind."
                accent="#fbbf24"
              />
              <LoopCard
                title="Live market sentiment"
                input="Pass reasons logged across all active founders in last 30 days, optionally sector-filtered."
                output="Real-time headwinds: &quot;70% of AI investors are skeptical on ROI burn this month — address it early.&quot;"
                accent="#fbbf24"
              />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Category 4: Matching intelligence ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-3">
                04 — Matching intelligence
              </p>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                The matcher gets sharper every week.
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Every new investor profile, every chat-extracted investor
                mention, every hard-no declaration tightens the model.
                See more on{" "}
                <Link href="/how-we-match" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">
                  how we match
                </Link>.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LoopCard
                title="5-dimension scoring"
                input="Founder and investor each tagged across industry, modality, technology, audience, business — coverage measured per dimension."
                output="Specialists in your space outrank generalists. Score reflects actual fit, not keyword overlap."
                accent="#22d3ee"
              />
              <LoopCard
                title="Reverse matching"
                input="When a new investor joins or updates their thesis, the system scans active founders for fit."
                output="Already-raising founders are pinged to admin within minutes of a new investor matching their profile."
                accent="#22d3ee"
              />
              <LoopCard
                title="Chat-extracted investors"
                input="Founders mention investors in conversation — &quot;just got intro from Kaszek,&quot; &quot;meeting Sequoia tomorrow.&quot;"
                output="New investor profiles auto-created. Auto-promoted only when the engagement signal is real (meeting+, committed)."
                accent="#22d3ee"
              />
              <LoopCard
                title="Taxonomy auto-classification"
                input="Investor signup form captures sector_expertise; tracker investors carry descriptions and focus tags."
                output="LLM maps both into the 5-dim ontology. Founder and investor sit in the same coordinate system."
                accent="#22d3ee"
              />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Category 5: Outcome closed-loop ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-3">
                05 — Outcome closed-loop
              </p>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                We measure what worked. Then we adjust.
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Every recommendation eventually has an outcome — met, passed,
                committed, closed. We track recommendation rank against
                actual conversion so the matcher learns which attributes
                predict deals, not just which ones look similar on paper.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LoopCard
                title="Recommendation accuracy"
                input="Every match_investors output is logged with rank; every pipeline status change links back to the recommendation."
                output="Meeting rate and commit rate by recommended rank. Model learns which fit attributes actually predict outcomes."
                accent="#10b981"
              />
              <LoopCard
                title="Campaign close data"
                input="Founder closes the raise: amount, valuation, days-to-close, lead, reason, deal structure, key learnings."
                output="Aggregates roll into sector benchmarks. The closed-raise pattern becomes the template the next founder is matched against."
                accent="#10b981"
              />
              <LoopCard
                title="Raise state progression"
                input="Which tools you use signals what stage you&apos;re in — qualify → match → outreach → analyze terms → close."
                output="Proactive context adapts: meeting prep when meetings are booked, debrief offers after they happen, term-sheet help when you&apos;re negotiating."
                accent="#10b981"
              />
              <LoopCard
                title="Hard-rejection filtering"
                input="Investors declare sectors they&apos;ll never invest in. Founders declare investors they&apos;ve already pitched."
                output="The matcher never re-surfaces pre-rejected pairings. Justin never gets pinged about deals already dead in the water."
                accent="#10b981"
              />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Trust statement ── */}
      <section className="relative py-16 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Privacy by design
              </p>
              <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                Aggregates only. Never individual data.
              </h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                When we tell a new founder &quot;your sector typically takes 45
                days,&quot; we&apos;re showing the cohort average — never a
                specific founder&apos;s raise. Investor behavioral profiles
                are aggregated across founders with thresholds (N≥2) before
                surfacing. No founder can identify another founder&apos;s
                pipeline. No investor sees who else has them in their
                pipeline.
              </p>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
              Run your raise. Sharpen the brain. Help the next founder.
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-10">
              Every raise here teaches the next one. Set yours up now — and
              when you close, the founder who&apos;s next will benefit.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
              >
                Set Up Your Raise
              </Link>
              <Link
                href="/how-we-match"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                ← How we match
              </Link>
            </div>
            <div className="mt-12 pt-8 border-t border-zinc-800/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <Link href="/founders" className="text-zinc-500 hover:text-zinc-300 transition-colors">For founders →</Link>
              <Link href="/investors" className="text-zinc-500 hover:text-zinc-300 transition-colors">For investors →</Link>
              <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 transition-colors">Pricing →</Link>
              <Link href="/roadmap" className="text-zinc-500 hover:text-zinc-300 transition-colors">Roadmap →</Link>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
