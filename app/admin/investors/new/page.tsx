"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SECTORS = [
  "ai_ml", "fintech", "healthtech", "enterprise_saas", "consumer",
  "climate_energy", "hardware", "security", "infrastructure",
  "crypto_web3", "logistics", "real_estate", "defense", "legal", "other",
];
const STAGES = ["pre_seed", "seed", "series_a", "series_b", "series_c", "growth"];

type ExistingInvestor = {
  email: string;
  role: string | null;
  name: string | null;
  firm_name: string | null;
  title: string | null;
  thesis: string | null;
  check_size_min: number | null;
  check_size_max: number | null;
  focus_sectors: string[] | null;
  focus_stages: string[] | null;
  is_deploying: boolean | null;
  leads_rounds: boolean | null;
  fund_size_usd: number | null;
  location: string | null;
  bio: string | null;
};

export default function AddInvestorPage() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [title, setTitle] = useState("");
  const [thesis, setThesis] = useState("");
  const [checkMin, setCheckMin] = useState("");
  const [checkMax, setCheckMax] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState<boolean | null>(null);
  const [leadsRounds, setLeadsRounds] = useState<boolean | null>(null);
  const [fundSize, setFundSize] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [notes, setNotes] = useState("");
  const [meetingContext, setMeetingContext] = useState("");

  // Lookup + submit state
  const [existing, setExisting] = useState<ExistingInvestor | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "confirming" | "submitting" | "done" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: boolean; merged: boolean } | null>(null);

  // Auth bootstrap
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthToken(session?.access_token ?? null);
      setAuthedEmail(session?.user?.email ?? null);
      setAuthReady(true);
    });
  }, []);

  const submitDisabled = useMemo(() => {
    return !email || !thesis || sectors.length === 0 || stages.length === 0;
  }, [email, thesis, sectors, stages]);

  function toggle(set: string[], value: string): string[] {
    return set.includes(value) ? set.filter(s => s !== value) : [...set, value];
  }

  async function lookupExisting(emailValue: string) {
    if (!emailValue || !authToken) {
      setExisting(null);
      return;
    }
    setLookupLoading(true);
    try {
      const res = await fetch(
        `/v1/brain/admin/investors?email=${encodeURIComponent(emailValue)}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setExisting(data.existing);
      } else {
        setExisting(null);
      }
    } catch {
      setExisting(null);
    } finally {
      setLookupLoading(false);
    }
  }

  function handleEmailBlur() {
    if (email.trim()) lookupExisting(email.trim().toLowerCase());
  }

  async function handleSubmit(merge: boolean) {
    if (!authToken) {
      setSubmitError("Not authenticated.");
      return;
    }
    setSubmitState("submitting");
    setSubmitError(null);
    try {
      const body = {
        email: email.trim().toLowerCase(),
        name: name || undefined,
        firm_name: firmName || undefined,
        title: title || undefined,
        thesis: thesis.trim(),
        check_size_min: checkMin ? Number(checkMin) : undefined,
        check_size_max: checkMax ? Number(checkMax) : undefined,
        focus_sectors: sectors,
        focus_stages: stages,
        is_deploying: isDeploying,
        leads_rounds: leadsRounds,
        fund_size_usd: fundSize ? Number(fundSize) : undefined,
        location: location || undefined,
        bio: bio || undefined,
        notes: notes || undefined,
        meeting_context: meetingContext || undefined,
        merge,
      };
      const res = await fetch("/v1/brain/admin/investors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data?.detail?.code === "investor_exists") {
          // Show merge prompt
          setSubmitState("confirming");
          setExisting(data.detail.existing);
          return;
        }
        throw new Error(typeof data?.detail === "string" ? data.detail : "Failed to add investor.");
      }
      setResult({ created: data.created, merged: data.merged });
      setSubmitState("done");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Unknown error");
      setSubmitState("error");
    }
  }

  if (!authReady) {
    return <div className="p-8 text-zinc-500">Loading…</div>;
  }
  if (!authedEmail) {
    return (
      <div className="p-8 text-zinc-300">
        <p>Sign in required.</p>
        <a href="/login" className="text-teal-400 underline">Sign in →</a>
      </div>
    );
  }

  if (submitState === "done" && result) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-zinc-200">
        <h1 className="text-xl font-semibold text-orange-400 mb-2">
          {result.created ? "Investor added" : "Investor updated"}
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          {email} — {firmName || "(no firm)"}. They'll start receiving match
          notifications via the existing Slack/email pipeline when verified
          founders match their thesis.
        </p>
        <button
          onClick={() => {
            setEmail(""); setName(""); setFirmName(""); setTitle(""); setThesis("");
            setCheckMin(""); setCheckMax(""); setSectors([]); setStages([]);
            setIsDeploying(null); setLeadsRounds(null); setFundSize("");
            setLocation(""); setBio(""); setNotes(""); setMeetingContext("");
            setExisting(null); setResult(null); setSubmitState("idle");
          }}
          className="rounded-full border border-teal-700/50 bg-teal-950/20 px-6 py-2 text-sm text-teal-300 hover:border-teal-500"
        >
          Add another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 text-zinc-200">
      <h1 className="text-2xl font-semibold text-white mb-1">Add investor</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Manually add an investor after meeting them. Same downstream behavior
        as a self-signup — they receive match notifications via Slack/email.
      </p>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-5">
        {/* Email + lookup */}
        <Field label="Email *">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setExisting(null); }}
            onBlur={handleEmailBlur}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            placeholder="sarah@benchmark.com"
          />
          {lookupLoading && <p className="text-xs text-zinc-500 mt-1">Checking for existing record…</p>}
          {existing && existing.role === "investor" && (
            <div className="mt-2 rounded-md border border-amber-700/40 bg-amber-950/20 p-3 text-xs text-amber-200">
              <strong>Existing investor:</strong> {existing.name || "(no name)"} at {existing.firm_name || "(no firm)"}.
              Submitting will overwrite their fields. (You'll be asked to confirm.)
            </div>
          )}
          {existing && existing.role && existing.role !== "investor" && (
            <div className="mt-2 rounded-md border border-red-700/40 bg-red-950/20 p-3 text-xs text-red-300">
              <strong>Conflict:</strong> Email already exists as <code>{existing.role}</code>.
              Use a different email — can't dual-purpose accounts.
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="Sarah Tavel" />
          </Field>
          <Field label="Firm">
            <input value={firmName} onChange={(e) => setFirmName(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="Benchmark" />
          </Field>
        </div>

        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="Partner" />
        </Field>

        <Field label="Thesis *">
          <textarea
            required
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            rows={3}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            placeholder="What do they invest in? (Required for matching to fire.)"
          />
        </Field>

        {/* Sectors + Stages */}
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

        <div className="grid grid-cols-2 gap-4">
          <Field label="Check size min (USD)">
            <input type="number" value={checkMin} onChange={(e) => setCheckMin(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="250000" />
          </Field>
          <Field label="Check size max (USD)">
            <input type="number" value={checkMax} onChange={(e) => setCheckMax(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="2000000" />
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
            <input type="number" value={fundSize} onChange={(e) => setFundSize(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="50000000" />
          </Field>
          <Field label="Location">
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="San Francisco, CA" />
          </Field>
        </div>

        <Field label="Bio (optional, public-ish)">
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="Background, prior firms, notable bets…" />
        </Field>

        <Field label="Meeting context (private — your notes)">
          <input value={meetingContext} onChange={(e) => setMeetingContext(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="Met at AI conference, follow-up scheduled May 15" />
        </Field>

        <Field label="Internal notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="Anything else worth remembering" />
        </Field>

        {submitError && (
          <div className="rounded-md border border-red-700/40 bg-red-950/20 p-3 text-xs text-red-300">
            {submitError}
          </div>
        )}

        {/* Submit / merge confirmation */}
        {submitState !== "confirming" ? (
          <button
            type="submit"
            disabled={submitDisabled || submitState === "submitting"}
            className="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitState === "submitting" ? "Saving…" : "Save investor"}
          </button>
        ) : (
          <div className="rounded-md border border-amber-700/40 bg-amber-950/20 p-4 text-sm text-amber-100">
            <p className="mb-3">
              An investor with this email already exists. Submitting will overwrite their fields.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="rounded-full bg-orange-600 px-5 py-2 text-xs font-medium text-white hover:bg-orange-500"
              >
                Confirm overwrite
              </button>
              <button
                type="button"
                onClick={() => setSubmitState("idle")}
                className="rounded-full border border-zinc-700 px-5 py-2 text-xs text-zinc-300 hover:border-zinc-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

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
