"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";
import { useEffect, useRef, useState } from "react";

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

/* ── Brain Demo ── */
function BrainDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timers = [
      setTimeout(() => setStep(1), 400),   // question appears
      setTimeout(() => setStep(2), 1800),  // thinking
      setTimeout(() => setStep(3), 2800),  // readiness
      setTimeout(() => setStep(4), 3600),  // investors
      setTimeout(() => setStep(5), 4400),  // strategy
    ];
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  return (
    <div ref={ref} className="mx-auto max-w-3xl">
      <div
        className="rounded-2xl border border-zinc-800 overflow-hidden"
        style={{ background: "linear-gradient(180deg, rgba(24,24,27,0.95), rgba(9,9,11,0.98))" }}
      >
        {/* Header bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800/80">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </div>
          <span className="ml-2 text-[11px] text-zinc-600 font-medium tracking-wide">raise(fn) brain</span>
          <span className="ml-auto text-[10px] text-orange-500/60 font-semibold tracking-widest uppercase">live</span>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          {/* Question */}
          <div
            className="transition-all duration-700"
            style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? "translateY(0)" : "translateY(8px)" }}
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">Q</span>
              <p className="text-sm text-zinc-300 leading-relaxed">
                We&apos;re building an AI code review platform. $1.8M ARR, 45% MoM growth, 2,400 GitHub stars,
                npm package at 52K weekly downloads. We want to raise a $12M Series A.
                <span className="text-white font-medium"> Are we actually ready? What&apos;s the strongest way to position this, and what are we not seeing?</span>
              </p>
            </div>
          </div>

          {/* Thinking indicator */}
          {step === 2 && (
            <div className="flex items-center gap-2 pl-8">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500/60 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500/40 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500/20 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </span>
              <span className="text-[11px] text-zinc-500">benchmarking against 1,847 dev-tools Series As from the last 24 months...</span>
            </div>
          )}

          {/* Response */}
          {step >= 3 && (
            <div className="space-y-5 pl-8">
              {/* Readiness Evaluation */}
              <div
                className="transition-all duration-700"
                style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? "translateY(0)" : "translateY(8px)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Readiness evaluation</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 font-semibold">READY — WITH FLAGS</span>
                </div>
                {/* Metric benchmarks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {[
                    { metric: "ARR", value: "$1.8M", percentile: "top 18%", status: "strong" },
                    { metric: "Growth", value: "45% MoM", percentile: "top 4%", status: "flag" },
                    { metric: "Dev adoption", value: "52K/wk npm", percentile: "top 11%", status: "strong" },
                    { metric: "Community", value: "2,400 stars", percentile: "top 22%", status: "moderate" },
                  ].map((m) => (
                    <div key={m.metric} className="rounded border border-zinc-800/50 bg-zinc-900/20 px-3 py-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{m.metric}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          m.status === "strong" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/30" :
                          m.status === "flag" ? "bg-amber-950/50 text-amber-400 border border-amber-800/30" :
                          "bg-zinc-800/50 text-zinc-400 border border-zinc-700/30"
                        }`}>{m.percentile}</span>
                      </div>
                      <span className="text-sm font-semibold text-zinc-200">{m.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  <span className="text-amber-400 font-medium">Growth flag:</span> 45% MoM is exceptional
                  but only 2 months sustained. Of dev-tools companies that showed 40%+ growth
                  for &lt;3 months, <span className="text-zinc-200">61% saw it moderate to 15–25% by month 4.</span>{" "}
                  Investors will probe this hard. Prepare the cohort curve and leading indicators
                  that suggest this holds — daily active users, expansion revenue, or usage frequency.
                </p>
              </div>

              {/* Narrative Analysis */}
              <div
                className="transition-all duration-700"
                style={{ opacity: step >= 4 ? 1 : 0, transform: step >= 4 ? "translateY(0)" : "translateY(8px)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-3">Narrative analysis</p>
                <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-4 py-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/50 text-red-400 border border-red-800/30 font-semibold">WEAK FRAME</span>
                    <span className="text-xs text-zinc-400">&quot;AI code review platform&quot;</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    14 companies pitched &quot;AI code review&quot; in the last 6 months. 3 raised. Category is crowded
                    and the framing triggers pattern matching against CodeRabbit, Codium, and Qodo.
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 font-semibold">STRONGER FRAME</span>
                    <span className="text-xs text-zinc-400">&quot;Developer workflow intelligence&quot;</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Your npm adoption data tells a different story — developers are using this <span className="text-zinc-200">inside CI/CD pipelines,
                    not just for reviews.</span> That&apos;s infrastructure, not tooling. Infrastructure companies
                    raised at <span className="text-zinc-200">1.8x higher valuations</span> than point solutions in this sector last quarter. Reframe around
                    where the usage actually lives.
                  </p>
                </div>
              </div>

              {/* Signal reading */}
              <div
                className="transition-all duration-700"
                style={{ opacity: step >= 5 ? 1 : 0, transform: step >= 5 ? "translateY(0)" : "translateY(8px)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">What you&apos;re not seeing</p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  <span className="text-zinc-200">Two competitors in your space filed Form Ds in the last 45 days</span> —
                  one for $8M (Seed extension), one for $18M (Series A). The $18M raise hasn&apos;t been
                  announced yet. This creates urgency: investors who passed on those deals are actively
                  looking for an alternative bet in this category right now. But it also means you&apos;ll be
                  compared on metrics. Your npm traction is <span className="text-zinc-200">3x stronger</span> than
                  both — lead with that.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Animated stack diagram ── */
function StackDiagram() {
  const layers = [
    {
      layer: 1,
      label: "Eyes & Ears",
      headline: "How the Brain knows what it knows.",
      interaction: "The data layer.",
      desc: "SEC filings, accelerator directories, investor registries, traction signals — standardized, cross-referenced, and updated continuously. Free and open source.",
      color: "#2dd4bf",
      borderColor: "rgba(45,212,191,0.25)",
      badge: "OPEN SOURCE",
      badgeColor: "text-teal-400 border-teal-700/50",
      href: "/tracker",
    },
    {
      layer: 2,
      label: "The Brain",
      headline: "Fundraising intelligence for your raise.",
      interaction: "Every conversation builds the dataset.",
      desc: "Every raise that runs through it — the meetings, the passes, the ghosting, the terms, the close — becomes data. Not announcements. Not press releases. What actually happened, from the founder's side. That dataset doesn't exist anywhere else. And every raise makes the next one sharper: which investors actually write checks at your stage, how long they take, what makes them pass, and what makes them move — then calibrates on what actually worked, not what sounded right in training data.",
      color: "#f97316",
      borderColor: "rgba(249,115,22,0.25)",
      badge: "THE PRODUCT",
      badgeColor: "text-orange-400 border-orange-700/50",
      href: "/brain",
    },
    {
      layer: 3,
      label: "Developer SDK",
      headline: "For tools that embed fundraising intelligence.",
      interaction: "Build on it.",
      desc: "REST API and native integrations for LangChain, CrewAI, and Claude. Build fundraising intelligence into your product with a single call. x402 native — agents discover and pay autonomously, no key required.",
      color: "#a78bfa",
      borderColor: "rgba(167,139,250,0.25)",
      badge: "OPEN SOURCE",
      badgeColor: "text-violet-400 border-violet-700/50",
      href: "/sdk",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {layers.map((layer, i) => (
        <Link
          key={layer.label}
          href={layer.href}
          className="group relative block rounded-xl border px-6 py-5 sm:px-8 sm:py-6 transition-all hover:bg-zinc-800/20"
          style={{
            borderColor: layer.borderColor,
            background:
              "linear-gradient(135deg, rgba(24,24,27,0.7), rgba(24,24,27,0.95))",
            minHeight: 130,
          }}
        >
          <div className="flex items-start gap-5 sm:gap-6">
            {/* Layer badge */}
            <div
              className="shrink-0 flex items-center justify-center rounded-lg text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 mt-0.5"
              style={{
                color: layer.color,
                border: `1px solid ${layer.borderColor}`,
                background: "rgba(24,24,27,0.8)",
              }}
            >
              Layer {layer.layer}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline flex-wrap gap-x-2 mb-1">
                <span
                  className="text-lg font-bold sm:text-xl"
                  style={{ color: layer.color }}
                >
                  {layer.label}
                </span>
                <span className="text-zinc-400 text-sm font-medium">
                  — {layer.headline}
                </span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                <span className="text-zinc-400 font-medium">
                  {layer.interaction}
                </span>{" "}
                {layer.desc}
              </p>
            </div>

            {/* Badge */}
            <span
              className={`shrink-0 hidden sm:inline-block rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${layer.badgeColor}`}
            >
              {layer.badge}
            </span>
          </div>

          {/* Animated connecting line between layers */}
          {i < layers.length - 1 && (
            <svg
              className="absolute left-1/2 -bottom-4 -translate-x-1/2 pointer-events-none"
              width={2}
              height={16}
              viewBox="0 0 2 16"
            >
              <line
                x1={1}
                y1={0}
                x2={1}
                y2={16}
                stroke={layers[i + 1].color}
                strokeWidth={1.5}
                strokeOpacity={0.2}
                strokeDasharray="4 3"
                className="animate-dash"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            </svg>
          )}
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
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="text-orange-500">raise</span>
            <span className="text-teal-400">(fn)</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-zinc-400">
            Fundraising intelligence that gets smarter with every raise.
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

      {/* ── Brain Demo ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-4">
              See it work
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              <span className="text-white">Ask a real question.</span>{" "}
              <span className="text-teal-400">Get a real answer.</span>
            </h2>
          </div>
          <BrainDemo />
        </FadeInSection>
      </section>

      {/* ── The Stack ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              How it works
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              <span className="text-white">The tool founders never had. Now they do.</span>
            </h2>
          </div>
          <StackDiagram />
        </FadeInSection>
      </section>

      {/* ── Competitive Positioning ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              The difference
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              <span className="text-white">Data platforms are rearview mirrors.</span>
              <br />
              <span className="text-teal-400">This is GPS.</span>
            </h2>
          </div>
          <div className="mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">
                Rearview mirror
              </p>
              <div className="space-y-4">
                {[
                  "Pay $20K–$50K/yr to search a database",
                  "Build your own target list in a spreadsheet",
                  "Stale data — no idea who's deploying right now",
                  "Same list your competitor is building",
                  "You are the analyst",
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
              <p className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-6">
                raise(fn)
              </p>
              <div className="space-y-4">
                {[
                  "\"Who should lead my Series A?\" — 15 ranked matches",
                  "Live data — who's deploying this quarter, not last year",
                  "Flags your metrics are weak before you pitch",
                  "Sequences outreach so the right investor moves first",
                  "The analyst is built in",
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

      {/* ── The Flywheel ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-4">
              The flywheel
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              <span className="text-white">Every raise makes the next one</span>{" "}
              <span className="text-teal-400">smarter.</span>
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-10">
            {[
              {
                title: "More founders raise → real outcome data",
                desc: "Every raise generates data no model can train on — who responded, who passed, who led, what terms closed. The Brain calibrates on results. That dataset doesn't exist anywhere else, and every raise that runs through raise(fn) makes it smarter for the next one.",
                color: "#2dd4bf",
              },
              {
                title: "More data sources → harder to replicate",
                desc: "SEC filings, accelerator directories, investor registries, traction platforms — each with custom ingestion, normalization, and cross-referencing logic. Copying one source is easy. Copying the intelligence that emerges from combining them is not.",
                color: "#fb923c",
              },
              {
                title: "Persistent context → switching costs",
                desc: "The Brain remembers your raise — metrics, investor conversations, pitch iterations. Walk away and you start from zero somewhere else.",
                color: "#a78bfa",
              },
              {
                title: "Tool integrations → infrastructure lock-in",
                desc: "Once a product embeds raise(fn) for fundraising intelligence, it becomes infrastructure. Ripping out a working API is a cost nobody pays voluntarily.",
                color: "#fbbf24",
              },
            ].map((item) => (
              <div key={item.title} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
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
          <div className="mx-auto max-w-3xl grid gap-y-8 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Investor Matching", desc: "Ranked by actual fit — sector, stage, activity, check size. Not a directory.", color: "#2dd4bf" },
              { title: "Signal Reading", desc: "Decode investor behavior into actionable signals from real pattern data.", color: "#fb923c" },
              { title: "Term Sheet Intel", desc: "Market-rate terms for your stage and sector. Know where you have leverage.", color: "#a78bfa" },
              { title: "Readiness Evaluation", desc: "Your metrics vs. projects that raised at your stage. Know where you stand.", color: "#34d399" },
              { title: "Competitive Raise Intel", desc: "Who else in your sector is raising, at what valuation, with what traction.", color: "#86efac" },
              { title: "Outreach Guidance", desc: "Who to contact, what angle, who can intro. Per-investor strategy.", color: "#f87171" },
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
          <p className="mx-auto max-w-3xl mt-10 text-center text-sm text-zinc-600">
            Plus narrative analysis, valuation calibration, co-investor sequencing, pitch deck analysis, LP intelligence, and more.
          </p>
          <div className="mx-auto max-w-3xl mt-8 text-center">
            <Link
              href="/brain"
              className="rounded-full border border-orange-700/50 bg-orange-950/20 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30"
            >
              See all 15 capabilities
            </Link>
          </div>
        </FadeInSection>
      </section>

      {/* ── Data backing ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <div className="rounded-2xl border border-teal-800/40 px-8 py-12 sm:px-12 sm:py-16" style={{ background: "linear-gradient(180deg, rgba(45,212,191,0.04), rgba(9,9,11,0.98))" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-3">
                The data layer
              </p>
              <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl leading-tight mb-8">
                raise(fn) tracks every startup funding round in real time across 290+ sources.
              </h2>
              <p className="text-lg text-zinc-300 leading-relaxed mb-2">
                No AI model has this data. It doesn&apos;t exist in any training set.
              </p>
              <p className="text-xl text-teal-400 font-semibold">
                It&apos;s live, it&apos;s comprehensive, and it&apos;s the foundation everything else is built on.
              </p>
              <div className="mt-10 pt-8 border-t border-teal-800/30 grid grid-cols-3 gap-4">
                {[
                  { value: "290+", label: "Live sources" },
                  { value: "Real-time", label: "No delays, no batches" },
                  { value: "Ground truth", label: "The data AI models don't have" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-zinc-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
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
              Founders raising. Tools building. Investors deploying.
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-6 sm:grid-cols-3 text-center">
            {[
              {
                who: "Founders raising",
                what: "Know who to pitch, when you're ready, and what terms to expect. Use it for your raise, not forever.",
                color: "#2dd4bf",
              },
              {
                who: "Tools building",
                what: "Embed fundraising intelligence in your product. One API, full raise coverage.",
                color: "#a78bfa",
              },
              {
                who: "Investors deploying",
                what: "Source deals, benchmark terms, track competitive dynamics, and monitor portfolio signals — all from live data.",
                color: "#f97316",
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

      {/* ── Where This Goes ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-4">
              Where this goes
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              From tool to infrastructure.
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-8 sm:grid-cols-3 text-center">
            {[
              {
                who: "Today",
                what: "Founders use raise(fn) directly. The Brain knows your market, your investors, and your raise.",
                color: "#2dd4bf",
              },
              {
                who: "Tomorrow",
                what: "Your AI assistant calls raise(fn) on your behalf. Same intelligence, agent-mediated.",
                color: "#a78bfa",
              },
              {
                who: "The future",
                what: "Agents raise capital autonomously. raise(fn) is the context layer the whole ecosystem runs on.",
                color: "#f97316",
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
              Ready to raise?
            </h2>
            <p className="text-zinc-500 mb-10">
              The Brain is in early access. Get in before it opens.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/brain/entrepreneurs"
                className="rounded-full border border-orange-700/50 bg-orange-950/30 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/40 hover:text-orange-200"
              >
                Start Your Raise
              </Link>
              <Link
                href="/tracker"
                className="rounded-full border border-zinc-700/50 bg-zinc-900/30 px-8 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300"
              >
                Explore the data
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800/30 py-6 px-4">
        <div className="mx-auto max-w-3xl flex justify-center gap-6">
          <Link
            href="/privacy"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/thesis"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Our thesis
          </Link>
        </div>
      </footer>
    </div>
  );
}
