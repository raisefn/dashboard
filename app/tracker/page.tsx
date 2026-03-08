"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";
import { useEffect, useRef, useState } from "react";

// All data sources — active and planned
const sources = [
  // Active sources
  { label: "SEC EDGAR", desc: "Regulatory filings", color: "#cbd5e1", active: true },
  { label: "GitHub", desc: "Dev activity", color: "#e4e4e7", active: true },
  { label: "Hacker News", desc: "Founder mindshare", color: "#fb923c", active: true },
  { label: "Reddit", desc: "Community signals", color: "#f87171", active: true },
  { label: "Product Hunt", desc: "Launch traction", color: "#fbbf24", active: true },
  // Planned / identified sources
  { label: "Crunchbase", desc: "Funding rounds", color: "#f472b6", active: false },
  { label: "PitchBook", desc: "Deal data", color: "#a78bfa", active: false },
  { label: "AngelList", desc: "Startup profiles", color: "#60a5fa", active: false },
  { label: "LinkedIn", desc: "Team & network", color: "#38bdf8", active: false },
  { label: "Twitter / X", desc: "Social signals", color: "#94a3b8", active: false },
  { label: "Y Combinator", desc: "Batch data", color: "#fb923c", active: false },
  { label: "Techstars", desc: "Accelerator data", color: "#2dd4bf", active: false },
  { label: "SimilarWeb", desc: "Web traffic", color: "#818cf8", active: false },
  { label: "G2", desc: "Product reviews", color: "#67e8f9", active: false },
  { label: "Glassdoor", desc: "Team growth", color: "#34d399", active: false },
  { label: "App Store", desc: "Mobile traction", color: "#d946ef", active: false },
  { label: "Google Play", desc: "Android traction", color: "#86efac", active: false },
  { label: "npm / PyPI", desc: "Package stats", color: "#bef264", active: false },
  { label: "AWS Marketplace", desc: "Enterprise traction", color: "#fca5a1", active: false },
  { label: "Stripe Atlas", desc: "Incorporation data", color: "#7dd3fc", active: false },
  { label: "Discord", desc: "Community size", color: "#a5b4fc", active: false },
  { label: "Substack", desc: "Content traction", color: "#fde68a", active: false },
  { label: "arXiv", desc: "Research papers", color: "#fca5a1", active: false },
  { label: "Patent Office", desc: "IP filings", color: "#c4b5fd", active: false },
  { label: "CoinGecko", desc: "Crypto markets", color: "#6ee7b7", active: false },
  { label: "DefiLlama", desc: "Protocol data", color: "#fdba74", active: false },
  { label: "CB Insights", desc: "Market maps", color: "#93c5fd", active: false },
  { label: "Owler", desc: "Company intel", color: "#5eead4", active: false },
  { label: "BuiltWith", desc: "Tech stacks", color: "#f9a8d4", active: false },
  { label: "Sensor Tower", desc: "App analytics", color: "#e879f9", active: false },
];

// Seeded pseudo-random for consistent layout across renders
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// Generate 3D galaxy positions — depth determines size, opacity, speed
function generatePositions(count: number) {
  const positions: {
    x: number;
    y: number;
    depth: number; // 0 = far, 1 = close
    size: number;
    opacity: number;
    speed: number;
  }[] = [];

  for (let i = 0; i < count; i++) {
    const seed = i * 7 + 13;
    const angle = seededRandom(seed) * Math.PI * 2;
    const dist = 160 + seededRandom(seed + 1) * 240;
    const depth = seededRandom(seed + 2);

    const depthScale = 0.3 + depth * 0.7;

    positions.push({
      x: 400 + Math.cos(angle) * dist * (0.7 + depth * 0.3),
      y: 400 + Math.sin(angle) * dist * (0.7 + depth * 0.3),
      depth,
      size: depthScale,
      opacity: 0.25 + depth * 0.75,
      speed: 3 + (1 - depth) * 4,
    });
  }
  return positions;
}

const positions = generatePositions(sources.length);

const CX = 400;
const CY = 400;

export default function TrackerLandingPage() {
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

  const sorted = sources
    .map((s, i) => ({ ...s, ...positions[i], index: i }))
    .sort((a, b) => a.depth - b.depth);

  return (
    <div className="relative">
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center overflow-hidden">
      {/* Grid background */}
      <div className="grid-bg" />

      {/* Tagline */}
      <p
        className="mx-auto max-w-lg text-center text-base text-zinc-400 animate-fade-in mt-8"
        style={{ animationDelay: "0.3s" }}
      >
        Real-time startup fundraising data from 290+ identified sources &mdash; companies,
        rounds, investors, normalized and enriched.
      </p>

      {/* Neural network */}
      <div
        ref={containerRef}
        className="relative mx-auto mt-4 w-full max-w-[800px]"
        style={{ height: 800 * scale }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            width: 800,
            height: 800,
            position: "relative",
          }}
        >
          {/* SVG connection lines */}
          <svg
            className="absolute inset-0"
            width={800}
            height={800}
            viewBox="0 0 800 800"
          >
            {sorted.map((node) => (
              <g key={node.index}>
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={CX}
                  y2={CY}
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
              width: 180,
              height: 180,
              left: CX - 90,
              top: CY - 90,
              background: "radial-gradient(circle, #27272a 0%, #18181b 100%)",
              border: "2px solid #3f3f46",
              zIndex: 50,
            }}
          >
            <span className="text-4xl font-bold">
              <span style={{ color: "#F97316" }}>raise</span>
              <span style={{ color: "#2DD4BF" }}>(fn)</span>
            </span>
            <span className="mt-1 text-xs text-zinc-500">
              the eyes and ears
            </span>
          </div>

          {/* Source nodes */}
          {sorted.map((node) => {
            const w = Math.round(70 + 60 * node.size);
            const h = Math.round(40 + 40 * node.size);
            const fontSize = node.size > 0.7 ? "text-sm" : node.size > 0.4 ? "text-xs" : "text-[10px]";
            const descSize = node.size > 0.7 ? "text-xs" : "text-[10px]";

            return (
              <div
                key={node.index}
                className={`absolute flex flex-col items-center justify-center rounded-xl border animate-float ${
                  node.active
                    ? "border-zinc-600/50"
                    : "border-zinc-800/20"
                }`}
                style={{
                  width: w,
                  height: h,
                  left: node.x - w / 2,
                  top: node.y - h / 2,
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
                {node.size > 0.4 && (
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

      </div>

      {/* ── What It Tracks ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              What it tracks
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Three datasets, one unified view
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid gap-8 sm:grid-cols-3 text-center">
            {[
              { title: "Companies", stat: "4M+", desc: "Startups tracked across every stage — from pre-seed to Series C. Sector, traction, team, tech stack, and raise history.", color: "#2dd4bf" },
              { title: "Rounds", stat: "2M+", desc: "Individual funding rounds with valuation, amount raised, investors, terms, and timing. Updated as rounds close.", color: "#fbbf24" },
              { title: "Investors", stat: "500K+", desc: "VCs, angels, and funds profiled by sector focus, stage preference, check size, deployment pace, and co-investment patterns.", color: "#fb923c" },
            ].map((item) => (
              <div key={item.title}>
                <p className="text-3xl font-bold mb-1" style={{ color: item.color }}>{item.stat}</p>
                <p className="text-sm font-semibold mb-2" style={{ color: item.color }}>{item.title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── How It Works ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              How it works
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Crawl. Normalize. Enrich. Repeat.
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-10">
            {[
              { title: "Multi-source ingestion", desc: "Data pulled from 290+ identified sources — funding databases, social platforms, developer activity, regulatory filings, market data. Not a single-vendor dependency.", color: "#2dd4bf" },
              { title: "Normalization", desc: "Different sources report differently. The tracker normalizes everything into a unified schema — consistent naming, categorization, and structure across every data point.", color: "#fbbf24" },
              { title: "Enrichment", desc: "Raw data gets enriched with derived signals — investor deployment velocity, sector concentration, co-investment networks, round timing patterns.", color: "#fb923c" },
              { title: "Continuous updates", desc: "Not a quarterly report. Not a static dataset. The tracker runs continuously, so the data reflects what's happening now — not what happened last quarter.", color: "#a78bfa" },
            ].map((item) => (
              <div key={item.title} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Active Sources ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Live sources
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              5 sources live. 290+ identified.
            </h2>
          </div>
          <div className="mx-auto max-w-md space-y-2">
            {sources.filter(s => s.active).map((source) => (
              <div key={source.label} className="flex items-center gap-4 py-3">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                <span className="text-sm font-medium text-zinc-300">{source.label}</span>
                <span className="text-xs text-zinc-600">{source.desc}</span>
              </div>
            ))}
          </div>
          <p className="mx-auto max-w-md text-center text-xs text-zinc-600 mt-8">
            Planned sources shown in the diagram above in grey.
          </p>
        </FadeInSection>
      </section>

      {/* ── Open Source ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Open source
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              The data layer is public
            </h2>
            <p className="text-zinc-500 mb-8 max-w-xl mx-auto">
              The tracker is fully open source. The data that powers raise(fn)
              is available for anyone to use, verify, and build on.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/raisefn/tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-teal-700/50 bg-teal-950/20 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-900/30"
              >
                View on GitHub
              </a>
              <Link
                href="/tracker/projects"
                className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
              >
                Explore the Data
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
