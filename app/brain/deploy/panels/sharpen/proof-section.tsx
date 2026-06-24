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

export function ProofSection({ section, session, impersonating, onSaved }: Props) {
  const data = section.data as Record<string, unknown>;
  const [pressLinks, setPressLinks] = useState((data.press_links as string) || "");
  const [dataRoom, setDataRoom] = useState((data.data_room_url as string) || "");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const { save, saving, error } = useSharpenSave(session, impersonating);

  async function handleSave() {
    const ok = await save("proof", { press_links: pressLinks, data_room_url: dataRoom });
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

      {/* MRR — canonical from chat */}
      <div className="sf-current">
        <p className="sf-current-label">Revenue</p>
        <p className="sf-current-value">
          {data.mrr ? `$${Number(data.mrr).toLocaleString()} MRR captured.` : (
            <span className="sf-current-empty">No MRR captured. Tell the agent or connect Stripe.</span>
          )}
        </p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Stripe</label>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-medium">Connect Stripe to auto-pull MRR</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400/70">COMING SOON</span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            One OAuth connection. MRR shows up in your profile and every brief automatically. Investors see real revenue, not your verbal estimate.
          </p>
        </div>
      </div>

      <div className="sf-field">
        <label className="sf-label">Press / awards / mentions</label>
        <textarea
          className="sf-textarea"
          placeholder="One link per line, or paste a short list."
          value={pressLinks}
          onChange={(e) => setPressLinks(e.target.value)}
        />
        <p className="sf-hint">Surfaces in briefs as social proof.</p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Data room URL (optional)</label>
        <input
          className="sf-input"
          placeholder="https://docsend.com/..."
          value={dataRoom}
          onChange={(e) => setDataRoom(e.target.value)}
        />
        <p className="sf-hint">Agent can include this in briefs for serious investors.</p>
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
