"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";
import BrainTabs from "@/components/brain-tabs";

type Brief = {
  token: string;
  investor_full_name: string | null;
  investor_first_name: string | null;
  created_at: string | null;
};

export default function BriefsPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) {
        router.replace("/login");
        return;
      }
      setSession(s);
    });
  }, [router]);

  // Mirror the matches page / brain-tabs impersonation handling so an
  // admin acting as a managed founder sees THAT founder's briefs, not
  // their own.
  const [impersonating, setImpersonating] = useState<string>("");
  useEffect(() => {
    try {
      setImpersonating(localStorage.getItem("raisefn_impersonating") || "");
    } catch {
      /* private browsing */
    }
    function onImpersonate(e: Event) {
      const ce = e as CustomEvent<{ email?: string | null }>;
      setImpersonating(ce.detail?.email || "");
    }
    window.addEventListener("raisefn:impersonate", onImpersonate);
    return () => window.removeEventListener("raisefn:impersonate", onImpersonate);
  }, []);

  const load = useCallback(async (s: Session) => {
    try {
      setError(null);
      const headers: Record<string, string> = {
        Authorization: `Bearer ${s.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/matches/mine", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load briefs (${res.status})`);
      }
      const data = await res.json();
      setBriefs(Array.isArray(data.briefs) ? data.briefs : []);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load briefs.");
      setLoading(false);
    }
  }, [impersonating]);

  useEffect(() => {
    if (session) load(session);
  }, [session, load]);

  useEffect(() => {
    function onUpdate() { if (session) load(session); }
    window.addEventListener("raisefn:briefs_updated", onUpdate);
    return () => window.removeEventListener("raisefn:briefs_updated", onUpdate);
  }, [session, load]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-300 flex items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <BrainTabs />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
              Your briefs
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              One-page briefs you&apos;ve generated. Each lives at a stable URL — share with the investor or keep for outreach prep.
            </p>
          </div>
          <button
            onClick={() => setCaptureOpen(true)}
            className="rounded-md bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-4 py-2 shrink-0"
          >
            + Brief an investor not in your matches
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {briefs.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-6 py-10 text-center">
            <p className="text-sm text-zinc-300 mb-3">No briefs yet.</p>
            <p className="text-xs text-zinc-500 mb-5 max-w-md mx-auto leading-relaxed">
              Briefs are generated from your matches OR by capturing an investor you know. From a match, open the chat and ask the brain for investors, then click <span className="text-zinc-300">+ brief</span> next to any name. For an investor not in your matches, use the button above.
            </p>
            <Link
              href="/brain/matches"
              className="inline-block rounded-md border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 px-4 py-2 text-sm font-medium"
            >
              Go to matches
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {briefs.map((b) => (
              <li
                key={b.token}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors px-5 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-base font-medium text-zinc-100 truncate">
                      {b.investor_full_name || "(unnamed)"}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {b.created_at
                        ? `Generated ${new Date(b.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
                        : ""}
                    </div>
                  </div>
                  <a
                    href={`/brief/${b.token}`}
                    target="_blank"
                    rel="noopener"
                    className="text-sm rounded-md border border-teal-700/60 hover:border-teal-500 text-teal-300 px-4 py-2 font-medium shrink-0"
                  >
                    Open →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {captureOpen && session && (
        <CaptureBriefModal
          session={session}
          impersonating={impersonating}
          onClose={() => setCaptureOpen(false)}
          onCreated={(data) => {
            setCaptureOpen(false);
            // Open the new brief and trigger a refresh of the list.
            window.open(data.url, "_blank", "noopener");
            window.dispatchEvent(new CustomEvent("raisefn:briefs_updated"));
          }}
        />
      )}
    </main>
  );
}

/* ── Capture modal ─────────────────────────────────────────────────── */

const STAGES = ["pre_seed", "seed", "series_a", "series_b", "series_c", "growth"];

function CaptureBriefModal({
  session,
  impersonating,
  onClose,
  onCreated,
}: {
  session: Session;
  impersonating: string;
  onClose: () => void;
  onCreated: (data: { url: string; token: string }) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    firm: "",
    title: "",
    website: "",
    thesis: "",
    checkMin: "",
    checkMax: "",
    stages: [] as string[],
    sectors: [] as string[],
    recentInvestments: "",
    notes: "",
  });
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [enriched, setEnriched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function enrichFromUrl() {
    if (!form.website.trim()) {
      setEnrichError("Add a firm or LinkedIn URL first.");
      return;
    }
    setEnriching(true);
    setEnrichError(null);
    try {
      const res = await fetch("/v1/brain/investors/enrich-from-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          url: form.website.trim(),
          name: form.name.trim() || undefined,
          firm: form.firm.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Enrichment failed (${res.status})`);
      }
      const data = await res.json();
      const e = (data.extracted || {}) as {
        thesis?: string | null;
        focus_sectors?: string[] | null;
        focus_stages?: string[] | null;
        check_size_min?: number | null;
        check_size_max?: number | null;
        recent_investments?: string | null;
        extraction_notes?: string | null;
      };
      setForm((prev) => ({
        ...prev,
        thesis: prev.thesis || e.thesis || "",
        checkMin: prev.checkMin || (e.check_size_min ? String(e.check_size_min) : ""),
        checkMax: prev.checkMax || (e.check_size_max ? String(e.check_size_max) : ""),
        stages: prev.stages.length > 0 ? prev.stages : (e.focus_stages || []),
        sectors: prev.sectors.length > 0 ? prev.sectors : (e.focus_sectors || []),
        recentInvestments: prev.recentInvestments || e.recent_investments || "",
      }));
      if (e.extraction_notes) {
        setEnrichError(`Couldn't fully extract: ${e.extraction_notes}. Fill the required fields manually.`);
      } else {
        setEnriched(true);
      }
    } catch (e) {
      setEnrichError(e instanceof Error ? e.message : "Failed to extract data from URL.");
    } finally {
      setEnriching(false);
    }
  }

  function isValid(): boolean {
    return (
      form.name.trim().length > 0 &&
      form.thesis.trim().length > 0 &&
      (!!form.checkMin || !!form.checkMax) &&
      form.stages.length > 0
    );
  }

  async function submit() {
    if (!isValid()) {
      setSubmitError("Need at least name, thesis, check size, and stage focus.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Generate the brief AS the impersonated founder so it lands in
      // their api_key's brief list, not the admin's.
      const founderEmail = (impersonating || session.user.email || "").toLowerCase();
      const briefHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) briefHeaders["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/generate-brief", {
        method: "POST",
        headers: briefHeaders,
        body: JSON.stringify({
          founder_email: founderEmail,
          investor_inline: {
            name: form.name.trim(),
            firm: form.firm.trim() || null,
            title: form.title.trim() || null,
            website: form.website.trim() || null,
            thesis: form.thesis.trim(),
            check_size_min: form.checkMin ? Number(form.checkMin) : null,
            check_size_max: form.checkMax ? Number(form.checkMax) : null,
            focus_stages: form.stages.length > 0 ? form.stages : null,
            focus_sectors: form.sectors.length > 0 ? form.sectors : null,
            recent_investments: form.recentInvestments.trim() || null,
          },
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Brief generation failed (${res.status})`);
      }
      const data = await res.json();
      onCreated({ url: data.url, token: data.token });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Brief generation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleStage(stage: string) {
    setForm((prev) => ({
      ...prev,
      stages: prev.stages.includes(stage)
        ? prev.stages.filter((s) => s !== stage)
        : [...prev.stages, stage],
    }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
      onClick={() => !submitting && !enriching && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-800 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-zinc-100">
              Brief an investor not in your matches
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Paste a firm URL to auto-fill — or fill the required fields by hand.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting || enriching}
            className="text-zinc-500 hover:text-zinc-300 text-sm shrink-0 disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 text-sm max-h-[68vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Investor name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Avery Tanaka"
              className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:border-zinc-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Firm</label>
              <input
                value={form.firm}
                onChange={(e) => setForm({ ...form, firm: e.target.value })}
                placeholder="Pacific Bridge"
                className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:border-zinc-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Founding Partner"
                className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:border-zinc-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Firm site OR LinkedIn URL
            </label>
            <div className="flex gap-2">
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://pacificbridge.example"
                className="flex-1 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:border-zinc-600 outline-none"
              />
              <button
                onClick={enrichFromUrl}
                disabled={enriching || !form.website.trim()}
                className="rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-medium px-3 whitespace-nowrap"
              >
                {enriching ? "Pulling…" : "Auto-fill from URL"}
              </button>
            </div>
            {enrichError && (
              <p className="text-xs text-red-400 mt-1">{enrichError}</p>
            )}
            {enriched && !enrichError && (
              <p className="text-xs text-teal-400 mt-1">
                ✓ Pulled from the URL. Review and edit anything below before generating.
              </p>
            )}
          </div>

          <div className="border-t border-zinc-900 pt-5 space-y-4">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold">
              Required for a usable brief
            </p>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Thesis <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.thesis}
                onChange={(e) => setForm({ ...form, thesis: e.target.value })}
                placeholder="What they back. Sectors, stages, what makes them say yes."
                rows={3}
                className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:border-zinc-600 outline-none resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Check min (USD) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.checkMin}
                  onChange={(e) => setForm({ ...form, checkMin: e.target.value })}
                  placeholder="100000"
                  className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:border-zinc-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Check max (USD) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.checkMax}
                  onChange={(e) => setForm({ ...form, checkMax: e.target.value })}
                  placeholder="1000000"
                  className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:border-zinc-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Stage focus <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((stage) => {
                  const active = form.stages.includes(stage);
                  return (
                    <button
                      key={stage}
                      onClick={() => toggleStage(stage)}
                      className={`text-xs rounded-md px-3 py-1.5 font-medium border transition-colors ${
                        active
                          ? "bg-teal-600 border-teal-500 text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {stage.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-5 space-y-4">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold">
              Optional context
            </p>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Recent investments (comma-separated)
              </label>
              <input
                value={form.recentInvestments}
                onChange={(e) => setForm({ ...form, recentInvestments: e.target.value })}
                placeholder="Nubank, Kavak, Gympass"
                className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:border-zinc-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Your personal notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="First-hand observations from any prior interactions. What you learned, what they cared about, anything off the record."
                rows={3}
                className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:border-zinc-600 outline-none resize-y"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between gap-3">
          {submitError ? (
            <p className="text-xs text-red-400 flex-1">{submitError}</p>
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting || !isValid()}
              className="rounded-md bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2"
            >
              {submitting ? "Generating…" : "Generate brief"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
