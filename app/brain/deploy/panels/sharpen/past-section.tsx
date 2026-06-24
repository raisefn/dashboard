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

export function PastSection({ section, session, impersonating, onSaved }: Props) {
  const data = section.data as Record<string, unknown>;
  const [priorRaiseNotes, setPriorRaiseNotes] = useState((data.prior_raise_notes as string) || "");
  const [advisorFeedback, setAdvisorFeedback] = useState((data.advisor_feedback as string) || "");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const { save, saving, error } = useSharpenSave(session, impersonating);

  async function handleSave() {
    const ok = await save("past", {
      prior_raise_notes: priorRaiseNotes,
      advisor_feedback: advisorFeedback,
    });
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

      <div className="sf-current">
        <p className="sf-current-label">Privacy</p>
        <p className="sf-current-value text-sm">
          Everything in this section stays private. Never shared. Never used to train.
        </p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Prior raise notes (if applicable)</label>
        <textarea
          className="sf-textarea"
          placeholder="Last raise: who you pitched, who passed and why, what worked. Even a few sentences help."
          value={priorRaiseNotes}
          onChange={(e) => setPriorRaiseNotes(e.target.value)}
        />
        <p className="sf-hint">The agent learns your patterns + which investors already know you.</p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Advisor / mentor feedback</label>
        <textarea
          className="sf-textarea"
          placeholder="What advisors have told you about the pitch, the team, the market, the deal."
          value={advisorFeedback}
          onChange={(e) => setAdvisorFeedback(e.target.value)}
        />
        <p className="sf-hint">Context the agent uses to sharpen positioning.</p>
      </div>

      <div className="sf-actions">
        <button type="button" className="sf-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {savedNote && <span className="sf-status sf-status-saved">{savedNote}</span>}
        {error && <span className="sf-status sf-status-error">{error}</span>}
      </div>
    </SectionCard>
  );
}
