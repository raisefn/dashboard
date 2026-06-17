"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// /how-we-match — full-viewport cinematic visualization of the 5-dim ontology.
// NOT a marketing template. The visual IS the page. Real ontology nodes, real
// overlap relationships, real specialty combos light up in sequence.

// Real ontology tags — pulled from brain/sector_ontology/*.py at the time of
// writing. The visual references actual data so the page IS the work.
const DIMS = [
  {
    key: "industry",
    label: "Industry",
    color: "#2dd4bf",
    glow: "#5eead4",
    tags: [
      "consumer", "fintech", "healthtech", "enterprise_saas", "real_estate",
      "education", "services", "logistics", "legal", "defense",
      "retail", "energy", "biotech", "gaming", "media",
      "agriculture", "transportation", "hardware_iot", "security",
      "developer_tools", "crypto_web3", "creator_economy", "manufacturing",
      "robotics", "marketing_adtech", "data_infrastructure", "research_tools",
      "hospitality", "hr_workforce", "government", "non_profit", "space",
      "quantum",
    ],
  },
  {
    key: "modality",
    label: "Modality",
    color: "#34d399",
    glow: "#6ee7b7",
    tags: [
      "saas", "marketplace", "managed_marketplace", "direct_brand",
      "ecommerce", "platform", "infrastructure", "vertical_saas",
      "subscription_commerce", "hardware", "services", "on_demand",
      "network_effects", "embedded", "agency", "creator_tools",
      "open_source", "community", "consulting", "aggregator",
      "vertical_integration", "products",
    ],
  },
  {
    key: "technology",
    label: "Technology",
    color: "#22d3ee",
    glow: "#67e8f9",
    tags: [
      "ai_ml", "llm", "generative_ai", "ai_agents", "automation",
      "computer_vision", "nlp", "blockchain", "web3", "iot",
      "autonomous_systems", "robotics_tech", "hardware_design",
      "climate_tech_core", "bioinformatics", "synthetic_biology",
      "ar_vr", "edge_compute", "low_code", "no_code", "privacy_tech",
      "quantum", "speech_voice",
    ],
  },
  {
    key: "audience",
    label: "Audience",
    color: "#a78bfa",
    glow: "#c4b5fd",
    tags: [
      "mass_consumer", "enterprise", "smb", "household",
      "merchant", "developer", "vertical_professional",
      "creator", "prosumer", "mid_market", "government_buyer",
      "platform_partner", "educational_institution", "non_profit_buyer",
      "supplier", "designer",
    ],
  },
  {
    key: "business",
    label: "Business",
    color: "#fb923c",
    glow: "#fdba74",
    tags: [
      "subscription", "transactional", "marketplace_take_rate",
      "enterprise_contract", "service_fee", "usage_based",
      "advertising", "hardware_unit_sale", "managed_services",
      "freemium", "licensing", "data_revenue", "one_time_purchase",
      "white_label",
    ],
  },
];

// Real specialty combos from brain/sector_ontology/combos.py — these light up
// in sequence during the visualization to show "we recognize these patterns."
const COMBOS = [
  { name: "Consumer marketplace", tags: ["consumer", "marketplace"] },
  { name: "AI fintech", tags: ["fintech", "ai_ml"] },
  { name: "Managed consumer marketplace", tags: ["consumer", "managed_marketplace", "household"] },
  { name: "Vertical SaaS healthcare", tags: ["healthtech", "vertical_saas"] },
  { name: "On-demand services", tags: ["services", "on_demand", "household"] },
  { name: "DTC subscription brand", tags: ["consumer", "direct_brand", "subscription"] },
  { name: "Enterprise AI agents", tags: ["enterprise_saas", "ai_agents", "enterprise"] },
  { name: "AI legal", tags: ["legal", "ai_ml", "vertical_saas"] },
  { name: "Climate hardware", tags: ["energy", "hardware", "climate_tech_core"] },
  { name: "Creator subscription tools", tags: ["creator_economy", "creator_tools", "subscription"] },
];

function Lattice() {
  // Tight reactive column heights so the lattice fits any viewport
  const [comboIdx, setComboIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setComboIdx((i) => (i + 1) % COMBOS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const active = COMBOS[comboIdx];
  const activeSet = new Set(active.tags);

  // Layout constants
  const COL_GAP = 200; // px between dim columns
  const TAG_H = 18; // px per tag row
  const COL_TOP = 90;

  return (
    <div className="relative w-full overflow-x-auto">
      <div
        className="relative mx-auto"
        style={{
          width: DIMS.length * COL_GAP + 40,
          height: 700,
        }}
      >
        {/* Cross-column connecting arcs that light up when both ends are in the active combo */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={DIMS.length * COL_GAP + 40}
          height={700}
        >
          <defs>
            {DIMS.map((d) => (
              <filter key={d.key} id={`glow-${d.key}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
            <linearGradient id="comboLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* For each pair of active tags, draw a glowing arc */}
          {active.tags.map((tag, ti) =>
            active.tags.slice(ti + 1).map((other, oi) => {
              const dim1 = DIMS.findIndex((d) => d.tags.includes(tag));
              const dim2 = DIMS.findIndex((d) => d.tags.includes(other));
              if (dim1 < 0 || dim2 < 0 || dim1 === dim2) return null;
              const idx1 = DIMS[dim1].tags.indexOf(tag);
              const idx2 = DIMS[dim2].tags.indexOf(other);
              const x1 = dim1 * COL_GAP + 100;
              const y1 = COL_TOP + idx1 * TAG_H + 9;
              const x2 = dim2 * COL_GAP + 100;
              const y2 = COL_TOP + idx2 * TAG_H + 9;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2 - 30;
              return (
                <g key={`${ti}-${oi}`}>
                  <path
                    d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                    stroke="url(#comboLine)"
                    strokeWidth="2"
                    fill="none"
                    filter="url(#glow-industry)"
                    opacity="0.9"
                  >
                    <animate
                      attributeName="opacity"
                      values="0;0.95;0.95;0"
                      keyTimes="0;0.2;0.8;1"
                      dur="3.2s"
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              );
            }),
          )}
        </svg>

        {/* The 5 columns */}
        {DIMS.map((dim, di) => (
          <div
            key={dim.key}
            className="absolute"
            style={{ left: di * COL_GAP + 20, top: 0, width: 160 }}
          >
            <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 mb-1">
              {String(di + 1).padStart(2, "0")}
            </div>
            <div
              className="text-sm font-bold mb-4 tracking-tight"
              style={{ color: dim.color }}
            >
              {dim.label}
            </div>
            <div className="space-y-0.5">
              {dim.tags.map((tag) => {
                const isActive = activeSet.has(tag);
                return (
                  <div
                    key={tag}
                    className="flex items-center gap-2 transition-all duration-500"
                    style={{
                      height: TAG_H,
                      opacity: isActive ? 1 : 0.32,
                    }}
                  >
                    <div
                      className="shrink-0 rounded-full transition-all duration-500"
                      style={{
                        width: isActive ? 7 : 4,
                        height: isActive ? 7 : 4,
                        backgroundColor: dim.color,
                        boxShadow: isActive ? `0 0 12px ${dim.glow}` : "none",
                      }}
                    />
                    <span
                      className="text-[11px] font-medium tabular-nums whitespace-nowrap transition-colors duration-500"
                      style={{ color: isActive ? "#fafafa" : "#71717a" }}
                    >
                      {tag.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Combo label floating below — names the current pattern */}
        <div
          className="absolute left-0 right-0 text-center transition-all duration-500"
          style={{ top: 640 }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500/70 font-semibold mb-2">
            Specialty pattern recognized
          </p>
          <p
            key={comboIdx}
            className="text-2xl font-bold text-amber-300 animate-fade-in"
            style={{ animationDuration: "0.6s" }}
          >
            {active.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HowWeMatchPage() {
  return (
    <div className="relative">
      <div className="grid-bg" />

      {/* The hero IS the lattice. Words wait below. */}
      <section className="relative pt-16 pb-8 px-4">
        <div className="mx-auto max-w-7xl">
          <Lattice />
        </div>
      </section>

      {/* Single statement under the lattice — tight, punchy, no five-section template */}
      <section className="relative py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-8">
            Every deal lives at the intersection of{" "}
            <span className="text-teal-300">five dimensions</span>.
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
            Not a sector tag. Not a keyword. <span className="text-white font-semibold">109 nodes.</span>{" "}
            <span className="text-white font-semibold">264 connections.</span>{" "}
            <span className="text-white font-semibold">64 specialty patterns.</span> We classify every
            founder and every investor across all five — so the match reflects how investors
            actually think, not how a database categorizes them.
          </p>
        </div>
      </section>

      {/* Three pillars — tight, no diagram cards, just bold statements */}
      <section className="relative py-16 px-4">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/80 font-bold mb-4">
              Specialists win
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight mb-4">
              Focused theses outrank broad ones.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              An investor with two industries on the page beats a generalist with twelve.
              Conviction is signal. Focus is how we measure it.
            </p>
          </div>
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.3em] text-rose-300/80 font-bold mb-4">
              Hard nos honored
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight mb-4">
              Pre-rejected deals never surface.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When an investor says &quot;never crypto, never hardware&quot; — we listen. Founders
              don&apos;t waste pitches. Investors don&apos;t get pinged.
            </p>
          </div>
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80 font-bold mb-4">
              Brokered, not blasted
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight mb-4">
              Every warm intro is human.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The lattice surfaces signal. A person decides what becomes an intro. No auto-fired
              emails. No abused inboxes. Ever.
            </p>
          </div>
        </div>
      </section>

      {/* CTA — minimal */}
      <section className="relative pt-16 pb-32 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-orange-600 px-10 py-4 text-sm font-bold tracking-wide text-white transition-all hover:bg-orange-500 hover:scale-105 shadow-2xl shadow-orange-900/40"
          >
            Set up your raise
          </Link>
          <div className="mt-10">
            <Link
              href="/how-we-learn"
              className="text-sm font-medium text-zinc-400 hover:text-teal-300 transition-colors"
            >
              See how the lattice learns →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
