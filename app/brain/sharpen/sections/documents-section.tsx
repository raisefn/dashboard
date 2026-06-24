"use client";

import { SectionCard } from "./section-card";
import type { SharpenSection } from "../types";

interface Props {
  section: SharpenSection;
}

const CATEGORIES = [
  { key: "deck", label: "Pitch deck", hint: "Your primary deck. Agent extracts sector, stage, raise size, traction." },
  { key: "customer_reference", label: "Customer reference document", hint: "Logos, testimonials, case studies. Surfaces in briefs as social proof." },
  { key: "market_analysis", label: "Market analysis / why-now memo", hint: "Your deep take on the category. Agent uses it for thesis framing." },
  { key: "comp_analysis", label: "Competitive positioning", hint: "How you frame against direct + adjacent comps." },
  { key: "founder_bio", label: "Founder bios (deeper than LinkedIn)", hint: "Detailed background. Used in partner-meeting prep." },
];

export function DocumentsSection({ section }: Props) {
  const data = section.data as Record<string, Array<{ id: string; filename: string }>>;

  return (
    <SectionCard
      title={section.title}
      whyItMatters={section.why_it_matters}
      status={section.status}
    >
      <div className="space-y-3 mb-4">
        {CATEGORIES.map((cat) => {
          const docs = Array.isArray(data[cat.key]) ? data[cat.key] : [];
          const hasAny = docs.length > 0;
          return (
            <div
              key={cat.key}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: hasAny ? "#2dd4bf" : "#52525b" }}
                  />
                  <span className="text-sm font-semibold text-white">{cat.label}</span>
                </div>
                {hasAny && (
                  <span className="text-[11px] text-zinc-500">
                    {docs.length} file{docs.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{cat.hint}</p>
              {hasAny && (
                <div className="mt-2 text-[12px] text-zinc-400">
                  {docs.map((d) => (
                    <div key={d.id} className="truncate">· {d.filename}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">
        To add a document: drop it in the chat and tell the agent what kind it is. Files are categorized automatically.
      </p>
    </SectionCard>
  );
}
