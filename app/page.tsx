"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";

/* ── Concentric radar rings behind hero ── */
function HeroRings() {
  const rings = [
    { r: 80, color: "rgba(249,115,22,0.12)", delay: 0 },
    { r: 140, color: "rgba(45,212,191,0.10)", delay: 0.8 },
    { r: 210, color: "rgba(249,115,22,0.07)", delay: 1.6 },
    { r: 290, color: "rgba(45,212,191,0.05)", delay: 2.4 },
    { r: 380, color: "rgba(249,115,22,0.03)", delay: 3.2 },
  ];

  return (
    <svg
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      width={800}
      height={800}
      viewBox="0 0 800 800"
    >
      {rings.map((ring, i) => (
        <circle
          key={i}
          cx={400}
          cy={400}
          r={ring.r}
          fill="none"
          stroke={ring.color}
          strokeWidth={1.5}
          strokeDasharray="8 6"
          className="animate-dash"
          style={{ animationDelay: `${ring.delay}s` }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <circle
          key={`pulse-${i}`}
          cx={400}
          cy={400}
          r={120}
          fill="none"
          stroke={
            i % 2 === 0
              ? "rgba(249,115,22,0.15)"
              : "rgba(45,212,191,0.15)"
          }
          strokeWidth={1}
          style={{
            transformOrigin: "400px 400px",
            animation: `pulse-ring 4s ease-out ${i * 1.3}s infinite`,
          }}
        />
      ))}
    </svg>
  );
}

/* ── Animated stack diagram ── */
function StackDiagram() {
  const layers = [
    {
      label: "Agent SDK",
      desc: "Your agent calls raise(fn)",
      color: "#a78bfa",
      borderColor: "rgba(167,139,250,0.3)",
      href: "/sdk",
      y: 0,
    },
    {
      label: "Brain",
      desc: "Domain intelligence + pattern recognition",
      color: "#f97316",
      borderColor: "rgba(249,115,22,0.3)",
      href: "/brain",
      y: 120,
    },
    {
      label: "Eyes & Ears",
      desc: "30+ live data sources",
      color: "#2dd4bf",
      borderColor: "rgba(45,212,191,0.3)",
      href: "/tracker",
      y: 240,
    },
  ];

  return (
    <div className="relative mx-auto" style={{ width: 500, height: 340 }}>
      <svg
        className="absolute inset-0 pointer-events-none"
        width={500}
        height={340}
        viewBox="0 0 500 340"
      >
        {[0, 1].map((i) => (
          <g key={i}>
            <line
              x1={250}
              y1={layers[i].y + 56}
              x2={250}
              y2={layers[i + 1].y + 4}
              stroke={layers[i + 1].color}
              strokeWidth={1.5}
              strokeOpacity={0.25}
              strokeDasharray="6 4"
              className="animate-dash"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
            {[0, 1, 2].map((p) => (
              <circle
                key={`particle-${i}-${p}`}
                r={2.5}
                fill={layers[i + 1].color}
                opacity={0.5}
              >
                <animateMotion
                  dur={`${2 + p * 0.5}s`}
                  repeatCount="indefinite"
                  begin={`${p * 0.7}s`}
                  path={`M${230 + p * 20},${layers[i + 1].y + 4} L${230 + p * 20},${layers[i].y + 56}`}
                />
              </circle>
            ))}
          </g>
        ))}
      </svg>

      {layers.map((layer) => (
        <Link
          key={layer.label}
          href={layer.href}
          className="absolute left-0 right-0 flex items-center justify-between rounded-xl border px-8 py-4 transition-all hover:bg-zinc-800/30"
          style={{
            top: layer.y,
            borderColor: layer.borderColor,
            background:
              "linear-gradient(135deg, rgba(24,24,27,0.8), rgba(24,24,27,0.95))",
          }}
        >
          <span
            className="font-semibold text-lg"
            style={{ color: layer.color }}
          >
            {layer.label}
          </span>
          <span className="text-sm text-zinc-500">{layer.desc}</span>
        </Link>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <HeroRings />
        <div className="relative z-10 animate-fade-in">
          <h1 className="text-7xl font-bold tracking-tight sm:text-8xl md:text-9xl">
            <span className="text-orange-500">raise</span>
            <span className="text-teal-400">(fn)</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-zinc-400">
            The intelligence layer for crypto fundraising.
          </p>
          <div className="mt-16 flex justify-center animate-fade-in" style={{ animationDelay: "1s" }}>
            <svg
              className="text-zinc-600 animate-bounce"
              style={{ animationDuration: "2s" }}
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              The problem
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
              Crypto fundraising is{" "}
              <span className="text-orange-500">a black box</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-16">
              Founders pitch the wrong investors. VCs miss deals that fit their
              thesis. Everyone relies on stale data and secondhand advice. The
              information asymmetry is massive — and it costs real money.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { label: "Opaque investors", desc: "Who's actually deploying?" },
                { label: "Fragmented data", desc: "Scattered across 30+ sources" },
                { label: "No live signals", desc: "Stale info, bad timing" },
                { label: "No agent brain", desc: "AI can't help if it can't see" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-sm font-semibold text-white mb-1">
                    {item.label}
                  </p>
                  <p className="text-xs text-zinc-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── The Stack ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              The solution
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Three layers. One stack.
            </h2>
          </div>
          <StackDiagram />
          <div className="mx-auto max-w-3xl mt-12 flex items-center justify-center gap-3">
            <div className="h-8 w-1 bg-teal-400 rounded-full" />
            <p className="text-lg font-semibold text-white">
              &ldquo;The data layer is open. The brain is not.&rdquo;
            </p>
          </div>
        </FadeInSection>
      </section>

      {/* ── What the Brain Does ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-4">
              The brain
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
              Fundraising intelligence, not guesswork
            </h2>
          </div>
          <div className="mx-auto max-w-4xl grid gap-y-6 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Investor Matching", desc: "Ranked by actual fit — sector, stage, activity, check size. Not a directory.", color: "#2dd4bf" },
              { title: "Readiness Evaluation", desc: "Your metrics vs. projects that raised at your stage. Know where you stand.", color: "#34d399" },
              { title: "Narrative Analysis", desc: "Test your pitch against what target investors respond to. Before you send it.", color: "#fbbf24" },
              { title: "Signal Reading", desc: "Decode investor behavior into actionable signals from real pattern data.", color: "#fb923c" },
              { title: "Outreach Guidance", desc: "Who to contact, what angle, who can intro. Per-investor strategy.", color: "#f87171" },
              { title: "Term Sheet Intel", desc: "Market-rate terms for your stage and sector. Know where you have leverage.", color: "#a78bfa" },
              { title: "Valuation Calibration", desc: "What the data actually supports for your stage, sector, and metrics right now.", color: "#38bdf8" },
              { title: "Raise Timing", desc: "Market cycle data, sector momentum, and macro signals. Know when to go out.", color: "#c084fc" },
              { title: "Co-investor Sequencing", desc: "Who to bring in first to create social proof that unlocks the next investor.", color: "#f472b6" },
              { title: "Competitive Raise Intel", desc: "Who else in your sector is raising, at what valuation, with what traction.", color: "#86efac" },
              { title: "Relationship Scoring", desc: "Score every investor on fit, fund cycle, relationship distance, and likelihood to move.", color: "#fde68a" },
              { title: "Pitch Deck Analysis", desc: "Calibrated feedback against what works for your target investors and market.", color: "#67e8f9" },
              { title: "Post-raise Intelligence", desc: "Monitor investor activity, flag follow-on timing, and track portfolio signals.", color: "#fdba74" },
              { title: "Reference Check Intel", desc: "Strategically prepare your reference list — who to put forward and why.", color: "#d946ef" },
              { title: "LP Intelligence", desc: "Who backs which VCs. Mandate, timeline, risk tolerance, reporting requirements.", color: "#bef264" },
            ].map((cap) => (
              <div key={cap.title} className="text-center">
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: cap.color }}
                >
                  {cap.title}
                </p>
                <p className="text-sm text-zinc-500">{cap.desc}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto max-w-3xl mt-12 text-center">
            <Link
              href="/brain"
              className="rounded-full border border-orange-700/50 bg-orange-950/20 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30"
            >
              Learn more about the Brain
            </Link>
          </div>
        </FadeInSection>
      </section>

      {/* ── By the Numbers ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { stat: "6,400+", label: "rounds tracked" },
                { stat: "8,900+", label: "investors profiled" },
                { stat: "30+", label: "data sources" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-5xl font-bold text-teal-400 sm:text-6xl">
                    {item.stat}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Who It's For ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Built for
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Founders. VCs. Agents.
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-6 sm:grid-cols-3 text-center">
            {[
              {
                who: "Founders raising",
                what: "Know who to pitch, when you're ready, and what terms to expect.",
                color: "#2dd4bf",
              },
              {
                who: "VCs sourcing",
                what: "Live deal flow, market signals, and investor activity tracking.",
                color: "#f97316",
              },
              {
                who: "AI agents building",
                what: "Give your agent fundraising intelligence through a single API call.",
                color: "#a78bfa",
              },
            ].map((item) => (
              <div key={item.who}>
                <p
                  className="text-sm font-semibold mb-2"
                  style={{ color: item.color }}
                >
                  {item.who}
                </p>
                <p className="text-sm text-zinc-500">{item.what}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              The data layer is open.
              <br />
              <span className="text-teal-400">The brain is not.</span>
            </h2>
            <p className="text-zinc-500 mb-10">
              Start with the tracker. When you&apos;re ready, the brain is
              waiting.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/tracker"
                className="rounded-full border border-teal-700/50 bg-teal-950/30 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/40 hover:text-teal-200"
              >
                Explore the Tracker
              </Link>
              <a
                href="https://github.com/raisefn/tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
              >
                GitHub
              </a>
              <a
                href="mailto:justinpetsche@gmail.com"
                className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
