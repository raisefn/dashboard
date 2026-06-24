"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SectionCard } from "./section-card";
import { useSharpenSave, FORM_LABEL_CSS } from "./use-sharpen-save";
import type { SharpenSection } from "../types";

interface Founder {
  name: string;
  role: string;
  equity_pct?: number;
  background?: string;
}

interface Props {
  section: SharpenSection;
  session: Session | null;
  impersonating: string;
  onSaved: () => void;
}

export function TeamSection({ section, session, impersonating, onSaved }: Props) {
  const data = section.data as Record<string, unknown>;
  const initialFounders = Array.isArray(data.founders_list)
    ? (data.founders_list as Founder[])
    : [];
  const [founders, setFounders] = useState<Founder[]>(initialFounders);
  const [capTable, setCapTable] = useState((data.cap_table_summary as string) || "");
  const [hiringPlan, setHiringPlan] = useState((data.hiring_plan as string) || "");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const { save, saving, error } = useSharpenSave(session, impersonating);

  function addFounder() {
    setFounders([...founders, { name: "", role: "", equity_pct: 0, background: "" }]);
  }
  function updateFounder(i: number, key: keyof Founder, value: string | number) {
    const next = [...founders];
    next[i] = { ...next[i], [key]: value };
    setFounders(next);
  }
  function removeFounder(i: number) {
    setFounders(founders.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    const cleanFounders = founders.filter(f => f.name.trim());
    const ok = await save("team", {
      founders: cleanFounders,
      cap_table_summary: capTable,
      hiring_plan: hiringPlan,
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

      {/* Canonical summary */}
      <div className="sf-current">
        <p className="sf-current-label">Captured by the agent</p>
        <p className="sf-current-value">
          {data.team_size != null && `Team of ${data.team_size}. `}
          {data.cofounder_count != null && `${data.cofounder_count} cofounder${Number(data.cofounder_count) === 1 ? "" : "s"}. `}
          {data.team_summary ? String(data.team_summary) : (
            data.team_size == null && <span className="sf-current-empty">Nothing yet.</span>
          )}
        </p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Founders</label>
        {founders.length === 0 && (
          <p className="text-zinc-500 text-sm mb-3 italic">No founders added yet.</p>
        )}
        {founders.map((f, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 mb-3">
            <div className="sf-row sf-row-2">
              <div>
                <label className="sf-label">Name</label>
                <input className="sf-input" value={f.name} onChange={(e) => updateFounder(i, "name", e.target.value)} />
              </div>
              <div>
                <label className="sf-label">Role</label>
                <input className="sf-input" placeholder="e.g. CEO" value={f.role} onChange={(e) => updateFounder(i, "role", e.target.value)} />
              </div>
            </div>
            <div className="sf-row sf-row-2 mt-3">
              <div>
                <label className="sf-label">Equity %</label>
                <input
                  className="sf-input"
                  type="number"
                  min={0}
                  max={100}
                  value={f.equity_pct ?? 0}
                  onChange={(e) => updateFounder(i, "equity_pct", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="sf-label">Background (short)</label>
                <input className="sf-input" placeholder="e.g. Ex-Stripe, technical" value={f.background ?? ""} onChange={(e) => updateFounder(i, "background", e.target.value)} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFounder(i)}
              className="mt-3 text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addFounder} className="sf-chat-prompt-btn">
          + Add founder
        </button>
      </div>

      <div className="sf-field">
        <label className="sf-label">Cap table summary</label>
        <textarea
          className="sf-textarea"
          placeholder="e.g. Founders 95%, ESOP 5%. No prior outside investors. SAFEs from friends/family totaling $50K."
          value={capTable}
          onChange={(e) => setCapTable(e.target.value)}
        />
        <p className="sf-hint">Plain-English. Agent uses this in briefs and partner-meeting prep.</p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Hiring plan</label>
        <textarea
          className="sf-textarea"
          placeholder="e.g. 2 engineers in Q1, 1 GTM in Q2, design contract in Q3."
          value={hiringPlan}
          onChange={(e) => setHiringPlan(e.target.value)}
        />
        <p className="sf-hint">Investors ask "what would you do with the money" in every meeting.</p>
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
