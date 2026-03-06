"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// All data sources — active and planned
const sources = [
  // Active enrichers
  { label: "DefiLlama", desc: "TVL & protocols", color: "#a78bfa", active: true },
  { label: "CoinGecko", desc: "Market data", color: "#fbbf24", active: true },
  { label: "GitHub", desc: "Dev activity", color: "#e4e4e7", active: true },
  { label: "Hacker News", desc: "Dev mindshare", color: "#fb923c", active: true },
  { label: "Reddit", desc: "Community", color: "#f87171", active: true },
  { label: "Snapshot", desc: "Governance", color: "#facc15", active: true },
  { label: "CoinGecko Community", desc: "Social metrics", color: "#34d399", active: true },
  // Planned / identified sources
  { label: "Etherscan", desc: "On-chain data", color: "#60a5fa", active: false },
  { label: "Dune Analytics", desc: "SQL queries", color: "#c084fc", active: false },
  { label: "Messari", desc: "Research", color: "#38bdf8", active: false },
  { label: "Crunchbase", desc: "Funding rounds", color: "#f472b6", active: false },
  { label: "Twitter / X", desc: "Social signals", color: "#94a3b8", active: false },
  { label: "Telegram", desc: "Group activity", color: "#2dd4bf", active: false },
  { label: "Discord", desc: "Server metrics", color: "#818cf8", active: false },
  { label: "Mirror", desc: "Web3 publishing", color: "#67e8f9", active: false },
  { label: "Nostr", desc: "Decentralized social", color: "#d946ef", active: false },
  { label: "Farcaster", desc: "Crypto social", color: "#a78bfa", active: false },
  { label: "Lens Protocol", desc: "Social graph", color: "#86efac", active: false },
  { label: "DeBank", desc: "Wallet profiles", color: "#fca5a1", active: false },
  { label: "Nansen", desc: "Wallet labels", color: "#7dd3fc", active: false },
  { label: "Token Terminal", desc: "Revenue data", color: "#fde68a", active: false },
  { label: "L2Beat", desc: "Layer 2 data", color: "#c4b5fd", active: false },
  { label: "Artemis", desc: "Chain metrics", color: "#6ee7b7", active: false },
  { label: "DeFi Pulse", desc: "Protocol rankings", color: "#fdba74", active: false },
  { label: "Chainlink", desc: "Oracle data", color: "#93c5fd", active: false },
  { label: "The Graph", desc: "Subgraphs", color: "#a5b4fc", active: false },
  { label: "Alchemy", desc: "Node data", color: "#5eead4", active: false },
  { label: "Flipside", desc: "On-chain analytics", color: "#f9a8d4", active: false },
  { label: "SEC EDGAR", desc: "Regulatory filings", color: "#cbd5e1", active: false },
  { label: "arXiv", desc: "Research papers", color: "#fca5a1", active: false },
  { label: "npm / crates.io", desc: "Package stats", color: "#bef264", active: false },
  { label: "Galaxy Research", desc: "Institutional", color: "#e879f9", active: false },
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
    // Spread in a roughly circular pattern with some randomness
    const angle = seededRandom(seed) * Math.PI * 2;
    const dist = 160 + seededRandom(seed + 1) * 240;
    const depth = seededRandom(seed + 2);

    // Depth affects everything — closer nodes are bigger, brighter, slower float
    const depthScale = 0.3 + depth * 0.7;

    positions.push({
      x: 400 + Math.cos(angle) * dist * (0.7 + depth * 0.3),
      y: 400 + Math.sin(angle) * dist * (0.7 + depth * 0.3),
      depth,
      size: depthScale,
      opacity: 0.25 + depth * 0.75,
      speed: 3 + (1 - depth) * 4, // far = faster float, close = slower
    });
  }
  return positions;
}

const positions = generatePositions(sources.length);

const CX = 400;
const CY = 400;

export default function LandingPage() {
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

  // Sort by depth so far nodes render first (behind)
  const sorted = sources
    .map((s, i) => ({ ...s, ...positions[i], index: i }))
    .sort((a, b) => a.depth - b.depth);

  return (
    <div className="relative flex min-h-[calc(100vh-57px)] flex-col items-center overflow-hidden">
      {/* Grid background */}
      <div className="grid-bg" />

      {/* Neural network */}
      <div
        ref={containerRef}
        className="relative mx-auto mt-8 w-full max-w-[800px]"
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
                {/* Connection line */}
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={CX}
                  y2={CY}
                  stroke={node.color}
                  strokeWidth={node.active ? 1.5 * node.size : 0.8 * node.size}
                  strokeOpacity={node.active ? 0.2 * node.opacity : 0.08 * node.opacity}
                  strokeDasharray={node.active ? "6 4" : "3 6"}
                  className="animate-dash"
                  style={{ animationDelay: `${node.index * 0.15}s` }}
                />
                {/* Data pulse */}
                <circle
                  r={node.active ? 3.5 * node.size : 2 * node.size}
                  fill={node.color}
                  opacity={node.active ? 0.6 * node.opacity : 0.25 * node.opacity}
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

          {/* Source nodes — depth determines visual weight */}
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
                    : "border-zinc-800/30"
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
                  style={{ color: node.color }}
                >
                  {node.label}
                </span>
                {node.size > 0.4 && (
                  <span className={`${descSize} mt-0.5 text-zinc-500 leading-tight`}>
                    {node.desc}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tagline */}
      <p
        className="mx-auto max-w-lg text-center text-base text-zinc-400 animate-fade-in"
        style={{ animationDelay: "0.3s", marginTop: -20 * scale }}
      >
        Fundraising intelligence for the crypto era &mdash; built for
        founders, VCs, and the agent economy.
      </p>

      {/* CTA */}
      <Link
        href="/projects"
        className="mt-8 mb-16 rounded-full border border-teal-700/50 px-8 py-3 text-sm font-medium text-teal-300 transition-all hover:border-teal-500 hover:bg-teal-950/30 hover:text-teal-200 animate-fade-in"
        style={{ animationDelay: "0.5s" }}
      >
        Enter Dashboard &rarr;
      </Link>
    </div>
  );
}
