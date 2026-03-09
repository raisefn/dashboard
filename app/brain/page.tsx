"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";
import { useEffect, useRef, useState } from "react";

/* ── All capabilities ── */
/* v1 = true means shipping in V1 (shown in color) */
/* v1 = false means future (shown in greyscale) */
const allCapabilities = [
  // V1 — the core six
  { label: "Investor Matching", shortLabel: "Investor\nMatching", desc: "Given stage, sector, traction, and round size — surface which investors are actively deploying, who has a portfolio gap the project fills, who has relevant co-investors already in the cap table, and who moves fast at this stage. A live, ranked, reasoned recommendation.", color: "#2dd4bf", v1: true },
  { label: "Readiness Evaluation", shortLabel: "Readiness\nEval", desc: "Before reaching out, assess whether you're actually ready. What metrics do investors in this category expect? Where do you sit relative to benchmarks? What are the leverage points and vulnerabilities? Prevents burning your best relationships before you're ready.", color: "#34d399", v1: true },
  { label: "Narrative Analysis", shortLabel: "Narrative\nAnalysis", desc: "Is the pitch framed correctly for your target investors? What's resonating in the market right now? What do comparable raises say about positioning? Calibrated against current market conditions from the Eyes & Ears.", color: "#fbbf24", v1: true },
  { label: "Signal Reading", shortLabel: "Signal\nReading", desc: "A fast reply followed by a slow second response means something. Being routed to an associate in week one is different than week three. The brain decodes investor behavior in real time — what it means and what to do next.", color: "#fb923c", v1: true },
  { label: "Outreach Guidance", shortLabel: "Outreach\nGuidance", desc: "Specific guidance for a specific investor — what they've funded, what they've said publicly, what sectors they're looking at, who can introduce you, what angle will land. Fed by live behavioral data from the Eyes & Ears.", color: "#f87171", v1: true },
  { label: "Term Sheet Intelligence", shortLabel: "Term Sheet\nIntel", desc: "When a term sheet arrives, contextualize it against current market data. What's standard for this stage and sector right now? What's aggressive? What's a red flag? Where is there leverage? Intelligence that normally costs $500/hour.", color: "#a78bfa", v1: true },
  // Future capabilities
  { label: "Valuation Calibration", shortLabel: "Valuation\nCalibration", desc: "Given your metrics, sector, stage, and market conditions — what is a defensible valuation? Not what you want, not what you heard — what the data actually supports right now.", color: "#71717a", v1: false },
  { label: "Raise Timing", shortLabel: "Raise\nTiming", desc: "Is now actually a good time to raise? Market cycle data, sector momentum, recent comparable closes, and macro signals — the kind of judgment that saves founders from dead windows.", color: "#71717a", v1: false },
  { label: "Co-investor Sequencing", shortLabel: "Co-investor\nSequencing", desc: "Who to bring in first to create social proof that unlocks the next investor. Map relationships and sequence cap table construction strategically.", color: "#71717a", v1: false },
  { label: "Competitive Raise Intel", shortLabel: "Competitive\nRaise Intel", desc: "Who else in your sector is raising right now, at what valuation, with what traction. Information that changes your strategy in real time.", color: "#71717a", v1: false },
  { label: "Investor Relationship Scoring", shortLabel: "Relationship\nScoring", desc: "Score every investor on your target list — portfolio fit, fund cycle timing, relationship distance, recent activity, likelihood to move fast.", color: "#71717a", v1: false },
  { label: "Pitch Deck Analysis", shortLabel: "Pitch Deck\nAnalysis", desc: "Upload your deck, get calibrated feedback against what works for your target investor list and current market conditions. Not generic — specific.", color: "#71717a", v1: false },
  { label: "Post-raise Intelligence", shortLabel: "Post-raise\nIntel", desc: "Monitor investor portfolio activity, flag when investors raise new funds, identify when follow-on conversations should start based on milestones.", color: "#71717a", v1: false },
  { label: "Reference Check Intel", shortLabel: "Reference\nCheck", desc: "When investors ask for references — help prepare the list strategically. Who to put forward, what narrative each should reinforce.", color: "#71717a", v1: false },
  { label: "LP Intelligence", shortLabel: "LP\nIntelligence", desc: "Who backs which VCs? Understanding LP composition tells you about mandate, timeline, risk tolerance, and reporting requirements.", color: "#71717a", v1: false },
];

/* ── 3D diagram nodes — V1 capabilities + data inputs + future capabilities ── */
const nodes = [
  // V1 capabilities (active, colored)
  ...allCapabilities.filter(c => c.v1).map(c => ({
    label: c.shortLabel.replace("\n", " "), desc: c.label.split(" ").slice(-1)[0], color: c.color, active: true,
  })),
  // Data inputs (active, colored)
  { label: "Live Rounds", desc: "2M+ tracked", color: "#2dd4bf", active: true },
  { label: "Investor Profiles", desc: "500K+ profiled", color: "#fb923c", active: true },
  { label: "Co-Investment", desc: "Network graphs", color: "#a78bfa", active: true },
  { label: "Outcome Data", desc: "Calibration", color: "#34d399", active: true },
  // Future capabilities (inactive, will render greyscale)
  ...allCapabilities.filter(c => !c.v1).map(c => ({
    label: c.shortLabel.replace("\n", " "), desc: "", color: "#52525b", active: false,
  })),
];

// Seeded pseudo-random for consistent layout
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function generatePositions(count: number) {
  const positions: {
    x: number; y: number; depth: number;
    size: number; opacity: number; speed: number;
  }[] = [];

  for (let i = 0; i < count; i++) {
    const seed = i * 7 + 42;
    const angle = seededRandom(seed) * Math.PI * 2;
    const dist = 160 + seededRandom(seed + 1) * 240;
    const depth = seededRandom(seed + 2);
    const depthScale = 0.3 + depth * 0.7;

    positions.push({
      x: 400 + Math.cos(angle) * dist * (0.7 + depth * 0.3),
      y: 400 + Math.sin(angle) * dist * (0.7 + depth * 0.3),
      depth, size: depthScale,
      opacity: 0.25 + depth * 0.75,
      speed: 3 + (1 - depth) * 4,
    });
  }
  return positions;
}

const positions = generatePositions(nodes.length);
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
      className="relative mx-auto w-full max-w-[800px]"
      style={{ height: 800 * scale }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: 800, height: 800,
          position: "relative",
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
          const descSize = node.size > 0.7 ? "text-xs" : "text-[10px]";

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
              {node.size > 0.4 && node.desc && (
                <span
                  className={`${descSize} mt-0.5 leading-tight`}
                  style={{ color: node.active ? undefined : "#3f3f46" }}
                >
                  {node.desc}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BrainPage() {
  const v1Caps = allCapabilities.filter(c => c.v1);
  const futureCaps = allCapabilities.filter(c => !c.v1);

  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* ── Hero ── */}
      <section className="relative pt-16 pb-4 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The brain knows which investors are actively deploying in your
            sector, whether your metrics are strong enough to raise, and what
            terms you should expect. Built on thousands of real rounds and
            investor profiles — updated continuously, calibrated on
            outcomes, and accessible through a single API call.
          </p>
        </div>
      </section>

      {/* ── 3D Neural Network Diagram ── */}
      <section className="relative py-8 px-4 overflow-hidden">
        <BrainDiagram />
        <p
          className="mx-auto max-w-lg text-center text-base text-zinc-400 animate-fade-in"
          style={{ animationDelay: "0.3s", marginTop: -20 }}
        >
          Live capabilities in color. Future capabilities in grey.
        </p>
      </section>

      {/* ── V1 Capabilities ── */}
      <section className="relative py-32 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              V1 Capabilities
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Six ways to raise smarter
            </h2>
          </div>
          <div className="mx-auto max-w-4xl grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {v1Caps.map((cap, i) => (
              <div key={i} className="text-center px-2">
                <p className="text-sm font-semibold mb-2" style={{ color: cap.color }}>
                  {cap.label}
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Future Capabilities ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4">
              Coming Next
            </p>
            <h2 className="text-3xl font-bold text-zinc-500 sm:text-4xl">
              On the roadmap
            </h2>
          </div>
          <div className="mx-auto max-w-4xl grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {futureCaps.map((cap, i) => (
              <div key={i} className="text-center px-2">
                <p className="text-sm font-semibold mb-2 text-zinc-500">
                  {cap.label}
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
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
              { title: "Live Tracker Data", desc: "Rounds, investors, and companies — cross-referenced from SEC filings, accelerator data, investor registries, and traction signals. Updated continuously.", color: "#2dd4bf" },
              { title: "Behavioral Patterns", desc: "What investors actually do — response timing, deal flow patterns, co-investment networks.", color: "#fb923c" },
              { title: "Outcome Calibration", desc: "Every recommendation calibrated against real raise outcomes. The brain gets smarter with every raise that runs through it.", color: "#fbbf24" },
              { title: "Persistent Context", desc: "Remembers your project, metrics, and raise history. Every query builds on the last.", color: "#a78bfa" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.title}</p>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Defensibility ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              The moat
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              <span className="text-white">Why the Brain can&apos;t be</span>{" "}
              <span className="text-orange-500">copied.</span>
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-10">
            {[
              {
                title: "Proprietary outcome data",
                desc: "Every raise that runs through raisefn generates signal that exists nowhere else — which outreach got responses, which investors moved fast, what narratives landed, what terms closed. This dataset grows with every customer and cannot be scraped, purchased, or replicated.",
                color: "#2dd4bf",
              },
              {
                title: "Live calibration, not frozen training data",
                desc: "Generic AI models are trained on data from 18 months ago. The Brain is connected to the Eyes & Ears in real time — investor deployment pace this quarter, sector momentum this month, round terms this week. The answers reflect now, not then.",
                color: "#fb923c",
              },
              {
                title: "Domain judgment, not generic inference",
                desc: "The scoring models, evaluation frameworks, and sequencing logic encode how the best fundraising advisors actually think. An LLM wrapper can answer questions about fundraising. It can't tell you to pitch Investor A before Investor B because A's commitment will unlock B.",
                color: "#a78bfa",
              },
              {
                title: "Compounding network effects",
                desc: "More founders raising → more outcome data → better recommendations → more founders raising. Every raise makes the next recommendation more accurate. Competitors start at zero. We start at every raise that came before.",
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
            <div className="grid grid-cols-2 gap-12">
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
                  {["Live tracker data, updated continuously", "Behavioral data — what investors do", "Calibrated on real raise outcomes", "Persistent context across your raise", "Gets smarter with every raise that runs through it"].map((text) => (
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
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Three audiences. One brain.</h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-6 sm:grid-cols-3 text-center">
            {[
              { who: "Entrepreneurs", what: "Navigate your raise with intelligence — from readiness to close.", color: "#2dd4bf", href: "/brain/entrepreneurs" },
              { who: "Investors", what: "Better deal flow, faster diligence, and market intelligence.", color: "#f97316", href: "/brain/investors" },
              { who: "AI Agents", what: "Fundraising intelligence through a single API call.", color: "#a78bfa", href: "/brain/agents" },
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
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">The intelligence layer is live</h2>
            <p className="text-zinc-500 mb-8">Get early access to the brain.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tracker" className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white">
                Explore the Tracker
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
