"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

// Marketing — /how-we-match. Public trust page.
// Walks through matching ARCHITECTURE without revealing weights, multipliers,
// thresholds, or anything implementation-specific. The pitch: matching is
// principled (5 angles, not keywords) AND curated (human brokers every intro).

/* ── Hero neural network — 5 dim nodes feeding a central Match node ── */
function MatchNeuralDiagram() {
  // Coordinates chosen so the layout reads left → right as a "signal flow"
  // from the 5 dimensions into the central Match node.
  const DIMS = [
    { label: "Industry", color: "#2dd4bf", y: 60 },
    { label: "Modality", color: "#34d399", y: 130 },
    { label: "Technology", color: "#22d3ee", y: 200 },
    { label: "Audience", color: "#a78bfa", y: 270 },
    { label: "Business", color: "#fb923c", y: 340 },
  ];
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden"
         style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Match signal flow</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">Live</span>
      </div>
      <div className="p-6">
        <svg viewBox="0 0 600 400" className="w-full h-auto">
          <defs>
            <radialGradient id="matchCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#0d9488" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </radialGradient>
            {DIMS.map((d, i) => (
              <linearGradient key={i} id={`edge-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={d.color} stopOpacity="0.0" />
                <stop offset="40%" stopColor={d.color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={d.color} stopOpacity="0.2" />
              </linearGradient>
            ))}
          </defs>
          {/* edges */}
          {DIMS.map((d, i) => (
            <g key={`e-${i}`}>
              <path
                d={`M 120 ${d.y} C 280 ${d.y}, 360 200, 470 200`}
                stroke={`url(#edge-${i})`}
                strokeWidth="1.6"
                fill="none"
              />
              <circle r="3" fill={d.color} opacity="0.85">
                <animateMotion
                  dur={`${2 + i * 0.4}s`}
                  repeatCount="indefinite"
                  path={`M 120 ${d.y} C 280 ${d.y}, 360 200, 470 200`}
                />
                <animate attributeName="opacity" values="0;0.85;0" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
          {/* dim nodes */}
          {DIMS.map((d, i) => (
            <g key={`n-${i}`}>
              <circle cx="120" cy={d.y} r="34" fill={d.color} fillOpacity="0.08" stroke={d.color} strokeOpacity="0.6" strokeWidth="1" />
              <circle cx="120" cy={d.y} r="8" fill={d.color} fillOpacity="0.9" />
              <text x="60" y={d.y + 4} fontSize="12" fill="#a1a1aa" textAnchor="end" fontFamily="sans-serif" fontWeight="500">
                {d.label}
              </text>
            </g>
          ))}
          {/* central match node */}
          <circle cx="470" cy="200" r="60" fill="url(#matchCore)" />
          <circle cx="470" cy="200" r="34" fill="#0d9488" fillOpacity="0.15" stroke="#10b981" strokeOpacity="0.8" strokeWidth="1.4" />
          <circle cx="470" cy="200" r="6" fill="#10b981">
            <animate attributeName="r" values="6;10;6" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <text x="470" y="280" fontSize="13" fill="#e4e4e7" textAnchor="middle" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.05em">
            MATCH
          </text>
        </svg>
        <p className="mt-2 text-xs text-zinc-500 text-center leading-relaxed">
          Every match is the convergence of five distinct signals — not a sector keyword.
        </p>
      </div>
    </div>
  );
}

/* ── Visual: specialty vs generalist comparison ── */
function SpecialtyCard() {
  const rows = [
    { label: "Specialist investor", focus: "Legal + Enterprise SaaS", focusCount: 2, score: 9.7, accent: "#10b981" },
    { label: "Focused generalist", focus: "Enterprise SaaS + 4 others", focusCount: 5, score: 7.2, accent: "#fbbf24" },
    { label: "Broad generalist", focus: "12 sectors listed", focusCount: 12, score: 5.4, accent: "#71717a" },
  ];
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden"
         style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">For a Legal AI seed founder</span>
        <span className="text-[10px] text-teal-500/60 font-semibold tracking-widest uppercase">Ranked</span>
      </div>
      <div className="p-4 space-y-2.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
            <div className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: r.accent }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{r.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{r.focus}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums" style={{ color: r.accent }}>{r.score.toFixed(1)}</p>
              <p className="text-[10px] text-zinc-600">match score</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-zinc-800/80 text-xs text-zinc-500">
        Narrow focus = stronger signal. Generalists with 10 listed sectors get filtered down, not up.
      </div>
    </div>
  );
}

/* ── Visual: hard-no exclusion ── */
function HardNoCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden"
         style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">Investor preferences honored</span>
        <span className="text-[10px] text-rose-400/70 font-semibold tracking-widest uppercase">Hard no</span>
      </div>
      <div className="p-5 space-y-3">
        <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
          <p className="text-xs text-zinc-500 mb-2">Investor signal</p>
          <p className="text-sm text-white">
            &quot;I&apos;d invest in almost anything — but not crypto, not hardware, not consumer brands.&quot;
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">Excluded</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-rose-700/40 bg-rose-950/40 text-rose-300">crypto_web3</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-rose-700/40 bg-rose-950/40 text-rose-300">hardware</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-rose-700/40 bg-rose-950/40 text-rose-300">consumer</span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          A founder in any of these sectors will never reach this investor — even if every other dimension lines up.
          We don&apos;t waste anyone&apos;s time on deals already pre-rejected.
        </p>
      </div>
    </div>
  );
}

/* ── Visual: human curation step ── */
function CurationCard() {
  const steps = [
    { state: "done", label: "Algorithm identifies fit across 5 dimensions" },
    { state: "done", label: "Specialty and hard-no filters applied" },
    { state: "active", label: "Justin reviews and decides if it warrants a warm intro" },
    { state: "future", label: "Warm intro brokered personally — never auto-fired" },
  ];
  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden"
         style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <span className="text-[11px] text-zinc-500 font-medium tracking-wide">From signal to intro</span>
        <span className="text-[10px] text-amber-400/70 font-semibold tracking-widest uppercase">Human</span>
      </div>
      <div className="p-5 space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold"
                 style={{
                   borderColor: s.state === "done" ? "#10b981" : s.state === "active" ? "#fbbf24" : "#3f3f46",
                   backgroundColor: s.state === "done" ? "#10b98120" : s.state === "active" ? "#fbbf2420" : "transparent",
                   color: s.state === "done" ? "#10b981" : s.state === "active" ? "#fbbf24" : "#52525b",
                 }}>
              {s.state === "done" ? "✓" : s.state === "active" ? "•" : i + 1}
            </div>
            <p className={`text-sm ${s.state === "future" ? "text-zinc-600" : "text-zinc-300"}`}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HowWeMatchPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative py-24 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            How we match
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-6 leading-tight">
            Five signals. One conviction.
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            A keyword search gets you 800 results. We get you eight investors
            who actually write your check — by looking at the deal from five
            angles, not one.
          </p>
        </div>
      </section>

      {/* ── Pillar 1: Five dimensions ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                01 — Five dimensions
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Sector tags don&apos;t describe deals. Five dimensions do.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Every company exists at the intersection of five distinct
                dimensions: the <span className="text-teal-300">industry</span> it
                operates in, the <span className="text-emerald-300">modality</span>
                {" "}it uses to deliver value, the{" "}
                <span className="text-cyan-300">technology</span> it&apos;s built on,
                the <span className="text-violet-300">audience</span> it sells to,
                and the <span className="text-orange-300">business model</span> it
                runs on.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                A consumer marketplace is not the same as a B2B marketplace.
                AI-powered legal tech is not the same as AI-powered consumer apps.
                We score every founder and every investor across all five — so
                the matches reflect how investors actually think about a deal,
                not how a database categorizes it.
              </p>
            </div>
            <div>
              <MatchNeuralDiagram />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 2: Specialty over generic ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
                02 — Specialty signal
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Specialists outrank generalists. By design.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                An investor with a narrow, focused thesis is a stronger signal
                than a generalist with twelve listed sectors. So we reward
                focus.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                If you&apos;re building legal tech, a Legal+SaaS specialist
                outscores a generic SaaS investor — even if both have you in
                their nominal sweet spot. Conviction matters. Focus is how we
                measure it.
              </p>
            </div>
            <div className="md:order-1">
              <SpecialtyCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 3: Hard nos ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-300 mb-3">
                03 — Hard nos
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Pre-rejected matches never surface.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                When an investor tells us what they&apos;d never invest in, we
                listen. No crypto means no crypto — even if the founder ticks
                every other box.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Founders don&apos;t waste pitches on dead ends. Investors
                don&apos;t get pinged about deals they&apos;ve already ruled
                out. Time stays where it converts.
              </p>
            </div>
            <div>
              <HardNoCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 4: Proprietary network ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                04 — Proprietary network
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                The names you won&apos;t find anywhere else.
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Public investor data is a starting point. The deeper value is
                the network of angels, family offices, and operator-investors
                who&apos;ve agreed to hear from us when a fit shows up.
              </p>
              <p className="text-zinc-400 leading-relaxed mt-4">
                We don&apos;t surface those names publicly. We broker the intro
                ourselves when the match is real.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { stat: "5 dimensions", body: "Industry, modality, technology, audience, business model — scored independently." },
                { stat: "Specialty weighted", body: "Focused investors outscore broad generalists when their narrow thesis fits." },
                { stat: "Human-brokered", body: "Every warm intro is curated by a person who knows both sides." },
              ].map((c) => (
                <div key={c.stat} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <p className="text-sm font-semibold text-white mb-2">{c.stat}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Pillar 5: Human curation ── */}
      <section className="relative py-20 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                05 — Human in the loop
              </p>
              <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
                Every warm intro is brokered by a human.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                The algorithm surfaces signal. We turn signal into intros. No
                auto-fired emails. No spammed inboxes. No investor gets pinged
                without us deciding it&apos;s worth their attention.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                That&apos;s what makes the proprietary network sustainable —
                investors stay opted in because we never abuse the channel.
              </p>
            </div>
            <div className="md:order-1">
              <CurationCard />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
              See what fits your raise.
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-10">
              Set up your raise in five minutes. We&apos;ll surface the
              investors who actually write your check — and the warm-intro
              candidates nobody else will name.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
              >
                Set Up Your Raise
              </Link>
              <Link
                href="/how-we-learn"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                How we learn →
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
