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
    const res = await fetch(`${BRAIN_URL}/v1/brain/assessment/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
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
  const title = data.company_name ? `${data.company_name} — Raise Readiness` : `Raise Readiness Assessment`;
  const description = `Fundraising assessment from raise(fn) — benchmarked against 24,000+ real funding rounds.`;
  return { title, description, openGraph: { title, description, type: "article", siteName: "raise(fn)" }, twitter: { card: "summary_large_image", title, description } };
}

function parseSections(text: string) {
  const sections: { title: string; bullets: { bold: string; detail: string }[]; paragraphs: string[] }[] = [];
  const lines = text.split("\n");
  let cur: (typeof sections)[0] | null = null;

  for (const line of lines) {
    const h = line.match(/^#{1,3}\s+(.+)/);
    if (h) {
      if (cur) sections.push(cur);
      cur = { title: h[1].replace(/\*\*/g, ""), bullets: [], paragraphs: [] };
    } else if (cur) {
      const bullet = line.match(/^-\s+(.+)/);
      if (bullet) {
        const boldMatch = bullet[1].match(/\*\*(.+?)\*\*\s*[—–-]\s*(.*)/);
        if (boldMatch) {
          cur.bullets.push({ bold: boldMatch[1], detail: boldMatch[2] });
        } else {
          cur.bullets.push({ bold: "", detail: bullet[1].replace(/\*\*/g, "") });
        }
      } else if (line.trim()) {
        cur.paragraphs.push(line.trim());
      }
    }
  }
  if (cur) sections.push(cur);
  return sections;
}

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

function classifySection(title: string): string {
  const l = title.toLowerCase();
  if (l.includes("score") || l.includes("readiness")) return "score";
  if (l.includes("strength") || l.includes("going for")) return "strength";
  if (l.includes("gap") || l.includes("risk") || l.includes("fix") || l.includes("weak")) return "gap";
  if (l.includes("competitive") || l.includes("landscape")) return "landscape";
  if (l.includes("market") || l.includes("momentum")) return "momentum";
  if (l.includes("verdict") || l.includes("bottom")) return "verdict";
  return "general";
}

function ScoreRing({ score, max }: { score: number; max: number }) {
  const pct = (score / max) * 100;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : pct >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="relative w-36 h-36">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#27272a" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-zinc-500">out of {max}</span>
      </div>
    </div>
  );
}

function CompBar({ name, amount, maxAmount }: { name: string; amount: number; maxAmount: number }) {
  const pct = Math.min((amount / maxAmount) * 100, 100);
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-zinc-300">{name}</span>
        <span className="text-sm font-mono text-white">{formatUSD(amount)}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-700"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
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
  const timing = data.timing_intelligence as { trend?: string; current_quarter_closes?: number; previous_quarter_closes?: number } | null;
  const contentSections = sections.filter(s => classifySection(s.title) !== "score");
  const maxRoundAmount = data.comparable_rounds ? Math.max(...data.comparable_rounds.map(r => r.amount || 0)) : 0;

  const sectionConfig: Record<string, { icon: string; accent: string; bg: string; border: string }> = {
    strength: { icon: "▲", accent: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-l-emerald-500" },
    gap: { icon: "▼", accent: "text-orange-400", bg: "bg-orange-500/5", border: "border-l-orange-500" },
    landscape: { icon: "◆", accent: "text-blue-400", bg: "bg-blue-500/5", border: "border-l-blue-500" },
    momentum: { icon: "◉", accent: "text-violet-400", bg: "bg-violet-500/5", border: "border-l-violet-500" },
    verdict: { icon: "★", accent: "text-teal-400", bg: "bg-teal-500/5", border: "border-l-teal-500" },
    general: { icon: "●", accent: "text-zinc-400", bg: "bg-zinc-500/5", border: "border-l-zinc-500" },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      {/* Nav */}
      <div className="border-b border-zinc-900/50">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <a href="/"><span className="text-lg font-bold"><span className="text-orange-500">raise</span><span className="text-teal-400">(fn)</span></span></a>
          <a href="/signup" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Get your own assessment →</a>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6">

        {/* Hero section */}
        <div className="py-16 border-b border-zinc-900/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {data.sector && <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{fmt(data.sector)}</span>}
                {data.stage && <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{fmt(data.stage)}</span>}
              </div>
              <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
                {data.company_name || "Assessment"}
              </h1>
              <p className="text-zinc-500 text-sm">
                Raise readiness assessment · Benchmarked against {data.comparable_rounds?.length || "24,000+"} comparable rounds
                {data.created_at && <> · {new Date(data.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</>}
              </p>
            </div>
            {scoreData && (
              <div className="flex-shrink-0">
                <ScoreRing score={scoreData.score} max={scoreData.max} />
              </div>
            )}
          </div>
        </div>

        {/* Key metrics strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900/50 border-b border-zinc-900/50">
          {scoreData && (
            <div className="bg-zinc-950 p-6">
              <div className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Score</div>
              <div className="text-2xl font-bold text-white">{scoreData.score}<span className="text-zinc-600 text-lg">/{scoreData.max}</span></div>
            </div>
          )}
          {data.active_investors_count && (
            <div className="bg-zinc-950 p-6">
              <div className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Active Investors</div>
              <div className="text-2xl font-bold text-teal-400">{data.active_investors_count}</div>
              <div className="text-xs text-zinc-600 mt-1">in your space right now</div>
            </div>
          )}
          {data.comparable_rounds && data.comparable_rounds.length > 0 && (
            <div className="bg-zinc-950 p-6">
              <div className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Comparable Rounds</div>
              <div className="text-2xl font-bold text-orange-400">{data.comparable_rounds.length}</div>
              <div className="text-xs text-zinc-600 mt-1">analyzed for this report</div>
            </div>
          )}
          {timing && (
            <div className="bg-zinc-950 p-6">
              <div className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Market Trend</div>
              <div className="text-2xl font-bold">
                {timing.trend === "accelerating" ? <span className="text-emerald-400">Accelerating</span>
                 : timing.trend === "slowing" ? <span className="text-red-400">Cooling</span>
                 : <span className="text-zinc-400">Stable</span>}
              </div>
              {timing.current_quarter_closes && timing.previous_quarter_closes && (
                <div className="text-xs text-zinc-600 mt-1">{timing.current_quarter_closes} closes this Q vs {timing.previous_quarter_closes} last Q</div>
              )}
            </div>
          )}
        </div>

        {/* Score section paragraph */}
        {sections.filter(s => classifySection(s.title) === "score").map((s, i) => (
          s.paragraphs.length > 0 && (
            <div key={i} className="py-8 border-b border-zinc-900/50">
              <p className="text-lg text-zinc-300 leading-relaxed max-w-3xl">{s.paragraphs.join(" ").replace(/\*\*/g, "")}</p>
            </div>
          )
        ))}

        {/* Two column layout: assessment + comps sidebar */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 py-10">

          {/* Main content */}
          <div className="flex-1 space-y-10">
            {contentSections.map((section, i) => {
              const type = classifySection(section.title);
              const config = sectionConfig[type] || sectionConfig.general;

              return (
                <div key={i} className={`border-l-2 ${config.border} pl-6`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs ${config.accent}`}>{config.icon}</span>
                    <h2 className={`text-xs font-semibold uppercase tracking-widest ${config.accent}`}>{section.title}</h2>
                  </div>

                  {section.bullets.length > 0 && (
                    <div className="space-y-4">
                      {section.bullets.map((b, j) => (
                        <div key={j} className={`rounded-lg ${config.bg} p-4`}>
                          {b.bold ? (
                            <>
                              <div className="text-sm font-semibold text-white mb-1">{b.bold}</div>
                              <div className="text-sm text-zinc-400 leading-relaxed">{b.detail}</div>
                            </>
                          ) : (
                            <div className="text-sm text-zinc-300 leading-relaxed">{b.detail}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.paragraphs.length > 0 && (
                    <div className={`${section.bullets.length > 0 ? "mt-4" : ""} space-y-2`}>
                      {section.paragraphs.map((p, j) => (
                        <p key={j} className="text-sm text-zinc-400 leading-relaxed"
                           dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<span class="text-white font-medium">$1</span>') }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar: comparable rounds */}
          {data.comparable_rounds && data.comparable_rounds.length > 0 && (
            <div className="lg:w-80 flex-shrink-0 mt-10 lg:mt-0">
              <div className="lg:sticky lg:top-8">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Comparable Rounds</h3>
                <div className="space-y-5">
                  {data.comparable_rounds.map((r, i) => (
                    <CompBar key={i} name={r.name || "Undisclosed"} amount={r.amount || 0} maxAmount={maxRoundAmount} />
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/50">
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Median</span>
                    <span className="text-zinc-400 font-mono">
                      {formatUSD(
                        data.comparable_rounds
                          .map(r => r.amount || 0)
                          .sort((a, b) => a - b)
                          [Math.floor(data.comparable_rounds.length / 2)]
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="py-16 border-t border-zinc-900/50">
          <div className="relative overflow-hidden rounded-2xl p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 via-zinc-950 to-teal-950/30" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.08),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-3">Get your own assessment</h2>
              <p className="text-zinc-500 mb-8 max-w-lg mx-auto">
                Free. Data-grounded. Benchmarked against 24,000+ real funding rounds. Five minutes of conversation — the brain does the rest.
              </p>
              <a href="/signup" className="inline-block rounded-full bg-orange-600 px-10 py-3.5 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-xl shadow-orange-900/20">
                Get started free
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-zinc-900/50">
          <a href="/" className="inline-flex items-center gap-2 text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
            <span className="font-bold"><span className="text-orange-700">raise</span><span className="text-teal-700">(fn)</span></span>
            <span className="text-zinc-800">·</span>
            <span>Fundraising intelligence from 24,000+ real rounds</span>
          </a>
        </div>
      </div>
    </div>
  );
}
