"use client";

import Link from "next/link";
import { useRef, useState } from "react";

// MOCKUP — option C investor signup, v3.
// Adds investor_type (was a real gap — matcher uses type_fit but the form
// never captured it). Adaptive nudging: angels and family offices typically
// have thin theses, so the deep section becomes "almost required" for them
// while VCs with richer theses can comfortably skip. Honest LLM messaging:
// "we'll auto-detect from your thesis IF it's substantive."

const INVESTOR_TYPES = [
  { key: "vc", label: "VC fund", desc: "Institutional fund — partner, principal, or analyst." },
  { key: "angel", label: "Angel", desc: "Individual investor writing personal checks." },
  { key: "family_office", label: "Family office", desc: "Single or multi-family office allocating capital." },
  { key: "cvc", label: "Corporate VC", desc: "Strategic arm of an operating company." },
  { key: "syndicate", label: "Syndicate lead", desc: "Lead investor pooling LPs per deal." },
  { key: "accelerator", label: "Accelerator / platform", desc: "Program-driven investor (YC, Techstars, etc.)." },
  { key: "other", label: "Other", desc: "Operator-investor, scout, fund-of-funds, etc." },
] as const;

// Types where the thesis is typically THIN — adaptive nudge pushes them
// to the deep section more aggressively.
const THIN_THESIS_TYPES = new Set(["angel", "family_office", "syndicate", "other"]);

const SECTORS_TOP = [
  "ai_ml", "fintech", "healthtech", "enterprise_saas", "consumer",
  "climate_energy", "hardware", "security", "infrastructure",
  "crypto_web3", "logistics", "real_estate", "defense", "legal",
  "education", "services", "retail", "gaming", "media", "other",
];

const STAGES = ["pre_seed", "seed", "series_a", "series_b", "series_c", "growth"];

const REGIONS = [
  "United States", "Canada", "LATAM", "EU", "United Kingdom", "Nordics",
  "MENA", "Sub-Saharan Africa", "South Asia", "SEA",
  "Greater China", "Japan", "Australia / NZ", "Global",
];

const COUNTRIES_OVERRIDE = [
  "United States", "Canada", "Mexico", "Brazil", "Argentina", "Colombia",
  "Chile", "Peru", "United Kingdom", "Germany", "France", "Spain",
  "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Switzerland", "Ireland", "Portugal", "Poland", "Israel", "UAE",
  "Saudi Arabia", "Egypt", "India", "Singapore", "Vietnam", "Thailand",
  "Indonesia", "Malaysia", "Philippines", "Korea", "Japan", "Taiwan",
  "Hong Kong", "China", "Australia", "New Zealand",
  "Nigeria", "Kenya", "South Africa", "Ghana", "Rwanda",
];

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

const AUDIENCE_DEEP = [
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
  const [investorType, setInvestorType] = useState<string | null>(null);
  const [thesisText, setThesisText] = useState("");
  const [thesisType, setThesisType] = useState<"sector_driven" | "sector_agnostic" | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [audienceSimple, setAudienceSimple] = useState<"b2b" | "b2c" | "both" | null>(null);
  const [hardNoBasic, setHardNoBasic] = useState<string[]>([]);

  // Deep section state
  const [showDeep, setShowDeep] = useState(false);
  const deepRef = useRef<HTMLDivElement | null>(null);
  const [modality, setModality] = useState<string[]>([]);
  const [technology, setTechnology] = useState<string[]>([]);
  const [audienceDeep, setAudienceDeep] = useState<string[]>([]);
  const [business, setBusiness] = useState<string[]>([]);
  const [sectorExpertise, setSectorExpertise] = useState<string[]>([]);
  const [hardNoStages, setHardNoStages] = useState<string[]>([]);
  const [antiPatterns, setAntiPatterns] = useState<string[]>([]);
  const [countriesOverride, setCountriesOverride] = useState<string[]>([]);

  const toggle = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (v: T) => {
    setter((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));
  };

  function openDeep() {
    setShowDeep(true);
    setTimeout(() => {
      deepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  // Adaptive nudge logic — determines how strongly to push the "go deep" CTA.
  const thesisIsThin = thesisText.trim().length < 200;
  const typeIsThinThesis = investorType != null && THIN_THESIS_TYPES.has(investorType);
  const shouldNudgeStrongly = typeIsThinThesis || thesisIsThin;
  const isVcType = investorType === "vc";

  return (
    <div className="relative">
      <div className="grid-bg" />

      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-bold">Mockup v3</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">option C — investor type + adaptive nudge</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 leading-tight">Join raise(fn) as an investor.</h1>
        <p className="text-zinc-400 leading-relaxed mb-12">
          We&apos;ll only reach out when a founder fits your thesis. The faster you fill this out, the sharper the matches.
        </p>

        {/* ── BASICS ──────────────────────────────────────────────────────── */}
        <div className="mb-2 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">1</span>
          <h2 className="text-xl font-bold text-white">The basics</h2>
          <span className="text-xs text-zinc-500 ml-2">~5 minutes</span>
        </div>
        <p className="text-sm text-zinc-500 mb-8">
          High-signal answers an investor knows off the top of their head.
        </p>

        <div className="space-y-7 rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-6">
          {/* Investor type — REQUIRED, top of form. Matcher uses type_fit. */}
          <Field label="What kind of investor are you? *" hint="Drives matching — angels and VCs get scored differently">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INVESTOR_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setInvestorType(t.key)}
                  className={`text-left rounded-lg border p-3 transition-all ${
                    investorType === t.key
                      ? "border-teal-500 bg-teal-950/30"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                  }`}
                >
                  <p className="text-sm font-semibold text-white mb-0.5">{t.label}</p>
                  <p className="text-[11px] text-zinc-500 leading-snug">{t.desc}</p>
                </button>
              ))}
            </div>
          </Field>

          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email *"><input type="email" className={inputClass} placeholder="you@firm.com" /></Field>
            <Field label="Your name"><input className={inputClass} placeholder="Jane Doe" /></Field>
            <Field label={isVcType ? "Firm" : "Firm / fund (if any)"}>
              <input className={inputClass} placeholder={isVcType ? "Firm name" : "Optional"} />
            </Field>
            <Field label="Title"><input className={inputClass} placeholder="GP, Partner, Angel, Principal..." /></Field>
          </div>

          <Field label="Thesis *" hint="Free text — what you invest in, in your own words">
            <textarea
              rows={3}
              className={inputClass}
              value={thesisText}
              onChange={(e) => setThesisText(e.target.value)}
              placeholder={
                isVcType
                  ? "What does your fund invest in? Be specific."
                  : "What do you back? What's your angle? Be specific."
              }
            />
            <p className="mt-2 text-[11px] text-zinc-500">
              {thesisText.trim().length === 0
                ? "We&apos;ll read this to auto-classify the dimensions we don&apos;t ask about (modality, business model, etc.) — works best with 2-3 sentences of detail."
                : thesisText.trim().length < 200
                ? "Short thesis — auto-classification will be light. The deep section below tightens it."
                : "Looks substantive — auto-classification should land most details. Refine in the deep section if you want full control."}
            </p>
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
            <Field label="Focus sectors *">
              <ChipGroup options={SECTORS_TOP} selected={sectors} onToggle={toggle(setSectors)} />
            </Field>
          )}

          <Field label="Focus stages *">
            <ChipGroup options={STAGES} selected={stages} onToggle={toggle(setStages)} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Check size — min" hint="USD">
              <input type="number" className={inputClass} placeholder="50000" />
            </Field>
            <Field label="Check size — max" hint="USD">
              <input type="number" className={inputClass} placeholder="500000" />
            </Field>
          </div>

          {/* Fund size — VC only */}
          {isVcType && (
            <Field label="Fund size" hint="USD — current fund">
              <input type="number" className={inputClass} placeholder="50000000" />
            </Field>
          )}

          <Field label="B2B, B2C, or both?" hint="Top-level audience">
            <div className="grid grid-cols-3 gap-3">
              {(["b2b", "b2c", "both"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAudienceSimple(opt)}
                  className={`text-center rounded-lg border p-3 text-sm font-semibold transition-all uppercase ${
                    audienceSimple === opt ? "border-teal-500 bg-teal-950/30 text-teal-200" : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Regions you invest in" hint="High-level — refine to specific countries in the deep section if needed">
            <ChipGroup options={REGIONS} selected={regions} onToggle={toggle(setRegions)} />
          </Field>

          <Field label="Hard nos" hint="Sectors you&apos;ll never invest in regardless of fit">
            <ChipGroup options={SECTORS_TOP} selected={hardNoBasic} onToggle={toggle(setHardNoBasic)} color="rose" />
          </Field>

          {/* CTAs — adaptive nudge messaging based on investor type / thesis */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 rounded-full bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
                Submit profile
              </button>
              {!showDeep && (
                <button
                  type="button"
                  onClick={openDeep}
                  className={`flex-1 rounded-full border py-3 text-sm font-semibold transition-all ${
                    shouldNudgeStrongly
                      ? "border-amber-500 bg-gradient-to-r from-amber-900/60 to-amber-800/50 text-amber-100 hover:from-amber-800/70 hover:to-amber-700/60 shadow-lg shadow-amber-900/30"
                      : "border-amber-500/60 bg-gradient-to-r from-amber-950/40 to-amber-900/30 text-amber-200 hover:from-amber-900/50 hover:to-amber-800/40"
                  }`}
                >
                  ↓ Go deeper for sharper matches
                </button>
              )}
            </div>
            {/* Adaptive nudge text — only when relevant */}
            {shouldNudgeStrongly && !showDeep && (
              <p className="mt-3 text-xs text-amber-300/90 leading-relaxed text-center">
                {typeIsThinThesis
                  ? `${INVESTOR_TYPES.find((t) => t.key === investorType)?.label}s typically have shorter theses — going deeper meaningfully tightens your matches.`
                  : "Short thesis means lighter auto-classification — going deeper helps."}
              </p>
            )}
          </div>
        </div>

        {/* Bridge between sections — only visible after expand */}
        {showDeep && (
          <div className="mt-12 flex flex-col items-center gap-2 animate-fade-in">
            <div className="text-amber-400 text-2xl animate-bounce">↓</div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-700/60 to-transparent" />
          </div>
        )}

        {/* ── DEEP SECTION ────────────────────────────────────────────────── */}
        {showDeep && (
          <div ref={deepRef} className="mt-8 scroll-mt-8 animate-fade-in">
            <div className="mb-2 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full border-2 border-amber-500 bg-amber-950/30 text-amber-300 text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-xl font-bold text-amber-100">Go deeper · refine the matching</h2>
            </div>
            <p className="text-sm text-zinc-400 mb-8 max-w-prose">
              Every section below is optional. Fill in what you want to set yourself — leave the rest to the auto-classification.
            </p>

            <div className="space-y-7 rounded-2xl border border-amber-700/40 bg-gradient-to-b from-amber-950/10 to-zinc-950/40 p-6 shadow-2xl shadow-amber-900/10">
              <Field label="Sector expertise" hint="Areas of deep domain knowledge — focused theses outrank generalist ones">
                <ChipGroup options={SECTORS_TOP} selected={sectorExpertise} onToggle={toggle(setSectorExpertise)} color="emerald" />
              </Field>

              <div className="pt-2 border-t border-zinc-800/60">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Refine the auto-classification</p>
                <p className="text-xs text-zinc-600 mb-6 max-w-prose">
                  The matcher considers four dimensions beyond sectors. Set them yourself for full control.
                </p>

                <div className="space-y-6">
                  <Field label="Modality" hint="How the businesses you back deliver value — SaaS, marketplace, hardware, services, etc.">
                    <ChipGroup options={MODALITY} selected={modality} onToggle={toggle(setModality)} color="emerald" />
                  </Field>

                  <Field label="Technology" hint="What they&apos;re built on — beyond AI">
                    <ChipGroup options={TECHNOLOGY} selected={technology} onToggle={toggle(setTechnology)} color="cyan" />
                  </Field>

                  <Field label="Specific audience" hint="Refine beyond B2B / B2C — household, SMB, enterprise, developer, etc.">
                    <ChipGroup options={AUDIENCE_DEEP} selected={audienceDeep} onToggle={toggle(setAudienceDeep)} color="violet" />
                  </Field>

                  <Field label="Business model" hint="How they make money — subscription, marketplace take-rate, transactional, etc.">
                    <ChipGroup options={BUSINESS} selected={business} onToggle={toggle(setBusiness)} color="amber" />
                  </Field>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/60">
                <p className="text-xs font-bold uppercase tracking-widest text-rose-300 mb-1">Hard nos · more granular</p>
                <p className="text-xs text-zinc-600 mb-6 max-w-prose">
                  Beyond sectors — stages you don&apos;t play in, founder profiles you avoid, and any other dealbreakers.
                </p>

                <div className="space-y-6">
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

              <div className="pt-2 border-t border-zinc-800/60">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Country-level geography</p>
                <p className="text-xs text-zinc-600 mb-6 max-w-prose">
                  Override your regional defaults with specific countries — useful if you operate in a subset of a region (e.g. LATAM but only Brazil + Mexico).
                </p>

                <Field label="Specific countries">
                  <ChipGroup options={COUNTRIES_OVERRIDE} selected={countriesOverride} onToggle={toggle(setCountriesOverride)} />
                </Field>
              </div>

              <div className="pt-3 flex gap-3">
                <button className="flex-1 rounded-full bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
                  Submit profile · sharper matches
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeep(false)}
                  className="rounded-full border border-zinc-700 bg-zinc-900/50 px-6 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  ↑ Collapse
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-16 text-center text-xs text-zinc-600">
          Mockup v3 — see <Link href="/investors/join" className="text-teal-400 underline">/investors/join</Link> for the live form.
        </p>
      </div>
    </div>
  );
}
