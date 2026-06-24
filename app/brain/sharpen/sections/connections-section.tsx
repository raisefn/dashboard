"use client";

import { SectionCard } from "./section-card";
import type { SharpenSection } from "../types";

interface Props {
  section: SharpenSection;
}

const CONNECTIONS = [
  {
    key: "gmail",
    name: "Gmail",
    what: "The agent sends your outreach from your inbox, auto-detects replies, and threads context to your pipeline.",
    when: "Phase 5 — shipping soon",
  },
  {
    key: "calendar",
    name: "Calendar",
    what: "24-hour pre-meeting briefs land automatically. Debriefs captured after every meeting from your calendar.",
    when: "Phase 6 — after Gmail",
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    what: "Maps your 2nd-degree connections to surface warm-intro paths to every investor in your matches.",
    when: "Phase 7 — when volume justifies",
  },
];

export function ConnectionsSection({ section }: Props) {
  const data = section.data as Record<string, boolean | null>;
  return (
    <SectionCard
      title={section.title}
      whyItMatters={section.why_it_matters}
      status={section.status}
    >
      <div className="space-y-3">
        {CONNECTIONS.map((c) => {
          const connected = Boolean(data[c.key]);
          return (
            <div
              key={c.key}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: connected ? "#2dd4bf" : "#52525b" }}
                  />
                  <span className="text-sm font-semibold text-white">{c.name}</span>
                </div>
                {connected ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">CONNECTED</span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400/70">COMING SOON</span>
                )}
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-1">{c.what}</p>
              {!connected && (
                <p className="text-[11px] text-zinc-600">{c.when}</p>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
