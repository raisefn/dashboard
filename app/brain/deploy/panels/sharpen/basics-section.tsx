"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SectionCard } from "./section-card";
import { useSharpenSave, FORM_LABEL_CSS } from "./use-sharpen-save";
import type { SharpenSection } from "./sharpen-types";

interface Props {
  section: SharpenSection;
  session: Session | null;
  impersonating: string;
  onSaved: () => void;
}

const INSTRUMENT_OPTIONS = ["SAFE (post-money)", "SAFE (pre-money)", "Convertible note", "Priced round", "Other / undecided"];

export function BasicsSection({ section, session, impersonating, onSaved }: Props) {
  const data = section.data as Record<string, string | null>;
  const [timeline, setTimeline] = useState((data.timeline as string) || "");
  const [instrument, setInstrument] = useState((data.instrument as string) || "");
  const [cohort, setCohort] = useState((data.cohort as string) || "");
  const [hardReqs, setHardReqs] = useState((data.hard_requirements as string) || "");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const { save, saving, error } = useSharpenSave(session, impersonating);

  async function handleSave() {
    const ok = await save("basics", { timeline, instrument, cohort, hard_requirements: hardReqs });
    if (ok) {
      setSavedNote("Saved.");
      onSaved();
      setTimeout(() => setSavedNote(null), 2500);
    }
  }

  return (
    <SectionCard
      title={section.title}
      whyItMatters={section.why_it_matters}
      status={section.status}
    >
      <style>{FORM_LABEL_CSS}</style>

      {/* Current canonical state, read-only — captured by the agent in chat */}
      <div className="sf-current">
        <p className="sf-current-label">Captured by the agent</p>
        <p className="sf-current-value">
          {[data.sector, data.stage, data.target_amount && `$${Number(data.target_amount).toLocaleString()}`, data.location]
            .filter(Boolean).join(" · ") || (
            <span className="sf-current-empty">Nothing yet — talk to the agent first.</span>
          )}
        </p>
        {data.traction_summary && (
          <p className="sf-current-value mt-2">{String(data.traction_summary)}</p>
        )}
      </div>

      {/* Extended fields editable here */}
      <div className="sf-row sf-row-2">
        <div className="sf-field">
          <label className="sf-label">Timeline / Urgency</label>
          <input
            className="sf-input"
            placeholder="e.g. Close by Q1 2026; runway through April"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
          />
          <p className="sf-hint">When you need to close, why now.</p>
        </div>
        <div className="sf-field">
          <label className="sf-label">Instrument preference</label>
          <select
            className="sf-select"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
          >
            <option value="">—</option>
            {INSTRUMENT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <p className="sf-hint">SAFE vs priced changes the conversations.</p>
        </div>
      </div>

      <div className="sf-field">
        <label className="sf-label">Accelerator / Cohort context</label>
        <input
          className="sf-input"
          placeholder="e.g. YC W26, NFX FAST, none"
          value={cohort}
          onChange={(e) => setCohort(e.target.value)}
        />
        <p className="sf-hint">Filters some investors heavily.</p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Hard requirements / Hard nos</label>
        <textarea
          className="sf-textarea"
          placeholder="e.g. No US-only investors. Won't take a board seat at this stage. No religious/political funds."
          value={hardReqs}
          onChange={(e) => setHardReqs(e.target.value)}
        />
        <p className="sf-hint">Prevents bad matches before they show up.</p>
      </div>

      <div className="sf-actions">
        <button
          type="button"
          className="sf-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {savedNote && <span className="sf-status sf-status-saved">{savedNote}</span>}
        {error && <span className="sf-status sf-status-error">{error}</span>}
      </div>
    </SectionCard>
  );
}
