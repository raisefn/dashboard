"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";
import { useEffect, useRef, useState } from "react";
import { generatePositions } from "@/lib/galaxy";

/* ── Diagram nodes ── */
const nodes = [
  { label: "Investor Matching", desc: "", color: "#2dd4bf", active: true },
  { label: "Readiness Eval", desc: "", color: "#34d399", active: true },
  { label: "Narrative Analysis", desc: "", color: "#fbbf24", active: true },
  { label: "Signal Reading", desc: "", color: "#fb923c", active: true },
  { label: "Outreach Guidance", desc: "", color: "#f87171", active: true },
  { label: "Term Sheet Intel", desc: "", color: "#a78bfa", active: true },
  { label: "Pipeline Memory", desc: "", color: "#2dd4bf", active: true },
  { label: "Meeting Ingestion", desc: "", color: "#34d399", active: true },
  { label: "Deal Flow", desc: "", color: "#f97316", active: true },
  { label: "Deal CRM", desc: "", color: "#f97316", active: true },
  { label: "Live Rounds", desc: "", color: "#2dd4bf", active: true },
  { label: "Investor Profiles", desc: "", color: "#fb923c", active: true },
  { label: "Outcome Data", desc: "", color: "#34d399", active: true },
  { label: "Valuation", desc: "", color: "#fbbf24", active: true },
  { label: "Raise Timing", desc: "", color: "#34d399", active: true },
  { label: "Co-investor", desc: "", color: "#a78bfa", active: true },
  { label: "Competitive Intel", desc: "", color: "#f87171", active: true },
  { label: "Behavioral Intel", desc: "", color: "#fb923c", active: true },
  { label: "Portfolio Monitor", desc: "", color: "#2dd4bf", active: true },
];

const positions = generatePositions(nodes.length, 42);
const CX = 400;
const CY = 400;

function BrainDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setScale(Math.min(1, containerRef.current.offsetWidth / 800));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const sorted = nodes
    .map((s, i) => ({ ...s, ...positions[i], index: i }))
    .sort((a, b) => a.depth - b.depth);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[800px] overflow-hidden"
      style={{ height: 800 * scale }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: 800, height: 800,
          position: "absolute",
          left: "50%",
          marginLeft: -400,
        }}
      >
        <svg className="absolute inset-0" width={800} height={800} viewBox="0 0 800 800">
          {sorted.map((node) => (
            <g key={node.index}>
              <line
                x1={node.x} y1={node.y} x2={CX} y2={CY}
                stroke={node.active ? node.color : "#3f3f46"}
                strokeWidth={node.active ? 1.5 * node.size : 0.8 * node.size}
                strokeOpacity={node.active ? 0.2 * node.opacity : 0.06 * node.opacity}
                strokeDasharray={node.active ? "6 4" : "3 6"}
                className="animate-dash"
                style={{ animationDelay: `${node.index * 0.15}s` }}
              />
              <circle
                r={node.active ? 3.5 * node.size : 2 * node.size}
                fill={node.active ? node.color : "#3f3f46"}
                opacity={node.active ? 0.6 * node.opacity : 0.15 * node.opacity}
              >
                <animateMotion
                  dur={`${2.5 + node.index * 0.2}s`}
                  repeatCount="indefinite"
                  path={`M${node.x},${node.y} L${CX},${CY}`}
                />
              </circle>
            </g>
          ))}
        </svg>

        {/* Central node */}
        <div
          className="absolute flex flex-col items-center justify-center rounded-full animate-glow"
          style={{
            width: 180, height: 180,
            left: CX - 90, top: CY - 90,
            background: "radial-gradient(circle, #27272a 0%, #18181b 100%)",
            border: "2px solid #3f3f46",
            zIndex: 50,
          }}
        >
          <span className="text-4xl font-bold">
            <span style={{ color: "#F97316" }}>raise</span>
            <span style={{ color: "#2DD4BF" }}>(fn)</span>
          </span>
          <span className="mt-1 text-xs text-zinc-500">the brain</span>
        </div>

        {/* Nodes */}
        {sorted.map((node) => {
          const w = Math.round(70 + 60 * node.size);
          const h = Math.round(40 + 40 * node.size);
          const fontSize = node.size > 0.7 ? "text-sm" : node.size > 0.4 ? "text-xs" : "text-[10px]";

          return (
            <div
              key={node.index}
              className={`absolute flex flex-col items-center justify-center rounded-xl border animate-float ${
                node.active ? "border-zinc-600/50" : "border-zinc-800/20"
              }`}
              style={{
                width: w, height: h,
                left: node.x - w / 2, top: node.y - h / 2,
                background: `rgba(24,24,27,${0.5 + node.depth * 0.4})`,
                backdropFilter: node.depth > 0.5 ? "blur(8px)" : undefined,
                opacity: node.opacity,
                zIndex: Math.round(node.depth * 40),
                animationDuration: `${node.speed}s`,
                animationDelay: `${node.index * 0.3}s`,
              }}
            >
              <span
                className={`${fontSize} font-semibold leading-tight text-center`}
                style={{ color: node.active ? node.color : "#52525b" }}
              >
                {node.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BrainPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative pt-16 pb-4 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Fundraising intelligence that actually knows what&apos;s happening right now.
            Not trained on old data. Connected to live sources, updated continuously,
            and getting smarter with every raise that runs through it.
          </p>
        </div>
      </section>

      {/* ── 3D Neural Network Diagram ── */}
      <section className="relative py-8 px-4 overflow-hidden">
        <BrainDiagram />
      </section>

      {/* ── What the Brain Does ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Intelligence for every stage of your raise
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-y-8 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Investor Matching", desc: "Who's actively deploying in your sector, ranked by fit. Not a database — a recommendation.", color: "#2dd4bf" },
              { title: "Readiness Evaluation", desc: "Your metrics benchmarked against companies that actually closed. Know before you pitch.", color: "#34d399" },
              { title: "Narrative Analysis", desc: "Is your pitch resonating? What's working in the market right now? Fix it before you send it.", color: "#fbbf24" },
              { title: "Signal Reading", desc: "Investor behavior decoded. What their actions mean, and what to do next.", color: "#fb923c" },
              { title: "Outreach Guidance", desc: "Per-investor strategy. What they care about, who can intro you, what angle lands.", color: "#f87171" },
              { title: "Term Sheet Intel", desc: "Your terms in context. What's standard, what's aggressive, where you have leverage.", color: "#a78bfa" },
            ].map((cap) => (
              <div key={cap.title} className="text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: cap.color }}>
                  {cap.title}
                </p>
                <p className="text-sm text-zinc-500">{cap.desc}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto max-w-3xl mt-10 text-center">
            <Link
              href="/roadmap"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              See the full roadmap &rarr;
            </Link>
          </div>
        </FadeInSection>
      </section>

      {/* ── Your Raise Has a Memory ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <div className="rounded-2xl border border-teal-800/40 px-8 py-12 sm:px-12 sm:py-16" style={{ background: "linear-gradient(180deg, rgba(45,212,191,0.04), rgba(9,9,11,0.98))" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
                The CRM that disappeared
              </p>
              <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl leading-tight mb-6">
                Your raise has a memory.
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed mb-4">
                Every meeting, every investor conversation, every objection, every follow-up — the brain remembers all of it.
                No spreadsheets. No CRM to update. No data entry. Just talk.
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Works for founders managing a raise and investors managing deal flow.
                The CRM didn&apos;t get better — it disappeared into the conversation.
              </p>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── Not a wrapper ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4 text-center">
              Why not just use ChatGPT?
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-12 text-center">
              This isn&apos;t a wrapper on an LLM
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
              <div>
                <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Generic AI</p>
                <div className="space-y-4">
                  {["Training data from 18 months ago", "Public info — what investors say", "No domain calibration", "Forgets everything between sessions", "Generic answers to domain-specific questions"].map((text) => (
                    <p key={text} className="text-sm text-zinc-500 flex items-start gap-2">
                      <span className="text-zinc-600 mt-0.5">—</span>{text}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-6">raise(fn) Brain</p>
                <div className="space-y-4">
                  {["Live data from 290+ sources, updated continuously", "Behavioral data — what investors actually do", "Calibrated on real raise outcomes", "Persistent memory across your entire raise", "Gets smarter with every raise that runs through it"].map((text) => (
                    <p key={text} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-teal-400 mt-0.5">—</span>{text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── The Flywheel ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Every raise makes the next one smarter.
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-8">
            {[
              { title: "Outcome data no one else has", desc: "Every raise that runs through the brain generates signal — who responded, what terms closed, what narratives landed. That data doesn't exist in any training set.", color: "#2dd4bf" },
              { title: "Live calibration, not frozen knowledge", desc: "Connected to 290+ data sources. Investor deployment pace this quarter, sector momentum this month, round terms this week. The answers reflect now.", color: "#fb923c" },
              { title: "Compounding intelligence", desc: "More raises = better recommendations = more raises. The brain gets sharper with use. Competitors start at zero. We start at every raise that came before.", color: "#fbbf24" },
            ].map((item) => (
              <div key={item.title} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Who It's For ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Who it&apos;s for</h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-6 sm:grid-cols-3 text-center">
            {[
              { who: "Founders", what: "Navigate your raise with intelligence — from readiness to close.", color: "#2dd4bf", href: "/brain/entrepreneurs" },
              { who: "Investors", what: "Better deal flow, faster diligence, and a pipeline that remembers everything.", color: "#f97316", href: "/brain/investors" },
              { who: "Developers", what: "Embed fundraising intelligence in your product.", color: "#a78bfa", href: "/sdk" },
            ].map((item) => (
              <Link key={item.who} href={item.href} className="group transition-all hover:bg-zinc-900/30 rounded-xl p-4">
                <p className="text-sm font-semibold mb-2 group-hover:brightness-125" style={{ color: item.color }}>{item.who}</p>
                <p className="text-sm text-zinc-500">{item.what}</p>
                <p className="text-xs mt-3 text-zinc-500 group-hover:text-zinc-300 transition-colors">Learn more &rarr;</p>
              </Link>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">Ready to raise?</h2>
            <p className="text-zinc-500 mb-8">We&apos;re working closely with our first users.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/brain/entrepreneurs" className="rounded-full border border-orange-700/50 bg-orange-950/30 px-8 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/40 hover:text-orange-200">
                I&apos;m a Founder
              </Link>
              <Link href="/brain/investors" className="rounded-full border border-teal-700/50 bg-teal-950/30 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/40 hover:text-teal-200">
                I&apos;m an Investor
              </Link>
              <Link href="/tracker" className="rounded-full border border-zinc-700/50 bg-zinc-900/30 px-8 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300">
                Explore the data
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
