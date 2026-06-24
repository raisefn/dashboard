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

export function StorySection({ section, session, impersonating, onSaved }: Props) {
  const data = section.data as Record<string, string | boolean | null>;
  const [whyNow, setWhyNow] = useState((data.why_now as string) || "");
  const [wedge, setWedge] = useState((data.wedge as string) || "");
  const [postVision, setPostVision] = useState((data.post_raise_vision as string) || "");
  const [market, setMarket] = useState((data.market_positioning as string) || "");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const { save, saving, error } = useSharpenSave(session, impersonating);

  async function handleSave() {
    const ok = await save("story", {
      why_now: whyNow,
      wedge,
      post_raise_vision: postVision,
      market_positioning: market,
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

      {/* Founder background pulled from canonical */}
      <div className="sf-current">
        <p className="sf-current-label">Founder background</p>
        <p className="sf-current-value">
          {data.is_repeat_founder === true && "Repeat founder. "}
          {data.is_repeat_founder === false && "First-time founder. "}
          {data.previous_exits ? String(data.previous_exits) : (
            !data.is_repeat_founder && <span className="sf-current-empty">Nothing captured — tell the agent in chat.</span>
          )}
        </p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Why now?</label>
        <textarea
          className="sf-textarea"
          placeholder="The specific shift in the market, tech, or behavior that makes this the right moment."
          value={whyNow}
          onChange={(e) => setWhyNow(e.target.value)}
        />
        <p className="sf-hint">The agent uses this in every brief opener and outreach lead.</p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Your wedge / unfair advantage</label>
        <textarea
          className="sf-textarea"
          placeholder="The thing only you can do, or that you do meaningfully better than anyone else."
          value={wedge}
          onChange={(e) => setWedge(e.target.value)}
        />
        <p className="sf-hint">Used to differentiate against generic competitor framings.</p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Post-raise vision (use of funds + 18-month roadmap)</label>
        <textarea
          className="sf-textarea"
          placeholder="What you'd build, hire, ship, and prove in the next 18 months."
          value={postVision}
          onChange={(e) => setPostVision(e.target.value)}
        />
        <p className="sf-hint">Every investor asks this. Agent uses it in meeting prep.</p>
      </div>

      <div className="sf-field">
        <label className="sf-label">Market positioning</label>
        <textarea
          className="sf-textarea"
          placeholder="How you frame your category. Who you compete with directly, who you don't, and why."
          value={market}
          onChange={(e) => setMarket(e.target.value)}
        />
        <p className="sf-hint">Sharpens briefs and helps the agent route the right comps.</p>
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
