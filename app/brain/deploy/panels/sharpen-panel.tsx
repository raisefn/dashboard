"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { BasicsSection } from "./sharpen/basics-section";
import { StorySection } from "./sharpen/story-section";
import { TeamSection } from "./sharpen/team-section";
import { ProofSection } from "./sharpen/proof-section";
import { PastSection } from "./sharpen/past-section";
import type { SharpenState, SharpenSection } from "./sharpen/sharpen-types";
import type { SharpenSectionId } from "./use-panel-state";

interface SharpenPanelProps {
  sectionId: SharpenSectionId;
  session: Session | null;
  impersonating: string;
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

  if (loading) {
    return <p className="text-sm text-zinc-500 py-8">Loading…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-400 py-8">{error}</p>;
  }
  if (!state) return null;

  const section = state.sections.find((s) => s.id === sectionId);
  if (!section) {
    return <p className="text-sm text-zinc-500 py-8">Section not found.</p>;
  }

  return (
    <div className="sharpen-panel">
      <SectionRenderer
        section={section}
        session={session}
        impersonating={impersonating}
        onSaved={load}
      />
    </div>
  );
}

interface RendererProps {
  section: SharpenSection;
  session: Session | null;
  impersonating: string;
  onSaved: () => void;
}

function SectionRenderer({ section, session, impersonating, onSaved }: RendererProps) {
  switch (section.id) {
    case "basics":
      return <BasicsSection section={section} session={session} impersonating={impersonating} onSaved={onSaved} />;
    case "story":
      return <StorySection section={section} session={session} impersonating={impersonating} onSaved={onSaved} />;
    case "team":
      return <TeamSection section={section} session={session} impersonating={impersonating} onSaved={onSaved} />;
    case "proof":
      return <ProofSection section={section} session={session} impersonating={impersonating} onSaved={onSaved} />;
    case "past":
      return <PastSection section={section} session={session} impersonating={impersonating} onSaved={onSaved} />;
    default:
      return null;
  }
}
