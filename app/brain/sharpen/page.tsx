"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";

import { BasicsSection } from "./sections/basics-section";
import { StorySection } from "./sections/story-section";
import { TeamSection } from "./sections/team-section";
import { ProofSection } from "./sections/proof-section";
import { PastSection } from "./sections/past-section";
import { ConnectionsSection } from "./sections/connections-section";
import { DocumentsSection } from "./sections/documents-section";
import type { SharpenState, SharpenSection } from "./types";

export default function SharpenPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [impersonating, setImpersonating] = useState<string>("");
  const [state, setState] = useState<SharpenState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });

    // Read impersonation from localStorage (mirrors how /brain/deploy reads it)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("raisefn_impersonate") || "";
      setImpersonating(stored);
    }

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

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
        throw new Error(body.detail || `Failed to load (${res.status})`);
      }
      const data: SharpenState = await res.json();
      setState(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [session, impersonating]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/95 sticky top-0 z-10 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/brain/deploy"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to chat
          </Link>
          {state?.acting_as_email && (
            <span className="text-xs text-orange-400">
              Acting as {state.acting_as_email}
            </span>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl w-full px-6 pt-10 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-3">
          Sharpen
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Fine tune your agent.
        </h1>
        <p className="text-base text-zinc-400 leading-relaxed">
          Stronger inputs = sharper outputs. Every match, brief, draft, and
          meeting prep gets sharper when you feed the agent more context.
        </p>
        {state?.summary && (
          <div className="mt-6 rounded-lg border border-teal-800/40 bg-teal-950/20 px-4 py-3">
            <p className="text-sm text-zinc-200 leading-relaxed">{state.summary}</p>
          </div>
        )}
      </section>

      {/* Sections */}
      <main className="mx-auto max-w-3xl w-full px-6 pb-24">
        {loading && (
          <div className="py-16 text-center text-zinc-500">Loading…</div>
        )}
        {error && (
          <div className="py-8 text-center text-red-400">{error}</div>
        )}
        {!loading && !error && state?.sections && (
          <>
            {state.sections.map((s) => (
              <SectionRenderer
                key={s.id}
                section={s}
                session={session}
                impersonating={impersonating}
                onSaved={load}
              />
            ))}
            <div className="mt-12 text-center">
              <p className="text-sm text-zinc-500">
                Or just talk to the agent.{" "}
                <Link href="/brain/deploy" className="text-teal-400 hover:text-teal-300">
                  It'll ask for what it needs →
                </Link>
              </p>
            </div>
          </>
        )}
      </main>
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
    case "connections":
      return <ConnectionsSection section={section} />;
    case "documents":
      return <DocumentsSection section={section} />;
    default:
      return null;
  }
}
