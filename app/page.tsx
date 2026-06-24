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

/* ── Execution Demo ── */
function ExecutionDemo() {
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
      setTimeout(() => setStep(1), 400),   // founder question
      setTimeout(() => setStep(2), 1800),  // working indicator
      setTimeout(() => setStep(3), 2800),  // overdue list
      setTimeout(() => setStep(4), 4200),  // founder picks Sarah
      setTimeout(() => setStep(5), 5400),  // draft card appears
      setTimeout(() => setStep(6), 7200),  // founder says send
      setTimeout(() => setStep(7), 8200),  // sent confirmation
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
          <span className="ml-2 text-[11px] text-zinc-600 font-medium tracking-wide">raise(fn) · live</span>
          <span className="ml-auto text-[10px] text-orange-500/60 font-semibold tracking-widest uppercase">agent</span>
        </div>

        <div className="p-5 sm:p-7 space-y-4">
          {/* Founder Q1 */}
          <div
            className="flex justify-end transition-all duration-500"
            style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? "translateY(0)" : "translateY(8px)" }}
          >
            <div className="rounded-2xl bg-orange-950/40 border border-orange-900/40 px-4 py-2.5 max-w-[80%]">
              <p className="text-sm text-zinc-200">who do I owe a reply to?</p>
            </div>
          </div>

          {/* Working indicator */}
          {step === 2 && (
            <div className="flex items-center gap-2 pl-1">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400/70 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400/50 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400/30 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </span>
              <span className="text-[11px] text-zinc-500">scanning your pipeline…</span>
            </div>
          )}

          {/* Agent reply 1: overdue list */}
          {step >= 3 && (
            <div
              className="flex justify-start transition-all duration-500"
              style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? "translateY(0)" : "translateY(8px)" }}
            >
              <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 px-4 py-3 max-w-[88%]">
                <p className="text-sm text-zinc-300 leading-relaxed mb-3">Three replies overdue:</p>
                <div className="space-y-2 mb-3">
                  {[
                    { name: "Sarah Chen", firm: "Greenoak Capital", days: 9, ask: "asked for cohort retention" },
                    { name: "Marcus Hill", firm: "Vault Ventures", days: 6, ask: "wants the deeper financial model" },
                    { name: "Priya Sharma", firm: "Hummingbird Partners", days: 4, ask: "wanted three founder references" },
                  ].map((p) => (
                    <div key={p.name} className="rounded border border-zinc-800/60 bg-zinc-900/30 px-3 py-2 flex items-start gap-3">
                      <span className="shrink-0 mt-1 inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">
                          <span className="text-zinc-200 font-semibold">{p.name}</span>
                          <span className="text-zinc-500"> · {p.firm}</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{p.days} days · {p.ask}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">I drafted all three. Want to look at Sarah&apos;s first?</p>
              </div>
            </div>
          )}

          {/* Founder Q2 */}
          {step >= 4 && (
            <div
              className="flex justify-end transition-all duration-500"
              style={{ opacity: step >= 4 ? 1 : 0, transform: step >= 4 ? "translateY(0)" : "translateY(8px)" }}
            >
              <div className="rounded-2xl bg-orange-950/40 border border-orange-900/40 px-4 py-2.5 max-w-[80%]">
                <p className="text-sm text-zinc-200">yes show me Sarah&apos;s</p>
              </div>
            </div>
          )}

          {/* Agent reply 2: draft card */}
          {step >= 5 && (
            <div
              className="flex justify-start transition-all duration-500"
              style={{ opacity: step >= 5 ? 1 : 0, transform: step >= 5 ? "translateY(0)" : "translateY(8px)" }}
            >
              <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 px-4 py-3 max-w-[88%]">
                <div className="rounded-lg border border-teal-800/40 bg-zinc-950/60 overflow-hidden">
                  <div className="px-3 py-2 border-b border-teal-800/30 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-teal-400">Draft</span>
                    <span className="text-[10px] text-zinc-500">to sarah@greenoak.vc</span>
                  </div>
                  <div className="px-3 py-3 space-y-1.5">
                    <p className="text-[11px] text-zinc-500"><span className="text-zinc-600">Subject —</span> Cohort retention follow-up</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Sarah,<br/>
                      Thanks for the conversation Tuesday. You asked about 3/6/12-month cohort retention from the early-adopter cohort.
                      Here&apos;s the breakdown: <span className="text-zinc-200">87% / 73% / 68% retained.</span> The drop between 3 and 6 months
                      is concentrated in two specific use cases — happy to walk through the segmentation when you have 15 minutes…
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="text-[11px] font-semibold px-3 py-1.5 rounded border border-teal-700/50 bg-teal-950/40 text-teal-300">
                    Approve and send
                  </button>
                  <button className="text-[11px] font-semibold px-3 py-1.5 rounded border border-zinc-800 bg-zinc-900/40 text-zinc-400">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Founder Q3 */}
          {step >= 6 && (
            <div
              className="flex justify-end transition-all duration-500"
              style={{ opacity: step >= 6 ? 1 : 0, transform: step >= 6 ? "translateY(0)" : "translateY(8px)" }}
            >
              <div className="rounded-2xl bg-orange-950/40 border border-orange-900/40 px-4 py-2.5 max-w-[80%]">
                <p className="text-sm text-zinc-200">send it</p>
              </div>
            </div>
          )}

          {/* Agent reply 3: sent confirmation */}
          {step >= 7 && (
            <div
              className="flex justify-start transition-all duration-500"
              style={{ opacity: step >= 7 ? 1 : 0, transform: step >= 7 ? "translateY(0)" : "translateY(8px)" }}
            >
              <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 px-4 py-3 max-w-[88%]">
                <p className="text-sm text-zinc-300 leading-relaxed mb-2">
                  <span className="inline-block mr-1.5 text-teal-400">✓</span>
                  Sent to Sarah at 11:42 AM.
                </p>
                <p className="text-[11px] text-zinc-500">Logged in pipeline · set follow-up check for 7 days · queued the same review for Marcus and Priya.</p>
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
      label: "The Agent",
      headline: "Runs your raise alongside you.",
      interaction: "Match. Brief. Send. Track. Close.",
      desc: "The founder-facing AI fundraising agent. Analyzes your deck, ranks the right investors, drafts briefs and outreach, tracks every reply, debriefs meetings, and closes the round with you. Every raise that runs through it makes the next one sharper — observed-truth data on who actually writes checks, how long they take, and what makes them move.",
      color: "#f97316",
      borderColor: "rgba(249,115,22,0.25)",
      badge: "THE PRODUCT",
      badgeColor: "text-orange-400 border-orange-700/50",
      href: "/founders",
    },
    {
      layer: 3,
      label: "Bring your AI",
      headline: "Connect ChatGPT, Claude, or your own agent.",
      interaction: "Query raise(fn) from anywhere.",
      desc: "Your assistant gets read-access to your raise(fn) data — pipeline, briefs, matches, meeting notes. Ask in natural language; data flows from raise(fn). MCP-compatible. Founders and investors both supported.",
      color: "#a78bfa",
      borderColor: "rgba(167,139,250,0.25)",
      badge: "COMING SOON",
      badgeColor: "text-violet-400 border-violet-700/50",
      href: "/agents",
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
          <p className="mx-auto mt-8 max-w-2xl text-2xl sm:text-3xl font-medium text-white leading-tight">
            The AI Fundraising Agent
          </p>
          <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-400">
            You stay in control. The agent does the work.
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

      {/* ── What we do ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-4">
              What we do
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              <span className="text-white">Match. Brief. Send. Track. Close.</span>
              <br />
              <span className="text-teal-400">One agent for the whole raise.</span>
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-y-7 gap-x-10 sm:grid-cols-2">
            {[
              { verb: "Analyzes", title: "your deck", desc: "Slide-by-slide critique. Narrative gaps. Comp rounds at your stage." },
              { verb: "Matches", title: "you to 17K investors", desc: "Ranked by actual fit. Stage, sector, check size, who's deploying right now." },
              { verb: "Drafts", title: "investor briefs", desc: "One-page founder briefs with your traction, narrative, and ask. Shareable link." },
              { verb: "Drafts", title: "your outreach", desc: "Per-investor angle. Warm-intro path if one exists. Approve and send." },
              { verb: "Preps", title: "every meeting", desc: "Brief on the investor, prior conversation notes, what they'll probe." },
              { verb: "Debriefs", title: "after each call", desc: "Captures what they asked, what they liked, what they passed on. Updates your pipeline." },
              { verb: "Tracks", title: "your pipeline", desc: "Every status, every commitment, every follow-up. Auto-updated from your conversations." },
              { verb: "Closes", title: "the round with you", desc: "Term sheet review. Term comparison. Comms with the room. The whole close." },
            ].map((cap) => (
              <div key={cap.title} className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-1.5 h-1.5 rounded-full bg-teal-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white leading-snug">
                    <span className="text-teal-400">{cap.verb}</span> {cap.title}
                  </p>
                  <p className="text-sm text-zinc-500 leading-relaxed mt-0.5">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Demo ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-4">
              See it work
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              <span className="text-white">The agent doesn&apos;t advise.</span>{" "}
              <span className="text-teal-400">It executes.</span>
            </h2>
          </div>
          <ExecutionDemo />
        </FadeInSection>
      </section>

      {/* ── The Stack ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              How it's built
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              <span className="text-white">The data underneath. The agent on top. Open to other AIs.</span>
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
          <div className="mx-auto max-w-2xl mt-12 text-center">
            <Link
              href="/how-we-learn"
              className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
            >
              How the agent learns →
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
              Founders raising. Investors connecting. Tools building.
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-6 sm:grid-cols-3 text-center">
            {[
              {
                who: "Founders raising",
                what: "The agent runs your raise — matches, briefs, outreach, follow-ups, close. You stay in the room. Use it for your raise, not forever.",
                color: "#2dd4bf",
              },
              {
                who: "Investors connecting",
                what: "Be in the network the agent recommends from. Plug your own ChatGPT or Claude in to query deal flow, draft notes, follow up — your tools, your data.",
                color: "#f97316",
              },
              {
                who: "Tools building",
                what: "MCP-compatible. Embed raise(fn) data + agent capabilities in your product. One connection, full raise coverage.",
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
                what: "The agent runs your raise. Every raise that runs through it makes the next one sharper — observed-truth data on who actually writes checks, how long they take, and what makes them move.",
                color: "#2dd4bf",
              },
              {
                who: "Next",
                what: "Deeper integration with your stack. Gmail and Calendar so the agent sends from your inbox, schedules from your calendar, debriefs from your meetings — your tools, the agent's reach.",
                color: "#a78bfa",
              },
              {
                who: "Then",
                what: "raise(fn) becomes the platform that powers fundraising AI. Any agent, any assistant, queries raise(fn) for the data and intelligence underneath.",
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
              Drop your deck. The agent takes it from there.
            </h2>
            <p className="text-zinc-500 mb-10">
              Free to start. No credit card. The agent gets to work the second you upload.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full border border-orange-700/50 bg-orange-950/30 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/40 hover:text-orange-200"
              >
                Drop your deck →
              </Link>
              <Link
                href="/agents"
                className="rounded-full border border-zinc-700/50 bg-zinc-900/30 px-8 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300"
              >
                Connect your AI
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
