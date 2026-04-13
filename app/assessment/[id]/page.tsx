import { Metadata } from "next";

const BRAIN_URL = "https://brain-production-61da.up.railway.app";

interface ComparableRound {
  name: string | null;
  amount: number | null;
  stage: string | null;
  date: string | null;
}

interface AssessmentData {
  assessment_id: string;
  created_at: string | null;
  sector: string | null;
  stage: string | null;
  company_name: string | null;
  assessment_text: string | null;
  comparable_rounds: ComparableRound[] | null;
  active_investors_count: number | null;
  sector_momentum: Record<string, unknown> | null;
  timing_intelligence: Record<string, unknown> | null;
}

async function getAssessment(id: string): Promise<AssessmentData | null> {
  try {
    const res = await fetch(`${BRAIN_URL}/v1/brain/assessment/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatUSD(n: number | null): string {
  if (!n) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function formatSector(s: string | null): string {
  return s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";
}

function formatStage(s: string | null): string {
  return s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getAssessment(id);
  if (!data) return { title: "Assessment — raise(fn)" };

  const sector = formatSector(data.sector);
  const stage = formatStage(data.stage);
  const title = data.company_name
    ? `${data.company_name} — Raise Readiness Assessment`
    : `Raise Readiness Assessment — ${sector} ${stage}`.trim();
  const description = `A data-grounded fundraising assessment from raise(fn), benchmarked against 24,000+ real funding rounds.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "article", siteName: "raise(fn)" },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Parse the assessment text into sections
function parseAssessment(text: string): { title: string; content: string; type: "strength" | "gap" | "context" | "verdict" | "general" }[] {
  const sections: { title: string; content: string; type: "strength" | "gap" | "context" | "verdict" | "general" }[] = [];
  const lines = text.split("\n");
  let currentTitle = "";
  let currentContent = "";
  let currentType: "strength" | "gap" | "context" | "verdict" | "general" = "general";

  function classifySection(title: string): "strength" | "gap" | "context" | "verdict" | "general" {
    const lower = title.toLowerCase();
    if (lower.includes("strength") || lower.includes("what you have") || lower.includes("going for")) return "strength";
    if (lower.includes("gap") || lower.includes("risk") || lower.includes("fix") || lower.includes("weak") || lower.includes("improve")) return "gap";
    if (lower.includes("verdict") || lower.includes("bottom line") || lower.includes("readiness") || lower.includes("score")) return "verdict";
    if (lower.includes("market") || lower.includes("competitive") || lower.includes("landscape") || lower.includes("momentum") || lower.includes("context") || lower.includes("comparable")) return "context";
    return "general";
  }

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headerMatch) {
      if (currentTitle || currentContent.trim()) {
        sections.push({ title: currentTitle, content: currentContent.trim(), type: currentType });
      }
      currentTitle = headerMatch[1].replace(/\*\*/g, "");
      currentContent = "";
      currentType = classifySection(currentTitle);
    } else {
      currentContent += line + "\n";
    }
  }
  if (currentTitle || currentContent.trim()) {
    sections.push({ title: currentTitle, content: currentContent.trim(), type: currentType });
  }

  return sections;
}

function renderContent(content: string) {
  return content
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 mb-1"><span class="text-zinc-600 mt-0.5 shrink-0">—</span><span>$1</span></div>')
    .replace(/^\d+\.\s+(.+)$/gm, '<div class="flex gap-2 mb-1"><span class="text-zinc-600 mt-0.5 shrink-0">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, "<br />");
}

const typeStyles = {
  strength: { border: "border-emerald-900/30", bg: "bg-emerald-950/10", accent: "text-emerald-400", dot: "bg-emerald-400" },
  gap: { border: "border-orange-900/30", bg: "bg-orange-950/10", accent: "text-orange-400", dot: "bg-orange-400" },
  context: { border: "border-blue-900/30", bg: "bg-blue-950/10", accent: "text-blue-400", dot: "bg-blue-400" },
  verdict: { border: "border-teal-900/30", bg: "bg-teal-950/10", accent: "text-teal-400", dot: "bg-teal-400" },
  general: { border: "border-zinc-800/50", bg: "bg-zinc-900/20", accent: "text-zinc-400", dot: "bg-zinc-400" },
};

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAssessment(id);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Assessment not found</h1>
          <p className="text-zinc-400 mb-6">This assessment may have expired or been removed.</p>
          <a href="/signup" className="text-teal-400 hover:text-teal-300">Get your own free assessment →</a>
        </div>
      </div>
    );
  }

  const sector = formatSector(data.sector);
  const stage = formatStage(data.stage);
  const sections = data.assessment_text ? parseAssessment(data.assessment_text) : [];
  const momentum = data.sector_momentum as Record<string, unknown> | null;
  const timing = data.timing_intelligence as Record<string, unknown> | null;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <a href="/" className="inline-block mb-8">
            <span className="text-xl font-bold">
              <span className="text-orange-500">raise</span>
              <span className="text-teal-400">(fn)</span>
            </span>
          </a>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {data.company_name || "Raise Readiness Assessment"}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {sector && (
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                    {sector}
                  </span>
                )}
                {stage && (
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                    {stage}
                  </span>
                )}
                {data.created_at && (
                  <span className="text-xs text-zinc-600">
                    {new Date(data.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Data bar */}
        {(data.active_investors_count || data.comparable_rounds?.length || momentum) && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {data.active_investors_count && (
              <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 text-center">
                <div className="text-2xl font-bold text-teal-400">{data.active_investors_count}</div>
                <div className="text-xs text-zinc-500 mt-1">Active investors in space</div>
              </div>
            )}
            {data.comparable_rounds && data.comparable_rounds.length > 0 && (
              <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{data.comparable_rounds.length}</div>
                <div className="text-xs text-zinc-500 mt-1">Comparable rounds analyzed</div>
              </div>
            )}
            {timing && (
              <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {(timing as { trend?: string }).trend === "accelerating" ? "↑" : (timing as { trend?: string }).trend === "slowing" ? "↓" : "→"}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Market {(timing as { trend?: string }).trend || "stable"}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comparable rounds */}
        {data.comparable_rounds && data.comparable_rounds.length > 0 && (
          <div className="mb-10 rounded-lg border border-zinc-800/50 bg-zinc-900/20 p-5">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Comparable Rounds</h3>
            <div className="space-y-2">
              {data.comparable_rounds.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{r.name || "Undisclosed"}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400 text-xs">{r.stage?.replace(/_/g, " ")}</span>
                    <span className="text-white font-medium">{formatUSD(r.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment sections */}
        <div className="space-y-6 mb-12">
          {sections.map((section, i) => {
            if (!section.title && !section.content.trim()) return null;
            const style = typeStyles[section.type];
            return (
              <div key={i} className={`rounded-lg border ${style.border} ${style.bg} p-5`}>
                {section.title && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <h3 className={`text-sm font-semibold uppercase tracking-wider ${style.accent}`}>
                      {section.title}
                    </h3>
                  </div>
                )}
                <div
                  className="text-sm text-zinc-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContent(section.content) }}
                />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-orange-900/20 bg-gradient-to-br from-orange-950/20 to-zinc-950 p-8 text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-2">
            Want your own assessment?
          </h2>
          <p className="text-zinc-400 mb-6 text-sm max-w-md mx-auto">
            Free, data-grounded, benchmarked against 24,000+ real funding rounds. Takes 5 minutes.
          </p>
          <a
            href="/signup"
            className="inline-block rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
          >
            Get your free assessment
          </a>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-zinc-700 text-xs">
            Powered by{" "}
            <a href="/" className="text-zinc-600 hover:text-zinc-400 transition-colors">
              <span className="text-orange-600">raise</span><span className="text-teal-600">(fn)</span>
            </a>
            {" "}— fundraising intelligence from 24,000+ real rounds
          </p>
        </div>
      </div>
    </div>
  );
}
