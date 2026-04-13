import { Metadata } from "next";

const BRAIN_URL = "https://brain-production-61da.up.railway.app";

interface AssessmentData {
  assessment_id: string;
  created_at: string | null;
  sector: string | null;
  stage: string | null;
  company_name: string | null;
  assessment_text: string | null;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getAssessment(id);
  if (!data) return { title: "Assessment — raise(fn)" };

  const sector = data.sector?.replace(/_/g, " ") || "startup";
  const stage = data.stage?.replace(/_/g, " ") || "";
  const title = `Raise Readiness Assessment — ${sector} ${stage}`.trim();
  const description = `A data-grounded fundraising assessment from raise(fn), benchmarked against 24,000+ real funding rounds.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "raise(fn)",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAssessment(id);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Assessment not found</h1>
          <p className="text-zinc-400 mb-6">This assessment may have expired or been removed.</p>
          <a href="/signup" className="text-teal-400 hover:text-teal-300">
            Get your own free assessment →
          </a>
        </div>
      </div>
    );
  }

  const sector = data.sector?.replace(/_/g, " ") || "";
  const stage = data.stage?.replace(/_/g, " ") || "";

  // Simple markdown-to-html (headers, bold, lists)
  function renderText(text: string) {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-3">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-zinc-300">$1</li>')
      .replace(/\n/g, "<br />");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <a href="/" className="inline-block mb-6">
          <span className="text-xl font-bold">
            <span className="text-orange-500">raise</span>
            <span className="text-teal-400">(fn)</span>
          </span>
        </a>
        <h1 className="text-3xl font-bold text-white mb-2">
          Raise Readiness Assessment
        </h1>
        {(sector || stage) && (
          <p className="text-zinc-400">
            {sector} {stage && `· ${stage}`}
          </p>
        )}
        {data.created_at && (
          <p className="text-zinc-600 text-sm mt-1">
            {new Date(data.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Assessment content */}
      <div
        className="prose prose-invert prose-zinc max-w-none text-zinc-300 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: data.assessment_text
            ? renderText(data.assessment_text)
            : "<p>Assessment content unavailable.</p>",
        }}
      />

      {/* CTA */}
      <div className="mt-12 rounded-xl border border-orange-900/20 bg-orange-950/10 p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Want your own assessment?
        </h2>
        <p className="text-zinc-400 mb-6 text-sm">
          Free, data-grounded, benchmarked against 24,000+ real funding rounds.
        </p>
        <a
          href="/signup"
          className="inline-block rounded-full bg-orange-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 shadow-lg shadow-orange-900/30"
        >
          Get your free assessment
        </a>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-zinc-600 text-xs">
          Powered by{" "}
          <a href="/" className="text-zinc-500 hover:text-zinc-400">
            raise(fn)
          </a>{" "}
          — fundraising intelligence from 24,000+ real rounds
        </p>
      </div>
    </div>
  );
}
