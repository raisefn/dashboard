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

function DimensionsView() {
  const [comboIdx, setComboIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setComboIdx((i) => (i + 1) % COMBOS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const active = COMBOS[comboIdx];
  const activeSet = new Set(active.tags);

  // Tight column spacing so the columns fit the viewport without horizontal
  // scroll. 5 cols × 172px + 32 padding ≈ 892px — comfortably under typical
  // content widths (max-w-6xl ≈ 1152px).
  const COL_GAP = 172;
  const TAG_H = 18;
  const COL_TOP = 90;

  return (
    <div className="relative w-full overflow-hidden">
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

      {/* Hero — the dimensions visualization. Words wait below. */}
      <section className="relative pt-16 pb-8 px-4">
        <div className="mx-auto max-w-7xl">
          <DimensionsView />
        </div>
      </section>

      {/* Single statement under the visualization — tight, punchy */}
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

      {/* The full matching stack — five dims are the foundation; check size,
          stage, geo, deployment cadence, behavioral profile, network signal,
          hard nos, and human curation layer on top. */}
      <section className="relative py-20 px-4 border-t border-zinc-900/60">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-3">
              Beyond the dimensions
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              Five dimensions are the <span className="text-teal-300">foundation</span>.
            </h2>
            <p className="text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Then we layer everything else investors actually care about — stage adjacency,
              check fit, geography, deployment cadence, recent activity, behavioral history,
              network depth. Then a human decides what becomes an intro.
            </p>
          </div>

          {/* The matching stack — vertical layers, each labeled and described */}
          <div className="space-y-2">
            {[
              {
                tag: "Layer 01 · Ontology coverage",
                kind: "foundation",
                color: "#2dd4bf",
                title: "Five dimensions. One coordinate system.",
                desc: "Every founder and every investor positioned across industry, modality, technology, audience, and business model. Coverage matters, not keyword hits.",
              },
              {
                tag: "Layer 02 · Specialty bonus",
                kind: "amplifier",
                color: "#34d399",
                title: "Narrow focus rewarded.",
                desc: "Investors with a tight, focused thesis get amplified when their specialty overlaps. A focused investor outranks a broad generalist on the same deal.",
              },
              {
                tag: "Layer 03 · Specialty patterns",
                kind: "amplifier",
                color: "#22d3ee",
                title: "Cross-dimensional combos recognized.",
                desc: "Consumer marketplace. AI fintech. Vertical SaaS healthcare. On-demand household services. When founder and investor both express the same pattern, the conviction reads through.",
              },
              {
                tag: "Layer 04 · Stage adjacency",
                kind: "filter",
                color: "#a78bfa",
                title: "Pre-seed touches seed. Seed touches Series A.",
                desc: "Stages adjacent to the raise pass; the rest get cut. A growth-stage fund doesn't surface for a pre-seed. A pre-seed angel doesn't surface for Series B.",
              },
              {
                tag: "Layer 05 · Check size fit",
                kind: "filter",
                color: "#c4b5fd",
                title: "Lead capable. Participation capable. Out of band.",
                desc: "Check-size mins and maxes measured against the raise. Lead-size matches score highest. Participation-size partial. Out-of-band cut. No founders pitching small angels on Series A.",
              },
              {
                tag: "Layer 06 · Geography",
                kind: "filter",
                color: "#fbbf24",
                title: "Local-only honored. Global investors travel.",
                desc: "Investors with local-only mandates surface only for nearby founders. Investors with regional focus match their geos. Global mandates match anywhere.",
              },
              {
                tag: "Layer 07 · Deployment cadence",
                kind: "signal",
                color: "#fb923c",
                title: "Actively writing > paused > unknown.",
                desc: "An investor actively deploying outranks one on pause. Funds at the end of their cycle don't waste anyone's time.",
              },
              {
                tag: "Layer 08 · Hard nos",
                kind: "exclusion",
                color: "#f87171",
                title: "Pre-rejected pairings never surface.",
                desc: "When an investor declares the sectors they'll never touch — and the founder is there — the match never fires. Saves both sides the dance.",
              },
              {
                tag: "Layer 09 · Behavioral profile",
                kind: "signal",
                color: "#fda4af",
                title: "Real check sizes. Real commit rates. Real ghost rates.",
                desc: "We track what investors actually do, not what their website says — checks written, meetings taken, days to decision, ghost rates. The matcher quietly favors deciders.",
              },
              {
                tag: "Layer 10 · Network signal",
                kind: "signal",
                color: "#5eead4",
                title: "Warm-intro paths surface.",
                desc: "When other founders have engaged this investor, the aggregated history surfaces — commitment rates, what resonated, common objections — without ever exposing any individual pipeline.",
              },
              {
                tag: "Layer 11 · Human curation",
                kind: "the final gate",
                color: "#fde68a",
                title: "Every warm intro brokered by a person.",
                desc: "The system surfaces signal. A human decides what becomes an intro. No auto-fired emails. No abused inboxes. Ever.",
              },
            ].map((layer) => (
              <div
                key={layer.tag}
                className="relative grid grid-cols-12 gap-4 px-5 py-5 rounded-lg border border-zinc-900 bg-zinc-950/60 hover:bg-zinc-900/60 hover:border-zinc-800 transition-colors group"
              >
                <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                  <div
                    className="shrink-0 w-1 h-12 rounded-full"
                    style={{ backgroundColor: layer.color }}
                  />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: layer.color }}>
                      {layer.tag}
                    </p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{layer.kind}</p>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-9">
                  <h4 className="text-base font-bold text-white mb-1.5 leading-tight">
                    {layer.title}
                  </h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center text-sm text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            <span className="text-zinc-300 font-semibold">Eleven layers</span>
            {" "}applied to every founder, every investor, every match. The score
            you don&apos;t see is the score we engineered to make sure the names
            you DO see are the ones worth your time.
          </p>
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
              See how the matching learns →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
