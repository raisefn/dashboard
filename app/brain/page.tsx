"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";
import { useEffect, useRef, useState } from "react";
import { generatePositions } from "@/lib/galaxy";

/* ── Status types ── */
type Status = "live" | "building" | "planned";

const statusConfig: Record<Status, { label: string; color: string; bgColor: string; borderColor: string }> = {
  live: { label: "LIVE", color: "#2dd4bf", bgColor: "bg-teal-950/40", borderColor: "border-teal-700/40" },
  building: { label: "IN PROGRESS", color: "#f97316", bgColor: "bg-orange-950/40", borderColor: "border-orange-700/40" },
  planned: { label: "PLANNED", color: "#71717a", bgColor: "bg-zinc-900/40", borderColor: "border-zinc-800/40" },
};

function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${config.bgColor} ${config.borderColor}`}
      style={{ color: config.color }}
    >
      {config.label}
    </span>
  );
}

/* ── All capabilities with 3 states ── */
const allCapabilities = [
  // Live
  { label: "Investor Matching", shortLabel: "Investor\nMatching", desc: "Tell us your stage, sector, and what you're raising. The brain finds investors who are actively deploying right now — ranked by fit, not alphabetically. Not a database search. A reasoned recommendation.", color: "#2dd4bf", status: "live" as Status },
  { label: "Readiness Evaluation", shortLabel: "Readiness\nEval", desc: "Are you actually ready to raise? Your metrics benchmarked against companies that closed at your stage. Gaps identified before investors find them.", color: "#34d399", status: "live" as Status },
  { label: "Narrative Analysis", shortLabel: "Narrative\nAnalysis", desc: "Is your pitch landing? The brain analyzes your narrative against what's resonating in the market right now and tells you where it's strong, where it's weak, and how to fix it.", color: "#fbbf24", status: "live" as Status },
  { label: "Signal Reading", shortLabel: "Signal\nReading", desc: "A fast first reply followed by silence means something. Getting routed to an associate is different than staying with the partner. The brain decodes investor behavior and tells you what to do next.", color: "#fb923c", status: "live" as Status },
  { label: "Outreach Guidance", shortLabel: "Outreach\nGuidance", desc: "Per-investor strategy. What they've funded, what they care about, who can intro you, what angle will land. Specific, not generic.", color: "#f87171", status: "live" as Status },
  { label: "Term Sheet Intelligence", shortLabel: "Term Sheet\nIntel", desc: "Got a term sheet? The brain puts it in context. What's standard for your stage and sector right now, what's aggressive, and where you have leverage.", color: "#a78bfa", status: "live" as Status },
  { label: "Pipeline Memory", shortLabel: "Pipeline\nMemory", desc: "Every meeting, every objection, every follow-up — remembered. Ask 'what did that investor say about our metrics?' and get it back instantly. Your raise has a memory. No spreadsheet required.", color: "#2dd4bf", status: "live" as Status },
  { label: "Meeting Ingestion", shortLabel: "Meeting\nIngestion", desc: "Paste a meeting transcript. The brain extracts every signal, objection, action item, and follow-up — then files it into your pipeline automatically.", color: "#34d399", status: "live" as Status },
  // Building
  { label: "Deal Flow Matching", shortLabel: "Deal Flow\nMatching", desc: "For investors: companies that match your thesis, surfaced from SEC filings, accelerator data, and traction signals — before they hit your inbox.", color: "#f97316", status: "building" as Status },
  { label: "Deal CRM", shortLabel: "Deal\nCRM", desc: "For investors: track every deal, every call, every assessment through conversation. No data entry, no Kanban board. Just talk to the brain and it remembers everything.", color: "#f97316", status: "building" as Status },
  { label: "Pitch Deck Analysis", shortLabel: "Pitch Deck\nAnalysis", desc: "Upload your deck, get feedback calibrated against what works for your target investors and current market conditions. Not generic tips — specific guidance.", color: "#f97316", status: "building" as Status },
  // Planned
  { label: "Valuation Calibration", shortLabel: "Valuation\nCalibration", desc: "What is a defensible valuation given your metrics, sector, and market conditions? What the data actually supports, not what you hope for.", color: "#71717a", status: "planned" as Status },
  { label: "Raise Timing", shortLabel: "Raise\nTiming", desc: "Is now the right time? Market cycle data, sector momentum, and macro signals that tell you whether to go now or wait.", color: "#71717a", status: "planned" as Status },
  { label: "Co-investor Sequencing", shortLabel: "Co-investor\nSequencing", desc: "Who to bring in first to create social proof that unlocks the next investor. Strategic cap table construction.", color: "#71717a", status: "planned" as Status },
  { label: "Competitive Raise Intel", shortLabel: "Competitive\nRaise Intel", desc: "Who else in your sector is raising, at what valuation, with what traction. Real-time competitive intelligence.", color: "#71717a", status: "planned" as Status },
  { label: "Behavioral Intelligence", shortLabel: "Behavioral\nIntel", desc: "Aggregate data from real raises: how fast investors move, what kills their deals, their real commit rates. Intelligence that doesn't exist anywhere else.", color: "#71717a", status: "planned" as Status },
  { label: "Portfolio Monitoring", shortLabel: "Portfolio\nMonitoring", desc: "Passive traction monitoring for your portfolio companies from public signals. Know how they're doing without waiting for quarterly updates.", color: "#71717a", status: "planned" as Status },
  { label: "Post-raise Intelligence", shortLabel: "Post-raise\nIntel", desc: "After the close: monitor investor activity, flag follow-on timing, and prepare for the next round before you need it.", color: "#71717a", status: "planned" as Status },
];

/* ── 3D diagram nodes ── */
const nodes = [
  ...allCapabilities.filter(c => c.status === "live").map(c => ({
    label: c.shortLabel.replace("\n", " "), desc: "", color: c.color, active: true,
  })),
  ...allCapabilities.filter(c => c.status === "building").map(c => ({
    label: c.shortLabel.replace("\n", " "), desc: "", color: "#f97316", active: true,
  })),
  { label: "Live Rounds", desc: "Tracked", color: "#2dd4bf", active: true },
  { label: "Investor Profiles", desc: "Profiled", color: "#fb923c", active: true },
  { label: "Outcome Data", desc: "Calibration", color: "#34d399", active: true },
  ...allCapabilities.filter(c => c.status === "planned").map(c => ({
    label: c.shortLabel.replace("\n", " "), desc: "", color: "#52525b", active: false,
  })),
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
                className={`${fontSize} font-semibold leading-tight`}
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
  const liveCaps = allCapabilities.filter(c => c.status === "live");
  const buildingCaps = allCapabilities.filter(c => c.status === "building");
  const plannedCaps = allCapabilities.filter(c => c.status === "planned");

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
          <div className="flex justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <span className="text-xs text-zinc-400">Live</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-xs text-zinc-400">In progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-zinc-600" />
              <span className="text-xs text-zinc-400">Planned</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3D Neural Network Diagram ── */}
      <section className="relative py-8 px-4 overflow-hidden">
        <BrainDiagram />
      </section>

      {/* ── Live Capabilities ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Live now
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              What the brain can do today
            </h2>
          </div>
          <div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-2">
            {liveCaps.map((cap, i) => (
              <div key={i} className="rounded-xl border border-teal-800/30 bg-teal-950/10 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-sm font-semibold" style={{ color: cap.color }}>
                    {cap.label}
                  </p>
                  <StatusBadge status="live" />
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Building Now ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 mb-4">
              In progress
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              What we&apos;re building right now
            </h2>
          </div>
          <div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {buildingCaps.map((cap, i) => (
              <div key={i} className="rounded-xl border border-orange-800/30 bg-orange-950/10 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-sm font-semibold text-orange-400">
                    {cap.label}
                  </p>
                  <StatusBadge status="building" />
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Planned ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4">
              On the roadmap
            </p>
            <h2 className="text-3xl font-bold text-zinc-500 sm:text-4xl">
              Where this is going
            </h2>
          </div>
          <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plannedCaps.map((cap, i) => (
              <div key={i} className="rounded-xl border border-zinc-800/30 bg-zinc-900/20 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-sm font-semibold text-zinc-500">
                    {cap.label}
                  </p>
                  <StatusBadge status="planned" />
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
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
                Every meeting, every investor conversation, every objection, every follow-up — the brain remembers all of it. Ask a question about your pipeline and get an instant answer. No spreadsheets. No CRM to update. No data entry. Just talk.
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                This works for founders managing their raise and investors managing their deal flow. Same brain, same memory, different context. The CRM didn&apos;t get better — it disappeared into the conversation.
              </p>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ── What Powers It ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Under the hood
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Built on live data, not training data
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-8 sm:grid-cols-2">
            {[
              { title: "Live Tracker Data", desc: "Rounds, investors, and companies cross-referenced from SEC filings, accelerator data, and traction signals. Updated continuously from 290+ sources.", color: "#2dd4bf" },
              { title: "Conversational Memory", desc: "The brain remembers your entire raise — every interaction, assessment, and decision. Query your pipeline history through conversation, not a dashboard.", color: "#a78bfa" },
              { title: "Outcome Calibration", desc: "As more raises run through the system, recommendations get sharper. What worked, what didn't, and why — fed back into every future recommendation.", color: "#fbbf24", building: true },
              { title: "Behavioral Patterns", desc: "How investors actually behave — response timing, decision speed, objection patterns. Aggregated from real founder interactions, anonymized and privacy-first.", color: "#fb923c", building: true },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: item.color }}>{item.title}</p>
                  {item.building && <StatusBadge status="building" />}
                </div>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
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

      {/* ── Who It's For ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">Built for</p>
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
            <p className="text-zinc-500 mb-8">The Brain is in early access. We&apos;re working closely with our first users.</p>
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
