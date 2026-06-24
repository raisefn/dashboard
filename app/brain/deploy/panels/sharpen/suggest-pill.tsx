"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useSharpenSuggest } from "./use-sharpen-save";

/**
 * Shared "Fill from your deck" pill rendered above the form in every
 * Fine tune your agent section.
 *
 * Behavior:
 *  - Only renders when at least one field passed in is currently empty
 *  - On click: hits POST /v1/brain/sharpen/section/{id}/suggest
 *  - Only fills empty fields (never overwrites in-session edits)
 *  - Reports how many fields it drafted or surfaces a backend message
 */
export interface SuggestField {
  name: string;
  live: string;
  setter: (v: string) => void;
}

interface Props {
  sectionId: "basics" | "story" | "team" | "proof" | "past";
  fields: SuggestField[];
  session: Session | null;
  impersonating: string;
}

export function SuggestPill({ sectionId, fields, session, impersonating }: Props) {
  const { suggest, suggesting, error } = useSharpenSuggest(session, impersonating);
  const [note, setNote] = useState<string | null>(null);

  const emptyCount = fields.filter((f) => !(f.live || "").trim()).length;
  if (emptyCount === 0) return null;

  async function handleClick() {
    setNote(null);
    const result = await suggest(sectionId);
    if (!result) return;
    if (result.message && !Object.keys(result.suggestions).length) {
      setNote(result.message);
      return;
    }
    let filled = 0;
    for (const field of fields) {
      const suggested = result.suggestions[field.name];
      const live = (field.live || "").trim();
      if (suggested && !live) {
        field.setter(suggested);
        filled += 1;
      }
    }
    setNote(
      filled > 0
        ? `Drafted ${filled} field${filled === 1 ? "" : "s"} from your deck. Review and save.`
        : "Nothing new to add — your deck didn't cover the empty fields.",
    );
  }

  return (
    <div className="sf-suggest">
      <button
        type="button"
        className="sf-suggest-btn"
        onClick={() => void handleClick()}
        disabled={suggesting}
      >
        {suggesting ? "Reading your deck…" : "Fill from your deck"}
      </button>
      <span className="sf-suggest-text">
        {note ? (
          <span className={
            error
              ? "sf-suggest-status sf-suggest-status-error"
              : "sf-suggest-status sf-suggest-status-ok"
          }>{note}</span>
        ) : error ? (
          <span className="sf-suggest-status sf-suggest-status-error">{error}</span>
        ) : (
          <>Agent reads your uploaded docs and drafts the empty fields. You edit, then save.</>
        )}
      </span>
    </div>
  );
}
