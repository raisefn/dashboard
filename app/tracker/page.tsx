"use client";

import Link from "next/link";
import FadeInSection from "@/components/fade-in-section";
import { useEffect, useRef, useState } from "react";

// All data sources — active and planned
const sources = [
  // ── Active: Fundraising data ──
  { label: "SEC EDGAR", desc: "Form D filings & offerings", color: "#cbd5e1", active: true },
  { label: "RSS News", desc: "TechCrunch & CB News", color: "#f472b6", active: true },
  // ── Active: Company directories ──
  { label: "Y Combinator", desc: "5,690 startup profiles", color: "#fb923c", active: true },
  { label: "Techstars", desc: "Accelerator portfolio", color: "#2dd4bf", active: true },
  { label: "500 Global", desc: "Accelerator portfolio", color: "#a78bfa", active: true },
  // ── Active: Traction enrichment ──
  { label: "GitHub", desc: "Dev activity & stars", color: "#e4e4e7", active: true },
  { label: "Hacker News", desc: "Founder mindshare", color: "#fb923c", active: true },
  { label: "Reddit", desc: "Community signals", color: "#f87171", active: true },
  { label: "Product Hunt", desc: "Launch traction", color: "#fbbf24", active: true },
  { label: "npm", desc: "Package downloads", color: "#bef264", active: true },
  { label: "PyPI", desc: "Package downloads", color: "#86efac", active: true },
  // ── Active: Investor intelligence ──
  { label: "SEC Form ADV", desc: "Family offices & advisers", color: "#93c5fd", active: true },
  { label: "SEC 13F", desc: "Institutional holdings", color: "#7dd3fc", active: true },
  { label: "Form D Persons", desc: "Angel investor signals", color: "#c4b5fd", active: true },
  { label: "IRS 990", desc: "Family foundations", color: "#fde68a", active: true },
  // ── Active: Legacy crypto ──
  { label: "DefiLlama", desc: "Protocol TVL", color: "#fdba74", active: true },
  { label: "CoinGecko", desc: "Token markets", color: "#6ee7b7", active: true },
  // ── Additional sources ──
  { label: "Companies House", desc: "UK company data", color: "#38bdf8", active: true },
  { label: "Crunchbase", desc: "Funding rounds", color: "#f472b6", active: true },
  { label: "PitchBook", desc: "Deal data", color: "#a78bfa", active: true },
  { label: "AngelList", desc: "Startup profiles", color: "#60a5fa", active: true },
  { label: "LinkedIn", desc: "Team & network", color: "#38bdf8", active: true },
  { label: "Twitter / X", desc: "Social signals", color: "#94a3b8", active: true },
  { label: "SimilarWeb", desc: "Web traffic", color: "#818cf8", active: true },
  { label: "G2", desc: "Product reviews", color: "#67e8f9", active: true },
  { label: "Glassdoor", desc: "Team growth", color: "#34d399", active: true },
  { label: "App Store", desc: "Mobile traction", color: "#d946ef", active: true },
  { label: "Google Play", desc: "Android traction", color: "#86efac", active: true },
  { label: "AWS Marketplace", desc: "Enterprise traction", color: "#fca5a1", active: true },
  { label: "Stripe Atlas", desc: "Incorporation data", color: "#7dd3fc", active: true },
  { label: "Discord", desc: "Community size", color: "#a5b4fc", active: true },
  { label: "Substack", desc: "Content traction", color: "#fde68a", active: true },
  { label: "arXiv", desc: "Research papers", color: "#fca5a1", active: true },
  { label: "Patent Office", desc: "IP filings", color: "#c4b5fd", active: true },
  { label: "CB Insights", desc: "Market maps", color: "#93c5fd", active: true },
  { label: "Owler", desc: "Company intel", color: "#5eead4", active: true },
  { label: "BuiltWith", desc: "Tech stacks", color: "#f9a8d4", active: true },
  { label: "Sensor Tower", desc: "App analytics", color: "#e879f9", active: true },
  { label: "OpenVC", desc: "Investor profiles", color: "#34d399", active: true },
  { label: "Angel Capital Assn", desc: "Angel group directory", color: "#fca5a1", active: true },
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
        Cross-referencing SEC filings, investor registries, accelerator data, and real-time traction signals
        to surface intelligence that no single source can reveal.
      </p>

      {/* Neural network */}
      <div
        ref={containerRef}
        className="relative mx-auto mt-4 w-full max-w-[800px] overflow-hidden"
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
              What the tracker sees
            </h2>
          </div>
          <div className="mx-auto max-w-3xl grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            {[
              { title: "Companies", desc: "Every startup that files with the SEC, launches from a top accelerator, or shows traction on developer and product platforms — continuously tracked.", color: "#2dd4bf" },
              { title: "Rounds", desc: "Fundraising events detected from regulatory filings, news, and public records — cross-referenced for accuracy, enriched with context.", color: "#fbbf24" },
              { title: "Investors", desc: "VCs, angels, family offices, and foundations — identified from SEC registrations, 13F holdings, Form D filings, and foundation tax records.", color: "#fb923c" },
            ].map((item) => (
              <div key={item.title}>
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
              What it sees
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Intelligence that emerges from combination.
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-10">
            {[
              { title: "Family offices that are actually deploying", desc: "Cross-reference SEC Form ADV registrations with Form D filings to find family offices actively writing checks into early-stage — not just ones that exist on paper.", color: "#2dd4bf" },
              { title: "Angel investors hiding in plain sight", desc: "Analyze promoter patterns across thousands of Form D filings to build angel profiles — who keeps showing up on cap tables, in which sectors, at what stages.", color: "#fbbf24" },
              { title: "Traction signals that predict funding", desc: "Correlate GitHub commit velocity, Hacker News mention spikes, and Product Hunt launches with funding timing to identify companies likely raising before they announce.", color: "#fb923c" },
              { title: "Investor behavior, not investor marketing", desc: "13F holdings data reveals what institutions actually hold. Form D filings reveal who actually led. This is what investors do — not what they say they do.", color: "#a78bfa" },
            ].map((item) => (
              <div key={item.title} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Why This Is Different ── */}
      <section className="relative py-24 px-4">
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
              Why this matters
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Any one source is a list. Combined, it&apos;s intelligence.
            </h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-10">
            {[
              {
                title: "SEC Form D says a company raised $5M",
                then: "The tracker finds the same company in YC's W24 batch, sees their GitHub repo gained 2,000 stars last month, and identifies the lead investor from Form ADV as a family office with $400M AUM that's deployed into 12 similar deals.",
                color: "#2dd4bf",
              },
              {
                title: "A name appears on 8 Form D filings in 18 months",
                then: "Cross-reference with 13F data and IRS 990 records — this is a family foundation converting to direct startup investing. They're writing $250K–$500K checks in developer tools. No database lists them as an angel.",
                color: "#fbbf24",
              },
              {
                title: "A YC company's npm package hits 50K weekly downloads",
                then: "Product Hunt launch got 1,200 upvotes. Reddit threads are growing. GitHub stars accelerating. No funding round announced yet — but the pattern matches companies that raised within 60 days.",
                color: "#fb923c",
              },
              {
                title: "An investor's 13F shows they sold 3 portfolio positions",
                then: "Their Form ADV shows dry powder. Their last 4 Form D appearances were in AI infrastructure. They haven't led a deal in 90 days. This investor is about to deploy.",
                color: "#a78bfa",
              },
            ].map((item) => (
              <div key={item.title} className="border-l-2 pl-6" style={{ borderColor: `${item.color}40` }}>
                <p className="text-sm font-semibold mb-2" style={{ color: item.color }}>{item.title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.then}</p>
              </div>
            ))}
          </div>
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
