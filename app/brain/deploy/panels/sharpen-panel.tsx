"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { StatusBadge } from "./sharpen/status-badge";
import type { SharpenState, SharpenSection } from "./sharpen/sharpen-types";
import type { SharpenSectionId } from "./use-panel-state";

/**
 * Fine tune your agent — READOUT ONLY.
 *
 * Prior version: five inline form editors (basics/story/team/proof/past)
 * with placeholders like "e.g. Close by Q1 2026". That's a form, and the
 * marketing pages promise "no forms, no dashboard." Deleted per the
 * two-model fix (2026-07-03).
 *
 * New model: this panel shows what raise(fn) already knows about each
 * section (extracted from the deck + chat). If something's missing, the
 * gap chips make it visible — the founder chats naturally about the
 * topic and brain's silent capture (rule 5) fills it. No chat inject,
 * no fake action buttons that just repopulate the chat.
 */

interface SharpenPanelProps {
  sectionId: SharpenSectionId;
  session: Session | null;
  impersonating: string;
}

const FIELD_LABELS: Record<string, string> = {
  // basics
  sector: "Sector",
  stage: "Stage",
  target_amount: "Raising",
  location: "Location",
  traction_summary: "Traction",
  timeline: "Timeline / urgency",
  instrument: "Instrument",
  cohort: "Accelerator / cohort",
  hard_requirements: "Hard nos",
  // story
  is_repeat_founder: "Repeat founder",
  previous_exits: "Previous exits",
  why_now: "Why now",
  wedge: "The wedge",
  post_raise_vision: "Post-raise vision",
  market_positioning: "Market positioning",
  // team
  team_size: "Team size",
  cofounder_count: "Cofounders",
  team_summary: "Team summary",
  founders_list: "Founder bios",
  cap_table_summary: "Cap table",
  hiring_plan: "Hiring plan",
  // proof
  mrr: "MRR",
  stripe_connected: "Stripe",
  customer_reference_doc: "Customer references",
  press_links: "Press coverage",
  data_room_url: "Data room",
  // past
  transcripts: "Past investor conversations",
  prior_raise_notes: "Prior raise notes",
  advisor_feedback: "Advisor feedback",
};

function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (field === "target_amount" || field === "mrr") {
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
      return `$${value}`;
    }
    return String(value);
  }
  if (Array.isArray(value)) return value.join(", ");
  const s = String(value).trim();
  return s.length > 140 ? s.slice(0, 140) + "…" : s;
}

export function SharpenPanel({ sectionId, session, impersonating }: SharpenPanelProps) {
  const [state, setState] = useState<SharpenState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
      };
      if (impersonating) headers["X-Impersonate"] = impersonating;
      const res = await fetch("/v1/brain/sharpen-state", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed (${res.status})`);
      }
      const json: SharpenState = await res.json();
      setState(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [session, impersonating]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    function onUpdate() { void load(); }
    window.addEventListener("raisefn:profile_updated", onUpdate);
    return () => window.removeEventListener("raisefn:profile_updated", onUpdate);
  }, [load]);

  if (loading) return <p className="text-sm text-zinc-500 py-8">Loading…</p>;
  if (error) return <p className="text-sm text-red-400 py-8">{error}</p>;
  if (!state) return null;

  const section = state.sections.find((s) => s.id === sectionId);
  if (!section) return <p className="text-sm text-zinc-500 py-8">Section not found.</p>;

  return (
    <div className="sharpen-panel">
      <style>{SHARPEN_CSS}</style>
      <SectionReadout section={section} />
    </div>
  );
}

interface ReadoutProps {
  section: SharpenSection;
}

function SectionReadout({ section }: ReadoutProps) {
  const data = section.data as Record<string, unknown>;
  const hasGaps = section.fields_missing.length > 0;
  const totalFields = section.fields_filled.length + section.fields_missing.length;
  const filledCount = section.fields_filled.length;

  return (
    <div className="sh-section">
      <div className="sh-head">
        <div className="sh-head-title">
          <h2 className="sh-title">{section.title}</h2>
          <StatusBadge status={section.status} />
          {totalFields > 0 && (
            <span className="sh-fraction">
              {filledCount} of {totalFields} filled
            </span>
          )}
        </div>
        <p className="sh-why">{section.why_it_matters}</p>
      </div>

      <div className="sh-body">
        <div className="sh-block-label">What I know</div>
        {section.fields_filled.length === 0 ? (
          <p className="sh-empty">Nothing captured yet.</p>
        ) : (
          <dl className="sh-facts">
            {section.fields_filled.map((f) => (
              <div key={f} className="sh-fact">
                <dt className="sh-fact-label">{FIELD_LABELS[f] || f}</dt>
                <dd className="sh-fact-value">{formatValue(f, data[f]) || "—"}</dd>
              </div>
            ))}
          </dl>
        )}

        {hasGaps && (
          <>
            <div className="sh-block-label sh-block-label-gap">Missing</div>
            <ul className="sh-gaps">
              {section.fields_missing.map((f) => (
                <li key={f} className="sh-gap">{FIELD_LABELS[f] || f}</li>
              ))}
            </ul>
            <p className="sh-gap-hint">
              Just tell me these in chat — no forms. I&apos;ll capture them
              silently as we talk.
            </p>
          </>
        )}

      </div>
    </div>
  );
}

const SHARPEN_CSS = `
  .sharpen-panel { color: #d4d4d8; }
  .sh-section {
    border: 1px solid #27272a;
    background: rgba(24, 24, 27, 0.4);
    border-radius: 12px;
    padding: 20px;
  }
  .sh-head { margin-bottom: 20px; }
  .sh-head-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .sh-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #f4f4f5;
  }
  .sh-why {
    margin: 0;
    font-size: 12.5px;
    color: #71717a;
    line-height: 1.5;
  }

  .sh-body { display: flex; flex-direction: column; gap: 14px; }

  .sh-block-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #71717a;
    margin-bottom: 2px;
  }
  .sh-block-label-gap { color: #fbbf24; margin-top: 6px; }

  .sh-empty {
    margin: 0;
    padding: 12px 14px;
    background: #18181b;
    border: 1px dashed #3f3f46;
    border-radius: 8px;
    font-size: 12.5px;
    color: #71717a;
  }

  .sh-facts { margin: 0; padding: 0; }
  .sh-fact {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 12px;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(63, 63, 70, 0.35);
  }
  .sh-fact:last-child { border-bottom: none; }
  .sh-fact-label {
    margin: 0;
    font-size: 12px;
    color: #a1a1aa;
  }
  .sh-fact-value {
    margin: 0;
    font-size: 13px;
    color: #e4e4e7;
    word-break: break-word;
  }

  .sh-gaps {
    margin: 0;
    padding: 8px 0 0 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .sh-gap {
    display: inline-block;
    padding: 3px 10px;
    font-size: 11.5px;
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.08);
    border: 1px solid rgba(251, 191, 36, 0.25);
    border-radius: 999px;
  }

  .sh-fraction {
    font-size: 11px;
    color: #a1a1aa;
    font-weight: 500;
  }

  .sh-gap-hint {
    margin: 12px 0 0;
    font-size: 12px;
    color: #a1a1aa;
    line-height: 1.5;
    padding: 8px 12px;
    background: rgba(251, 191, 36, 0.06);
    border-left: 2px solid #fbbf24;
    border-radius: 0 4px 4px 0;
  }

  @media (max-width: 640px) {
    .sh-fact { grid-template-columns: 1fr; gap: 2px; }
  }
`;
