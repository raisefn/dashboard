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
          <div className="mt-12 flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <Link
              href="/signup"
              className="rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
            >
              Set up your agent →
            </Link>
            <p className="text-xs text-zinc-500">Free to start.</p>
          </div>
          <div className="mt-12 flex justify-center animate-fade-in" style={{ animationDelay: "1.2s" }}>
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

      {/* ── The Six Moves — editorial vertical rows ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-4">
              What the agent does
            </p>
            <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl leading-tight">
              <span className="text-white">Six moves.</span>{" "}
              <span className="text-teal-400">One conversation.</span>{" "}
              <span className="text-white">Whole raise.</span>
            </h2>
          </div>

          <div className="mx-auto max-w-5xl">
            {[
              {
                num: "01",
                verb: "Understand",
                desc: "Captures your raise from conversation. Company or fund, metrics or thesis, team, story, ask — all as you talk. No forms, no dashboards.",
                color: "#2dd4bf",
              },
              {
                num: "02",
                verb: "Sharpen",
                desc: "Where the pitch leaks, where the materials break, where the ask is fuzzy. The agent flags the weak points before you go out.",
                color: "#34d399",
              },
              {
                num: "03",
                verb: "Identify",
                desc: "Ranks the right targets by real check behavior, not website copy. Sector, stage, geo, cadence, historical fit — all layered.",
                color: "#fbbf24",
              },
              {
                num: "04",
                verb: "Outreach",
                desc: "Drafts personalized outreach per target. Approve and send from your Gmail. Every reply captured, every thread tracked.",
                color: "#fb923c",
              },
              {
                num: "05",
                verb: "Run",
                desc: "Preps every meeting, captures every debrief, keeps every follow-up on time. The pipeline updates itself as you work.",
                color: "#f87171",
              },
              {
                num: "06",
                verb: "Close",
                desc: "Term sheet or side letter walkthrough. Structural flags. Close-day coordination. All the way through to signed docs.",
                color: "#a78bfa",
              },
            ].map((move, i) => (
              <div
                key={move.num}
                className={`grid grid-cols-12 gap-6 sm:gap-10 items-center py-12 sm:py-16 ${
                  i > 0 ? "border-t border-zinc-800/60" : ""
                }`}
              >
                {/* Giant number — design element, not a label */}
                <div className="col-span-4 sm:col-span-3">
                  <span
                    className="block text-6xl sm:text-8xl lg:text-9xl font-black leading-none tracking-tight"
                    style={{ color: move.color, opacity: 0.9 }}
                  >
                    {move.num}
                  </span>
                </div>

                {/* Verb + description */}
                <div className="col-span-8 sm:col-span-9">
                  <h3
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight"
                  >
                    {move.verb}
                  </h3>
                  <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
                    {move.desc}
                  </p>
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

      {/* ── Why the agent exists: the truth + competitor knockouts ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Why the agent exists
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl mb-6">
              <span className="text-white">Most rounds die in the follow-up.</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              The pitch is 10% of the raise. The pipeline is 90%. The boring 90% is where rounds get killed — slow follow-ups, missed signals, dropped threads, sloppy debriefs.
              <span className="text-zinc-200"> The agent runs the 90%.</span> You handle the 10%.
            </p>
          </div>

          <div className="mx-auto max-w-3xl mt-20">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold sm:text-3xl">
                <span className="text-white">No other tool runs the 90%.</span>
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { tool: "A CRM (Streak, HubSpot, Affinity)", knockout: "Tracks what you've already done. Doesn't decide what to do next." },
                { tool: "A database (PitchBook, Crunchbase)", knockout: "Hands you a list. You write the messages and run the pipeline." },
                { tool: "ChatGPT", knockout: "Will draft you anything. Doesn't know your investors or your pipeline." },
                { tool: "DocSend", knockout: "Tells you who opened the deck. Doesn't tell you what to send next." },
                { tool: "A spreadsheet + Gmail", knockout: "The default. Falls apart by investor 30." },
              ].map((row) => (
                <div
                  key={row.tool}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6"
                >
                  <p className="text-sm font-semibold text-white sm:w-64 shrink-0">{row.tool}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed flex-1">{row.knockout}</p>
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
              Founders raising. Investors raising. Agents connecting.
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-6 sm:grid-cols-3 text-center">
            {[
              {
                who: "Founders raising",
                what: "The agent runs your raise — matches, briefs, outreach, follow-ups, close. Persistent memory across sessions. Sharper the next raise, sharper the one after.",
                color: "#2dd4bf",
              },
              {
                who: "Investors raising",
                what: "Venture GPs, real estate developers, syndicate leads — the agent targets the right investors, briefs you on every one, handles the DDQ, tracks pipeline through close.",
                color: "#f97316",
              },
              {
                who: "Agents connecting",
                what: "MCP-compatible. Plug your own ChatGPT or Claude into your raise(fn) data — query your pipeline, draft the follow-up, run the raise from your tools.",
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
              Set up your agent. It takes it from there.
            </h2>
            <p className="text-zinc-500 mb-2">
              Free to start. No credit card. Tell the agent what you&apos;re building — it gets to work the second you finish. Drop a deck if you have one.
            </p>
            <p className="text-zinc-600 text-sm mb-10">
              Your deck stays private. Never shared. Never used to train.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full border border-orange-700/50 bg-orange-950/30 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/40 hover:text-orange-200"
              >
                Set up your agent →
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

    </div>
  );
}
