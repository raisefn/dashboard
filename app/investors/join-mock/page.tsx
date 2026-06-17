"use client";

import Link from "next/link";
import { useState } from "react";

// MOCKUP — option C investor signup. Not wired to backend. Shows the proposed
// two-tier UX: required-short top section, optional "go deeper" expansion that
// exposes all 5 ontology dimensions + regions + structured hard-nos.

// ── Required section data ────────────────────────────────────────────────
// Slightly expanded from the live 15-bucket list (still trimmed, not all 34).
// Heavy-hitters first. The optional section below exposes the full ontology.
const SECTORS_TOP = [
  "ai_ml", "fintech", "healthtech", "enterprise_saas", "consumer",
  "climate_energy", "hardware", "security", "infrastructure",
  "crypto_web3", "logistics", "real_estate", "defense", "legal",
  "education", "services", "retail", "gaming", "media", "other",
];

const STAGES = ["pre_seed", "seed", "series_a", "series_b", "series_c", "growth"];

// Regions as first-class — investors who operate across LATAM, SEA, etc.
// should be able to say so without picking 12 countries.
const REGIONS = [
  "United States", "Canada", "LATAM", "EU", "United Kingdom", "Nordics",
  "MENA", "Sub-Saharan Africa", "South Asia", "SEA",
  "Greater China", "Japan", "Australia / NZ", "Global",
];

const COUNTRIES = [
  "United States", "Canada", "Mexico", "Brazil", "Argentina", "Colombia",
  "Chile", "Peru", "United Kingdom", "Germany", "France", "Spain",
  "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Switzerland", "Ireland", "Portugal", "Poland", "Israel", "UAE",
  "Saudi Arabia", "Egypt", "India", "Singapore", "Vietnam", "Thailand",
  "Indonesia", "Malaysia", "Philippines", "Korea", "Japan", "Taiwan",
  "Hong Kong", "China", "Australia", "New Zealand",
  "Nigeria", "Kenya", "South Africa", "Ghana", "Rwanda",
];

// ── Optional "go deeper" section: 5 ontology dimensions ──────────────────
// These map directly to taxonomy_v2 on the backend → matcher_v2 uses them
// for 5-dim coverage scoring, specialty bonus, and combo recognition.
const MODALITY = [
  "saas", "marketplace", "managed_marketplace", "vertical_saas",
  "direct_brand", "ecommerce", "subscription_commerce", "platform",
  "infrastructure", "hardware", "services", "on_demand",
  "network_effects", "embedded", "agency", "creator_tools",
  "open_source", "community", "aggregator", "vertical_integration",
  "consulting", "products",
];

const TECHNOLOGY = [
  "ai_ml", "llm", "generative_ai", "ai_agents", "automation",
  "computer_vision", "nlp", "speech_voice", "blockchain", "web3",
  "iot", "autonomous_systems", "robotics_tech", "hardware_design",
  "climate_tech_core", "bioinformatics", "synthetic_biology",
  "ar_vr", "edge_compute", "low_code", "no_code", "privacy_tech",
  "quantum",
];

const AUDIENCE = [
  "mass_consumer", "household", "prosumer", "creator",
  "smb", "mid_market", "enterprise", "merchant", "supplier",
  "developer", "designer", "vertical_professional",
  "government_buyer", "educational_institution",
  "non_profit_buyer", "platform_partner",
];

const BUSINESS = [
  "subscription", "transactional", "marketplace_take_rate",
  "enterprise_contract", "service_fee", "usage_based",
  "advertising", "hardware_unit_sale", "managed_services",
  "freemium", "licensing", "data_revenue", "one_time_purchase",
  "white_label",
];

const ANTI_PATTERNS = [
  "Solo founders",
  "First-time founders",
  "Pre-product",
  "Pre-revenue",
  "Pure consulting",
  "Hardware with long manufacturing cycles",
  "Regulated industries",
  "Capital intensive",
];

const inputClass =
  "w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-900";

// ── Reusable pieces ───────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
        {label}
        {hint && <span className="text-zinc-600 normal-case font-normal tracking-normal"> · {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  color = "teal",
  children,
}: {
  selected: boolean;
  onClick: () => void;
  color?: "teal" | "emerald" | "rose" | "violet" | "amber" | "cyan";
  children: React.ReactNode;
}) {
  const palettes = {
    teal: { on: "border-teal-500 bg-teal-950/40 text-teal-200", off: "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500" },
    emerald: { on: "border-emerald-500 bg-emerald-950/40 text-emerald-200", off: "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500" },
    rose: { on: "border-rose-500 bg-rose-950/40 text-rose-200", off: "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500" },
    violet: { on: "border-violet-500 bg-violet-950/40 text-violet-200", off: "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500" },
    amber: { on: "border-amber-500 bg-amber-950/40 text-amber-200", off: "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500" },
    cyan: { on: "border-cyan-500 bg-cyan-950/40 text-cyan-200", off: "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500" },
  };
  const p = palettes[color];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selected ? p.on : p.off}`}
    >
      {children}
    </button>
  );
}

function ChipGroup<T>({
  options,
  selected,
  onToggle,
  color,
  format = (s) => String(s).replace(/_/g, " "),
}: {
  options: T[];
  selected: T[];
  onToggle: (v: T) => void;
  color?: "teal" | "emerald" | "rose" | "violet" | "amber" | "cyan";
  format?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Chip key={String(opt)} selected={selected.includes(opt)} onClick={() => onToggle(opt)} color={color}>
          {format(opt)}
        </Chip>
      ))}
    </div>
  );
}

export default function JoinMockPage() {
  const [thesisType, setThesisType] = useState<"sector_driven" | "sector_agnostic" | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [showDeep, setShowDeep] = useState(false);

  // Deep-section state
  const [modality, setModality] = useState<string[]>([]);
  const [technology, setTechnology] = useState<string[]>([]);
  const [audience, setAudience] = useState<string[]>([]);
  const [business, setBusiness] = useState<string[]>([]);
  const [sectorExpertise, setSectorExpertise] = useState<string[]>([]);
  const [hardNoSectors, setHardNoSectors] = useState<string[]>([]);
  const [hardNoStages, setHardNoStages] = useState<string[]>([]);
  const [antiPatterns, setAntiPatterns] = useState<string[]>([]);

  const toggle = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (v: T) => {
    setter((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));
  };

  return (
    <div className="relative">
      <div className="grid-bg" />

      <div className="mx-auto max-w-3xl px-4 py-16">
        {/* Page header */}
        <div className="mb-2 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-bold">Mockup</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">option C — required short + optional deep</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 leading-tight">Join raise(fn) as an investor.</h1>
        <p className="text-zinc-400 leading-relaxed mb-12">
          We&apos;ll only reach out when a founder fits your thesis. The faster you fill this out, the sharper the matches.
        </p>

        {/* ── REQUIRED SHORT SECTION ─────────────────────────────────────── */}
        <div className="mb-2 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">1</span>
          <h2 className="text-xl font-bold text-white">The basics</h2>
          <span className="text-xs text-zinc-500 ml-2">~5 minutes</span>
        </div>
        <p className="text-sm text-zinc-500 mb-8">Enough to start matching. You&apos;ll get tighter matches as you go deeper below.</p>

        <div className="space-y-7 rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-6">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email *"><input type="email" className={inputClass} placeholder="you@firm.com" /></Field>
            <Field label="Your name"><input className={inputClass} placeholder="Jane Doe" /></Field>
            <Field label="Firm"><input className={inputClass} placeholder="Firm name" /></Field>
            <Field label="Title"><input className={inputClass} placeholder="GP, Partner, Principal..." /></Field>
          </div>

          <Field label="Thesis *" hint="Free text — what you invest in, in your own words">
            <textarea rows={3} className={inputClass} placeholder="What do you invest in? Be specific." />
          </Field>

          <Field label="How do you choose investments? *">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setThesisType("sector_driven")}
                className={`text-left rounded-lg border p-4 transition-all ${
                  thesisType === "sector_driven" ? "border-teal-500 bg-teal-950/30" : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500"
                }`}
              >
                <p className="text-sm font-semibold text-white mb-1">Sector-driven</p>
                <p className="text-xs text-zinc-500">I invest in specific sectors.</p>
              </button>
              <button
                type="button"
                onClick={() => setThesisType("sector_agnostic")}
                className={`text-left rounded-lg border p-4 transition-all ${
                  thesisType === "sector_agnostic" ? "border-teal-500 bg-teal-950/30" : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500"
                }`}
              >
                <p className="text-sm font-semibold text-white mb-1">Sector-agnostic</p>
                <p className="text-xs text-zinc-500">Team, traction, market — not sector — decide.</p>
              </button>
            </div>
          </Field>

          {thesisType === "sector_driven" && (
            <Field label="Focus sectors *" hint="Pick everything you&apos;d consider — narrow it later in the deep section">
              <ChipGroup options={SECTORS_TOP} selected={sectors} onToggle={toggle(setSectors)} />
            </Field>
          )}

          <Field label="Focus stages *">
            <ChipGroup options={STAGES} selected={stages} onToggle={toggle(setStages)} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Check size — min" hint="USD">
              <input type="number" className={inputClass} placeholder="100000" />
            </Field>
            <Field label="Check size — max" hint="USD">
              <input type="number" className={inputClass} placeholder="500000" />
            </Field>
          </div>

          <Field label="Regions" hint="Pick the regions you operate in — saves you picking 12 countries">
            <ChipGroup options={REGIONS} selected={regions} onToggle={toggle(setRegions)} />
          </Field>

          <Field label="Specific countries" hint="Optional — pick individual countries to override regional defaults">
            <ChipGroup options={COUNTRIES} selected={countries} onToggle={toggle(setCountries)} />
          </Field>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 rounded-full bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
              Submit profile
            </button>
            <button
              type="button"
              onClick={() => setShowDeep((s) => !s)}
              className="flex-1 rounded-full border border-amber-700/50 bg-amber-950/30 py-3 text-sm font-semibold text-amber-300 hover:bg-amber-900/30 transition-colors"
            >
              {showDeep ? "↑ Hide deep section" : "↓ Go deeper for sharper matches"}
            </button>
          </div>
        </div>

        {/* ── OPTIONAL DEEP SECTION ───────────────────────────────────────── */}
        {showDeep && (
          <div className="mt-16 animate-fade-in">
            <div className="mb-2 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full border border-amber-600 bg-amber-950/30 text-amber-300 text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-xl font-bold text-white">Go deeper</h2>
              <span className="text-xs text-amber-400/80 ml-2">+5 minutes · sharper matches</span>
            </div>
            <p className="text-sm text-zinc-500 mb-8">
              Each section below tightens what we surface to you. Skip any of it. Everything here is optional.
            </p>

            <div className="space-y-7 rounded-2xl border border-amber-900/40 bg-zinc-950/40 p-6">
              <Field label="Sector expertise" hint="Areas of deep domain knowledge — focused theses outrank generalist ones">
                <ChipGroup options={SECTORS_TOP} selected={sectorExpertise} onToggle={toggle(setSectorExpertise)} color="emerald" />
              </Field>

              {/* 5-dim ontology pickers — modality, technology, audience, business */}
              <div className="pt-2 border-t border-zinc-800/60">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">The full picture</p>
                <p className="text-xs text-zinc-600 mb-6 max-w-prose">
                  Beyond sectors, the matching considers four more dimensions investors think in. The more you tag,
                  the tighter the matches.
                </p>

                <div className="space-y-6">
                  <Field label="Modality" hint="How the businesses you back deliver value — SaaS, marketplace, hardware, services, etc.">
                    <ChipGroup options={MODALITY} selected={modality} onToggle={toggle(setModality)} color="emerald" />
                  </Field>

                  <Field label="Technology" hint="What they&apos;re built on — beyond AI">
                    <ChipGroup options={TECHNOLOGY} selected={technology} onToggle={toggle(setTechnology)} color="cyan" />
                  </Field>

                  <Field label="Audience" hint="Who they sell to — enterprise, SMB, mass consumer, household, etc.">
                    <ChipGroup options={AUDIENCE} selected={audience} onToggle={toggle(setAudience)} color="violet" />
                  </Field>

                  <Field label="Business model" hint="How they make money — subscription, marketplace take-rate, transactional, etc.">
                    <ChipGroup options={BUSINESS} selected={business} onToggle={toggle(setBusiness)} color="amber" />
                  </Field>
                </div>
              </div>

              {/* Structured hard nos — sectors + stages + patterns */}
              <div className="pt-2 border-t border-zinc-800/60">
                <p className="text-xs font-bold uppercase tracking-widest text-rose-300 mb-1">Hard nos</p>
                <p className="text-xs text-zinc-600 mb-6 max-w-prose">
                  Sectors you&apos;ll never touch, stages you don&apos;t play in, founder patterns you avoid. We exclude these
                  from your matches up front.
                </p>

                <div className="space-y-6">
                  <Field label="Sectors I&apos;ll never invest in">
                    <ChipGroup options={SECTORS_TOP} selected={hardNoSectors} onToggle={toggle(setHardNoSectors)} color="rose" />
                  </Field>

                  <Field label="Stages I don&apos;t play in">
                    <ChipGroup options={STAGES} selected={hardNoStages} onToggle={toggle(setHardNoStages)} color="rose" />
                  </Field>

                  <Field label="Founder profiles I avoid">
                    <ChipGroup options={ANTI_PATTERNS} selected={antiPatterns} onToggle={toggle(setAntiPatterns)} color="rose" format={(s) => String(s)} />
                  </Field>

                  <Field label="Other deal breakers" hint="Free text — anything else that&apos;s a no for you">
                    <textarea rows={2} className={inputClass} placeholder="e.g. flat valuations, no IP, prior litigation, etc." />
                  </Field>
                </div>
              </div>

              <div className="pt-3">
                <button className="w-full rounded-full bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
                  Submit profile · sharper matches
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-12 text-center text-xs text-zinc-600">
          This is a mockup — see <Link href="/investors/join" className="text-teal-400 underline">/investors/join</Link> for the live form.
        </p>
      </div>
    </div>
  );
}
