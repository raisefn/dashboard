"use client";

import { useMemo, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const SECTORS = [
  "ai_ml", "fintech", "healthtech", "enterprise_saas", "consumer",
  "climate_energy", "hardware", "security", "infrastructure",
  "crypto_web3", "logistics", "real_estate", "defense", "legal", "other",
];
const STAGES = ["pre_seed", "seed", "series_a", "series_b", "series_c", "growth"];
// Country names match founder.location free-text via case-insensitive substring,
// so use full English country names. Empty selection = "no geo filter" — investor
// matches founders anywhere.
const COUNTRIES = [
  "United States", "Canada", "Mexico", "Brazil", "United Kingdom", "Germany",
  "France", "Spain", "Italy", "Netherlands", "Sweden", "Switzerland",
  "Ireland", "Israel", "UAE", "Saudi Arabia", "India", "Singapore",
  "Australia", "Japan", "Nigeria", "Kenya", "South Africa",
];
const HARD_REQUIREMENTS: { key: string; label: string }[] = [
  { key: "local", label: "Must be local (geographic proximity)" },
  { key: "team", label: "Must have cofounder(s)" },
  { key: "revenue", label: "Must have measurable traction / revenue" },
];
const CADENCES: { key: string; label: string }[] = [
  { key: "continuous", label: "Continuous" },
  { key: "monthly", label: "Monthly committee" },
  { key: "quarterly", label: "Quarterly committee" },
];

type AdditionalContact = { name: string; email: string; role: string };
type ThesisType = "sector_driven" | "sector_agnostic";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function InvestorJoinPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [thesis, setThesis] = useState("");
  const [thesisType, setThesisType] = useState<ThesisType | null>(null);
  const [checkMin, setCheckMin] = useState("");
  const [checkMax, setCheckMax] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [hardRequirements, setHardRequirements] = useState<string[]>([]);
  const [geoScope, setGeoScope] = useState("");
  const [committeeCadence, setCommitteeCadence] = useState<string | null>(null);
  const [additionalContacts, setAdditionalContacts] = useState<AdditionalContact[]>([]);
  const [isDeploying, setIsDeploying] = useState<boolean | null>(null);
  const [leadsRounds, setLeadsRounds] = useState<boolean | null>(null);
  const [fundSize, setFundSize] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const localRequired = hardRequirements.includes("local");

  const submitDisabled = useMemo(() => {
    if (!email || !thesis || !thesisType || stages.length === 0) return true;
    if (thesisType === "sector_driven" && sectors.length === 0) return true;
    if (TURNSTILE_SITE_KEY && !turnstileToken) return true;
    return false;
  }, [email, thesis, thesisType, sectors, stages, turnstileToken]);

  function toggle(set: string[], value: string): string[] {
    return set.includes(value) ? set.filter((s) => s !== value) : [...set, value];
  }

  function pickThesisType(t: ThesisType) {
    setThesisType(t);
    // Clearing sectors when switching to sector-agnostic keeps the backend
    // validator happy and matches what the user sees on screen.
    if (t === "sector_agnostic") setSectors([]);
  }

  function addContact() {
    setAdditionalContacts((cur) => [...cur, { name: "", email: "", role: "" }]);
  }
  function updateContact(idx: number, field: keyof AdditionalContact, value: string) {
    setAdditionalContacts((cur) =>
      cur.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
  }
  function removeContact(idx: number) {
    setAdditionalContacts((cur) => cur.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitDisabled) return;
    setSubmitState("submitting");
    setSubmitError(null);

    try {
      // Filter out additional contacts that are incomplete — name + email
      // both required, role optional. Backend rejects partial rows.
      const cleanContacts = additionalContacts
        .map((c) => ({
          name: c.name.trim(),
          email: c.email.trim(),
          role: c.role.trim() || undefined,
        }))
        .filter((c) => c.name && c.email);

      const body: Record<string, unknown> = {
        email: email.trim().toLowerCase(),
        name: name || undefined,
        firm_name: firmName || undefined,
        title: title || undefined,
        website: website.trim() || undefined,
        thesis: thesis.trim(),
        thesis_type: thesisType,
        check_size_min: checkMin ? Number(checkMin) : undefined,
        check_size_max: checkMax ? Number(checkMax) : undefined,
        focus_sectors: thesisType === "sector_driven" ? sectors : [],
        focus_stages: stages,
        focus_countries: countries,
        hard_requirements: hardRequirements,
        // Only send geo_scope when "local" is actually checked — otherwise
        // the field is stale UI state the user can't see.
        geo_scope: localRequired && geoScope.trim() ? geoScope.trim() : undefined,
        committee_cadence: committeeCadence || undefined,
        additional_contacts: cleanContacts.length ? cleanContacts : undefined,
        is_deploying: isDeploying,
        leads_rounds: leadsRounds,
        fund_size_usd: fundSize ? Number(fundSize) : undefined,
        location: location || undefined,
        bio: bio || undefined,
        turnstile_token: turnstileToken,
      };
      const res = await fetch("/api/investors/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        // Brain returns structured detail for the "already exists" case;
        // surface that cleanly without exposing the rest of the error shape.
        const msg =
          (data?.detail && typeof data.detail === "object" && data.detail.message) ||
          (typeof data?.detail === "string" ? data.detail : null) ||
          data?.error ||
          "Submission failed. Try again or email team@raisefn.com.";
        throw new Error(msg);
      }
      setSubmitState("done");
    } catch (err) {
      // Reset Turnstile so the user can resubmit
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
      setSubmitState("error");
    }
  }

  if (submitState === "done") {
    return (
      <div className="max-w-2xl mx-auto p-8 text-zinc-200">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-orange-400 mb-3">You&apos;re in.</h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            We&apos;ll reach out the first time a founder&apos;s thesis matches yours.
            No spam, no fee, no commitment. Email{" "}
            <a href="mailto:team@raisefn.com" className="text-teal-400 hover:text-teal-300">
              team@raisefn.com
            </a>{" "}
            anytime to update or remove your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 text-zinc-200">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Join the v1 investor network</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Founders running real raises through raise(fn). Set your thesis once, get notified
          when a matching founder is raising. No fee, no commitment — just curated intros
          from our team when there&apos;s a fit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Email *">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@firm.com"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Sarah Chen" />
          </Field>
          <Field label="Firm">
            <input value={firmName} onChange={(e) => setFirmName(e.target.value)} className={inputClass} placeholder="Crystal Ventures" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Partner" />
          </Field>
          <Field label="Website">
            <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://yourfirm.com" />
          </Field>
        </div>

        <Field label="Thesis *">
          <textarea
            required
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="What do you invest in? Be specific — this is what we'll match founder thesis against."
          />
        </Field>

        <Field label="How do you choose investments? *">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <RadioCard
              selected={thesisType === "sector_driven"}
              onClick={() => pickThesisType("sector_driven")}
              title="Sector-driven"
              body="I invest in specific sectors. I'll pick them below."
            />
            <RadioCard
              selected={thesisType === "sector_agnostic"}
              onClick={() => pickThesisType("sector_agnostic")}
              title="Sector-agnostic"
              body="Sector doesn't drive my decision — I evaluate on criteria like team, traction, market fit."
            />
          </div>
        </Field>

        {thesisType === "sector_driven" && (
          <Field label="Focus sectors *">
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSectors((cur) => toggle(cur, s))}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    sectors.includes(s)
                      ? "border-teal-500 bg-teal-950/40 text-teal-200"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </Field>
        )}

        <Field label="Focus stages *">
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStages((cur) => toggle(cur, s))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  stages.includes(s)
                    ? "border-teal-500 bg-teal-950/40 text-teal-200"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {s.replace(/_/g, "-")}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Hard requirements (optional — must-haves for any investment)">
          <div className="flex flex-col gap-2">
            {HARD_REQUIREMENTS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setHardRequirements((cur) => toggle(cur, r.key))}
                className={`text-left text-xs px-3 py-2 rounded-md border transition-all ${
                  hardRequirements.includes(r.key)
                    ? "border-teal-500 bg-teal-950/40 text-teal-200"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                <span className="mr-2">{hardRequirements.includes(r.key) ? "✓" : "○"}</span>
                {r.label}
              </button>
            ))}
          </div>
        </Field>

        {localRequired && (
          <Field label="Where is local for you? (e.g., California, NYC metro)">
            <input
              value={geoScope}
              onChange={(e) => setGeoScope(e.target.value)}
              className={inputClass}
              placeholder="California"
            />
          </Field>
        )}

        <Field label="Decision cadence (optional)">
          <div className="flex gap-2">
            {CADENCES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() =>
                  setCommitteeCadence((cur) => (cur === c.key ? null : c.key))
                }
                className={`text-xs px-3 py-1.5 rounded-md border transition-all ${
                  committeeCadence === c.key
                    ? "border-teal-500 bg-teal-950/40 text-teal-200"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Countries you invest in (optional — leave blank for no geo filter)">
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCountries((cur) => toggle(cur, c))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  countries.includes(c)
                    ? "border-teal-500 bg-teal-950/40 text-teal-200"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Check size min (USD)">
            <input type="number" value={checkMin} onChange={(e) => setCheckMin(e.target.value)} className={inputClass} placeholder="100000" />
          </Field>
          <Field label="Check size max (USD)">
            <input type="number" value={checkMax} onChange={(e) => setCheckMax(e.target.value)} className={inputClass} placeholder="500000" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Currently deploying?">
            <TriToggle value={isDeploying} onChange={setIsDeploying} />
          </Field>
          <Field label="Leads rounds?">
            <TriToggle value={leadsRounds} onChange={setLeadsRounds} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Fund size (USD)">
            <input type="number" value={fundSize} onChange={(e) => setFundSize(e.target.value)} className={inputClass} placeholder="50000000" />
          </Field>
          <Field label="Location">
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="San Francisco, CA" />
          </Field>
        </div>

        <Field label="Additional contacts at your firm (optional)">
          <div className="space-y-2">
            {additionalContacts.map((c, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  value={c.name}
                  onChange={(e) => updateContact(idx, "name", e.target.value)}
                  className={`${inputClass} col-span-4`}
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={c.email}
                  onChange={(e) => updateContact(idx, "email", e.target.value)}
                  className={`${inputClass} col-span-4`}
                  placeholder="Email"
                />
                <input
                  value={c.role}
                  onChange={(e) => updateContact(idx, "role", e.target.value)}
                  className={`${inputClass} col-span-3`}
                  placeholder="Role"
                />
                <button
                  type="button"
                  onClick={() => removeContact(idx)}
                  className="col-span-1 text-zinc-500 hover:text-red-400 text-sm"
                  aria-label="Remove contact"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addContact}
              className="text-xs text-teal-400 hover:text-teal-300"
            >
              + Add contact
            </button>
          </div>
        </Field>

        <Field label="Bio (optional)">
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className={inputClass} placeholder="Background, prior firms, notable bets…" />
        </Field>

        {TURNSTILE_SITE_KEY && (
          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              options={{ theme: "dark", size: "normal" }}
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken(null)}
              onExpire={() => setTurnstileToken(null)}
            />
          </div>
        )}

        {submitError && (
          <div className="rounded-md border border-red-700/40 bg-red-950/20 p-3 text-xs text-red-300">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitDisabled || submitState === "submitting"}
          className="w-full rounded-full border border-orange-700/50 bg-orange-950/30 py-3 text-sm font-medium text-orange-300 transition-all hover:border-orange-500 hover:bg-orange-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitState === "submitting" ? "Submitting…" : "Join the network"}
        </button>

        <p className="text-center text-xs text-zinc-600">
          Questions? <a href="mailto:team@raisefn.com" className="text-teal-400 hover:text-teal-300">team@raisefn.com</a>
        </p>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-teal-500 focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function TriToggle({ value, onChange }: { value: boolean | null; onChange: (v: boolean | null) => void }) {
  return (
    <div className="flex gap-1.5">
      {[
        { key: true, label: "Yes" },
        { key: false, label: "No" },
        { key: null, label: "Unknown" },
      ].map((opt) => (
        <button
          key={String(opt.key)}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`text-xs px-3 py-1.5 rounded-md border ${
            value === opt.key
              ? "border-teal-500 bg-teal-950/40 text-teal-200"
              : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function RadioCard({
  selected,
  onClick,
  title,
  body,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left px-3 py-3 rounded-md border transition-all ${
        selected
          ? "border-teal-500 bg-teal-950/40"
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
      }`}
    >
      <div className={`text-sm font-medium mb-1 ${selected ? "text-teal-200" : "text-zinc-300"}`}>
        {title}
      </div>
      <div className="text-xs text-zinc-500 leading-relaxed">{body}</div>
    </button>
  );
}
