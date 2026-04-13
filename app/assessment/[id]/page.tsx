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

function fmt(s: string | null): string {
  return s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getAssessment(id);
  if (!data) return { title: "Assessment — raise(fn)" };
  const title = data.company_name
    ? `${data.company_name} — Raise Readiness Assessment`
    : `Raise Readiness Assessment — ${fmt(data.sector)}`;
  const description = `Data-grounded fundraising assessment from raise(fn). Benchmarked against 24,000+ real funding rounds.`;
  return {
    title, description,
    openGraph: { title, description, type: "article", siteName: "raise(fn)" },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Parse markdown sections
function parseSections(text: string) {
  const sections: { title: string; bullets: string[]; paragraphs: string[] }[] = [];
  const lines = text.split("\n");
  let cur: { title: string; bullets: string[]; paragraphs: string[] } | null = null;

  for (const line of lines) {
    const h = line.match(/^#{1,3}\s+(.+)/);
    if (h) {
      if (cur) sections.push(cur);
      cur = { title: h[1].replace(/\*\*/g, ""), bullets: [], paragraphs: [] };
    } else if (cur) {
      const bullet = line.match(/^-\s+(.+)/);
      if (bullet) {
        cur.bullets.push(bullet[1]);
      } else if (line.trim()) {
        cur.paragraphs.push(line.trim());
      }
    }
  }
  if (cur) sections.push(cur);
  return sections;
}

function renderInline(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<span class="text-white font-medium">$1</span>')
    .replace(/—/g, '<span class="text-zinc-600">—</span>');
}

// Score extraction
function extractScore(sections: ReturnType<typeof parseSections>): { score: number; max: number } | null {
  for (const s of sections) {
    const m = s.title.match(/(\d+)\s*\/\s*(\d+)/);
    if (m) return { score: parseInt(m[1]), max: parseInt(m[2]) };
    for (const p of s.paragraphs) {
      const m2 = p.match(/(\d+)\s*\/\s*(\d+)/);
      if (m2) return { score: parseInt(m2[1]), max: parseInt(m2[2]) };
    }
  }
  return null;
}

// Section type classification
function classifySection(title: string): "score" | "strength" | "gap" | "landscape" | "momentum" | "verdict" | "general" {
  const l = title.toLowerCase();
  if (l.includes("score") || l.includes("readiness")) return "score";
  if (l.includes("strength") || l.includes("going for")) return "strength";
  if (l.includes("gap") || l.includes("risk") || l.includes("fix") || l.includes("weak")) return "gap";
  if (l.includes("competitive") || l.includes("landscape")) return "landscape";
  if (l.includes("market") || l.includes("momentum")) return "momentum";
  if (l.includes("verdict") || l.includes("bottom")) return "verdict";
  return "general";
}

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAssessment(id);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Assessment not found</h1>
          <p className="text-zinc-500 mb-6">This assessment may have expired or been removed.</p>
          <a href="/signup" className="text-orange-400 hover:text-orange-300 text-sm">Get your own free assessment →</a>
        </div>
      </div>
    );
  }

  const sections = data.assessment_text ? parseSections(data.assessment_text) : [];
  const scoreData = extractScore(sections);
  const timing = data.timing_intelligence as { trend?: string; current_quarter_closes?: number } | null;

  // Separate score section from content sections
  const contentSections = sections.filter(s => classifySection(s.title) !== "score");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      {/* Subtle top bar */}
      <div className="border-b border-zinc-900">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <a href="/">
            <span className="text-lg font-bold"><span className="text-orange-500">raise</span><span className="text-teal-400">(fn)</span></span>
          </a>
          <span className="text-xs text-zinc-700">Fundraising Intelligence</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* Hero */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {data.sector && <span className="rounded bg-zinc-900 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{fmt(data.sector)}</span>}
            {data.stage && <span className="rounded bg-zinc-900 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{fmt(data.stage)}</span>}
            {data.created_at && <span className="text-[11px] text-zinc-700">{new Date(data.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>}
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            {data.company_name || "Raise Readiness Assessment"}
          </h1>
          <p className="text-zinc-500 text-sm">Assessment grounded in 24,000+ real funding rounds</p>
        </div>

        {/* Score + Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {scoreData && (
            <div className="col-span-2 sm:col-span-1 rounded-lg border border-zinc-800 p-5">
              <div className="text-4xl font-bold text-white mb-1">
                {scoreData.score}<span className="text-lg text-zinc-600">/{scoreData.max}</span>
              </div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Readiness Score</div>
            </div>
          )}
          {data.active_investors_count && (
            <div className="rounded-lg border border-zinc-800 p-5">
              <div className="text-3xl font-bold text-teal-400 mb-1">{data.active_investors_count}</div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Active investors</div>
            </div>
          )}
          {data.comparable_rounds && data.comparable_rounds.length > 0 && (
            <div className="rounded-lg border border-zinc-800 p-5">
              <div className="text-3xl font-bold text-orange-400 mb-1">{data.comparable_rounds.length}</div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Comparable rounds</div>
            </div>
          )}
          {timing && (
            <div className="rounded-lg border border-zinc-800 p-5">
              <div className="text-3xl font-bold mb-1">
                {timing.trend === "accelerating" ? <span className="text-emerald-400">↑ Hot</span>
                 : timing.trend === "slowing" ? <span className="text-red-400">↓ Cooling</span>
                 : <span className="text-zinc-400">→ Stable</span>}
              </div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Market trend</div>
            </div>
          )}
        </div>

        {/* Comparable rounds */}
        {data.comparable_rounds && data.comparable_rounds.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">Comparable Rounds</h2>
            <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800/50">
              {data.comparable_rounds.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <span className="text-sm text-white font-medium">{r.name || "Undisclosed"}</span>
                    {r.date && <span className="text-xs text-zinc-600 ml-3">{new Date(r.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    {r.stage && <span className="text-[11px] text-zinc-500 uppercase">{fmt(r.stage)}</span>}
                    <span className="text-sm text-white font-mono font-medium">{formatUSD(r.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment sections */}
        <div className="space-y-8 mb-14">
          {contentSections.map((section, i) => {
            const type = classifySection(section.title);
            const accentColor = type === "strength" ? "text-emerald-400" : type === "gap" ? "text-orange-400" : type === "landscape" ? "text-blue-400" : type === "verdict" ? "text-teal-400" : type === "momentum" ? "text-violet-400" : "text-zinc-400";
            const borderColor = type === "strength" ? "border-emerald-900/40" : type === "gap" ? "border-orange-900/40" : type === "landscape" ? "border-blue-900/40" : type === "verdict" ? "border-teal-900/40" : type === "momentum" ? "border-violet-900/40" : "border-zinc-800";

            return (
              <div key={i}>
                <h2 className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${accentColor}`}>
                  {section.title}
                </h2>
                <div className={`rounded-lg border ${borderColor} bg-zinc-900/30 p-5`}>
                  {section.paragraphs.length > 0 && section.bullets.length === 0 && (
                    <div className="text-sm text-zinc-300 leading-relaxed space-y-2">
                      {section.paragraphs.map((p, j) => (
                        <p key={j} dangerouslySetInnerHTML={{ __html: renderInline(p) }} />
                      ))}
                    </div>
                  )}
                  {section.bullets.length > 0 && (
                    <div className="space-y-3">
                      {section.bullets.map((b, j) => (
                        <div key={j} className="flex gap-3 text-sm">
                          <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${accentColor.replace("text-", "bg-")}`} />
                          <span className="text-zinc-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderInline(b) }} />
                        </div>
                      ))}
                    </div>
                  )}
                  {section.paragraphs.length > 0 && section.bullets.length > 0 && (
                    <div className="mt-3 text-sm text-zinc-400 leading-relaxed">
                      {section.paragraphs.map((p, j) => (
                        <p key={j} dangerouslySetInnerHTML={{ __html: renderInline(p) }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-2xl border border-orange-900/20 p-10 text-center mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 via-zinc-950 to-teal-950/20" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-2">Get your own assessment</h2>
            <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
              Free. Data-grounded. Benchmarked against 24,000+ real rounds. Takes 5 minutes.
            </p>
            <a href="/signup" className="inline-block rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30">
              Get started free
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-zinc-900">
          <a href="/" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
            <span className="text-orange-700">raise</span><span className="text-teal-700">(fn)</span>
            <span className="ml-2">Fundraising intelligence from 24,000+ real rounds</span>
          </a>
        </div>
      </div>
    </div>
  );
}
