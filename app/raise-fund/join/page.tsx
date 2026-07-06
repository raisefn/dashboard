"use client";

import Link from "next/link";
import { useState } from "react";

// /raise-fund/join — signup form for fund raisers.
// Two-tier structure: required basics + optional deep section.
// Field spec from .claude/plans/fund_raise_plan_v1_execution.md § 5.
//
// This form is FRONTEND-ONLY in Phase 1. The backend endpoint
// POST /v1/brain/gp/signup lands in Phase 2 (brain branch). Until
// then, submission will 404 gracefully — that's expected during
// build. Users can't reach this page yet anyway (feature flag off).

const STAGE_OPTIONS = [
  "pre_seed", "seed", "series_a", "series_b", "growth", "any",
] as const;

const SECTOR_OPTIONS = [
  "ai_ml", "fintech", "healthtech", "enterprise_saas", "consumer",
  "climate_energy", "hardware", "security", "infrastructure",
  "crypto_web3", "logistics", "real_estate", "defense", "legal", "other",
] as const;

const GEO_OPTIONS = [
  "us", "canada", "latam", "eu", "uk", "nordics", "mena",
  "sub_saharan_africa", "south_asia", "sea", "greater_china",
  "japan", "australia_nz", "global",
] as const;

const RAISING_OPTIONS = [
  "Venture Fund I",
  "Venture Fund II+",
  "Real Estate Deal",
  "Real Estate Fund",
  "Angel Syndicate SPV",
  "Other",
] as const;

const FUND_SIZE_OPTIONS = [
  "<$5M", "$5-15M", "$15-50M", "$50-150M", "$150M+",
] as const;

const CLOSE_OPTIONS = [
  "Immediate (60d)",
  "Q1 (90-180d)",
  "Q2-Q3 (6-9mo)",
  "TBD",
] as const;

export default function RaiseFundJoinPage() {
  const [showDeep, setShowDeep] = useState(false);
  const [stages, setStages] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [geos, setGeos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleMulti = (
    value: string,
    current: string[],
    setter: (next: string[]) => void,
    max: number = 3,
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else if (current.length < max) {
      setter([...current, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      email: data.get("email"),
      name: data.get("name"),
      firm_name: data.get("firm_name"),
      role: data.get("role"),
      raising: data.get("raising"),
      fund_size_target: data.get("fund_size_target"),
      vintage: data.get("vintage"),
      stage_focus: stages,
      sector_focus: sectors,
      geo_focus: geos,
      close_target: data.get("close_target"),
      password: data.get("password"),
      thesis: data.get("thesis") || null,
      background: data.get("background") || null,
      existing_lps: data.get("existing_lps") || null,
      hard_requirements: data.get("hard_requirements") || null,
    };

    try {
      const res = await fetch("/v1/brain/gp/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const body = await res.json();
        window.location.href = body.redirect || "/raise-fund/deploy";
      } else if (res.status === 404 || res.status === 501) {
        setSubmitError(
          "The fund raise plan is not yet live. Sign up will open shortly — leave your email at hello@raisefn.com to be notified.",
        );
      } else {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.detail || `Signup failed (${res.status}). Try again.`);
      }
    } catch {
      setSubmitError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12">
          <Link
            href="/raise-fund"
            className="text-xs text-teal-400 hover:text-teal-300"
          >
            ← Back to overview
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mt-6 mb-4">
            Get started
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            Tell us about what you're raising. The agent starts running as
            soon as you finish. 5 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Contact ── */}
          <section>
            <h2 className="text-lg font-semibold mb-4">You</h2>
            <div className="space-y-4">
              <FormField
                name="name"
                label="Full name"
                required
                placeholder="Jane Smith"
              />
              <FormField
                name="email"
                label="Email"
                type="email"
                required
                placeholder="jane@yourfirm.com"
              />
              <FormField
                name="password"
                label="Password"
                type="password"
                required
                minLength={8}
                placeholder="Min 8 characters"
              />
              <FormSelect
                name="role"
                label="Your role"
                required
                options={[
                  "General Partner",
                  "Managing Partner",
                  "Principal",
                  "Founding Partner",
                  "Managing Director",
                  "Real Estate Developer",
                  "Syndicate Lead",
                  "Other",
                ]}
              />
              <FormField
                name="firm_name"
                label="Firm name"
                required
                placeholder="Your firm or entity"
              />
            </div>
          </section>

          {/* ── The raise ── */}
          <section>
            <h2 className="text-lg font-semibold mb-4">The raise</h2>
            <div className="space-y-4">
              <FormSelect
                name="raising"
                label="What are you raising?"
                required
                options={[...RAISING_OPTIONS]}
              />
              <FormSelect
                name="fund_size_target"
                label="Fund / deal size target"
                required
                options={[...FUND_SIZE_OPTIONS]}
              />
              <FormField
                name="vintage"
                label="Vintage / expected close year"
                placeholder="2026"
              />
              <MultiSelectField
                label="Primary stage focus"
                required
                selected={stages}
                onToggle={(v) => toggleMulti(v, stages, setStages)}
                options={[...STAGE_OPTIONS]}
                labelFor={stageLabelFor}
                max={3}
                hint="Pick 1-3"
              />
              <MultiSelectField
                label="Primary sector focus"
                required
                selected={sectors}
                onToggle={(v) => toggleMulti(v, sectors, setSectors)}
                options={[...SECTOR_OPTIONS]}
                labelFor={sectorLabelFor}
                max={3}
                hint="Pick 1-3"
              />
              <MultiSelectField
                label="Primary geography"
                required
                selected={geos}
                onToggle={(v) => toggleMulti(v, geos, setGeos)}
                options={[...GEO_OPTIONS]}
                labelFor={geoLabelFor}
                max={3}
                hint="Pick 1-3"
              />
              <FormSelect
                name="close_target"
                label="When do you want to close?"
                required
                options={[...CLOSE_OPTIONS]}
              />
            </div>
          </section>

          {/* ── Optional deep section ── */}
          <section>
            <button
              type="button"
              onClick={() => setShowDeep(!showDeep)}
              className="text-sm text-teal-400 hover:text-teal-300"
            >
              {showDeep ? "− Hide detail" : "+ Add more detail"} (optional)
            </button>
            {showDeep && (
              <div className="mt-4 space-y-4">
                <FormTextarea
                  name="thesis"
                  label="Fund thesis"
                  placeholder="One paragraph on why this fund exists"
                />
                <FormTextarea
                  name="background"
                  label="Your background / prior track record"
                  placeholder="Prior funds, exits, deal experience"
                />
                <FormTextarea
                  name="existing_lps"
                  label="Existing LP relationships"
                  placeholder="LPs already committed or interested. Paste names or emails."
                />
                <FormTextarea
                  name="hard_requirements"
                  label="Hard requirements / deal breakers"
                  placeholder="LPs to exclude, structural asks, non-negotiables"
                />
              </div>
            )}
          </section>

          {/* ── Submit ── */}
          <div className="pt-4 border-t border-zinc-800">
            <label className="flex items-start gap-2 mb-4 text-sm text-zinc-400">
              <input type="checkbox" required className="mt-1" />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-teal-400 hover:underline">
                  terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-teal-400 hover:underline">
                  privacy policy
                </Link>
                .
              </span>
            </label>
            {submitError && (
              <div className="rounded-md border border-amber-800 bg-amber-950/40 p-3 text-sm text-amber-300 mb-4">
                {submitError}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-teal-500 px-8 py-3 text-base font-semibold text-black hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing up..." : "Get started"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/* ── Field helpers ────────────────────────────────────────────── */

function FormField({
  name,
  label,
  type = "text",
  required = false,
  placeholder = "",
  minLength,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-teal-400 ml-1">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
      />
    </div>
  );
}

function FormTextarea({
  name,
  label,
  placeholder = "",
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
      />
    </div>
  );
}

function FormSelect({
  name,
  label,
  required = false,
  options,
}: {
  name: string;
  label: string;
  required?: boolean;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-teal-400 ml-1">*</span>}
      </label>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
      >
        <option value="" disabled>
          Choose one
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function MultiSelectField({
  label,
  required = false,
  selected,
  onToggle,
  options,
  labelFor,
  max,
  hint,
}: {
  label: string;
  required?: boolean;
  selected: string[];
  onToggle: (value: string) => void;
  options: string[];
  labelFor: (value: string) => string;
  max: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-teal-400 ml-1">*</span>}
        {hint && <span className="text-xs text-zinc-500 ml-2">{hint}</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const disabled = !isSelected && selected.length >= max;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              disabled={disabled}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? "border-teal-500 bg-teal-500/20 text-teal-300"
                  : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-500"
              } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {labelFor(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Human-readable labels for the enum values ─────────────────── */

function stageLabelFor(v: string): string {
  const m: Record<string, string> = {
    pre_seed: "Pre-seed",
    seed: "Seed",
    series_a: "Series A",
    series_b: "Series B",
    growth: "Growth",
    any: "Any stage",
  };
  return m[v] || v;
}

function sectorLabelFor(v: string): string {
  const m: Record<string, string> = {
    ai_ml: "AI / ML",
    fintech: "Fintech",
    healthtech: "Healthtech",
    enterprise_saas: "Enterprise SaaS",
    consumer: "Consumer",
    climate_energy: "Climate / Energy",
    hardware: "Hardware",
    security: "Security",
    infrastructure: "Infrastructure",
    crypto_web3: "Crypto / Web3",
    logistics: "Logistics",
    real_estate: "Real Estate",
    defense: "Defense",
    legal: "Legal",
    other: "Other",
  };
  return m[v] || v;
}

function geoLabelFor(v: string): string {
  const m: Record<string, string> = {
    us: "US",
    canada: "Canada",
    latam: "LATAM",
    eu: "EU",
    uk: "UK",
    nordics: "Nordics",
    mena: "MENA",
    sub_saharan_africa: "Sub-Saharan Africa",
    south_asia: "South Asia",
    sea: "SEA",
    greater_china: "Greater China",
    japan: "Japan",
    australia_nz: "Australia / NZ",
    global: "Global",
  };
  return m[v] || v;
}
