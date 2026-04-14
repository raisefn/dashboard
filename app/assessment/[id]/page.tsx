import { Metadata } from "next";

const BRAIN_URL = "https://brain-production-61da.up.railway.app";

interface AssessmentData {
  assessment_id: string;
  created_at: string | null;
  sector: string | null;
  stage: string | null;
  company_name: string | null;
  assessment_text: string | null;
  comparable_rounds: { name: string | null; amount: number | null; stage: string | null; date: string | null }[] | null;
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

function fmt(s: string | null): string {
  return s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getAssessment(id);
  if (!data) return { title: "Raise Intelligence — raise(fn)" };
  const title = data.company_name
    ? `${data.company_name} — Raise Intelligence Briefing`
    : `Raise Intelligence Briefing — ${fmt(data.sector)}`;
  const description = "Data-grounded fundraising intelligence from raise(fn). Benchmarked against 24,000+ real funding rounds.";
  return { title, description, openGraph: { title, description, type: "article", siteName: "raise(fn)" }, twitter: { card: "summary_large_image", title, description } };
}

function renderMarkdown(text: string): string {
  return text
    // Horizontal rules
    .replace(/^---$/gm, '<div class="section-divider"></div>')
    // H2 headers
    .replace(/^## (.+)$/gm, '<h2 class="section-header">$1</h2>')
    // H3 headers
    .replace(/^### (.+)$/gm, '<h3 class="subsection-header">$1</h3>')
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Bullet points with bold lead
    .replace(/^- \*\*(.+?)\*\* — (.+)$/gm,
      '<div class="bullet-item"><div class="bullet-bold">$1</div><div class="bullet-detail">$2</div></div>')
    .replace(/^- \*\*(.+?)\*\*(.+)$/gm,
      '<div class="bullet-item"><div class="bullet-bold">$1</div><div class="bullet-detail">$2</div></div>')
    // Regular bullet points
    .replace(/^- (.+)$/gm, '<div class="bullet-item"><div class="bullet-detail">$1</div></div>')
    // Numbered items with bold
    .replace(/^\*\*(\d+)\. (.+?)\*\*$/gm, '<div class="objection-header">$1. $2</div>')
    // Arrow responses
    .replace(/^→ (.+)$/gm, '<div class="response-text">$1</div>')
    .replace(/^→(.+)$/gm, '<div class="response-text">$1</div>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="paragraph">')
    // Single newlines within paragraphs
    .replace(/\n/g, '<br />');
}

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAssessment(id);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Briefing not found</h1>
          <p className="text-zinc-500 mb-6">This briefing may have expired or been removed.</p>
          <a href="/signup" className="text-orange-400 hover:text-orange-300 text-sm">Get your own free briefing →</a>
        </div>
      </div>
    );
  }

  // Extract company name from text if not in structured data
  const companyName = data.company_name
    || data.assessment_text?.match(/BRIEFING\s*—\s*(\w+)/)?.[1]
    || null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <style>{`
        .section-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(249, 115, 22, 0.3), transparent);
          margin: 2rem 0;
        }
        .section-header {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #fb923c;
          margin: 2.5rem 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(249, 115, 22, 0.15);
        }
        .subsection-header {
          font-size: 0.85rem;
          font-weight: 600;
          color: #e4e4e7;
          margin: 1.5rem 0 0.75rem 0;
        }
        .bullet-item {
          padding: 0.75rem 1rem;
          margin: 0.5rem 0;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-left: 2px solid rgba(249, 115, 22, 0.3);
        }
        .bullet-bold {
          font-size: 0.85rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }
        .bullet-detail {
          font-size: 0.85rem;
          color: #a1a1aa;
          line-height: 1.6;
        }
        .objection-header {
          font-size: 0.85rem;
          font-weight: 600;
          color: #ffffff;
          margin: 1.25rem 0 0.25rem 0;
        }
        .response-text {
          font-size: 0.85rem;
          color: #a1a1aa;
          padding-left: 1rem;
          border-left: 2px solid rgba(45, 212, 191, 0.3);
          margin: 0.5rem 0 1rem 0;
          line-height: 1.6;
        }
        .paragraph {
          font-size: 0.9rem;
          color: #d4d4d8;
          line-height: 1.7;
          margin: 0.75rem 0;
        }
        strong {
          color: #ffffff;
          font-weight: 600;
        }
      `}</style>

      {/* Nav */}
      <div className="border-b border-zinc-900/50">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <a href="/"><span className="text-lg font-bold"><span className="text-orange-500">raise</span><span className="text-teal-400">(fn)</span></span></a>
          <a href="/signup" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Get your own briefing →</a>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6">

        {/* Hero */}
        <div className="py-12 border-b border-zinc-900/50">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {data.sector && <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{fmt(data.sector)}</span>}
            {data.stage && <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{fmt(data.stage)}</span>}
            {data.created_at && <span className="text-[10px] text-zinc-700">{new Date(data.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {companyName ? `${companyName} — Raise Intelligence Briefing` : "Raise Intelligence Briefing"}
          </h1>
          <p className="text-zinc-500 text-sm">Grounded in 24,000+ real funding rounds</p>
        </div>

        {/* Briefing content */}
        <div className="py-10">
          <div
            className="briefing-content"
            dangerouslySetInnerHTML={{
              __html: data.assessment_text
                ? renderMarkdown(data.assessment_text)
                : "<p>Briefing content unavailable.</p>",
            }}
          />
        </div>

        {/* CTA */}
        <div className="py-12 border-t border-zinc-900/50">
          <div className="relative overflow-hidden rounded-2xl p-10 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 via-zinc-950 to-teal-950/20" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-3">Get your own briefing</h2>
              <p className="text-zinc-500 mb-6 max-w-md mx-auto text-sm">
                Free. Data-grounded. Five minutes of conversation — the brain does the rest.
              </p>
              <a href="/signup" className="inline-block rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/20">
                Get started free
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-zinc-900/50">
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
