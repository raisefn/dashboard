import type { Metadata } from "next";
import Link from "next/link";
import { getInvestor, getInvestorRounds } from "@/lib/api";
import { formatUSD, formatDate } from "@/lib/format";
import TrackerComingSoon from "@/components/tracker-coming-soon";
import BrainCTAInline from "@/components/brain-cta-inline";

interface Props {
  params: Promise<{ slug: string }>;
}

// Truncate to N chars on a word boundary, ending with an ellipsis if cut.
function clip(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut) + "…";
}

// Best-effort display name from a slug. "01-advisors" → "01 Advisors".
// Used as the metadata fallback when the API call fails — keeps each page
// individually rankable instead of all defaulting to the same fallback title.
function nameFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const url = `/tracker/investors/${slug}`;
  try {
    const investor = await getInvestor(slug);
    const title = `${investor.name} — Investor Profile | raise(fn)`;
    const typePart = investor.type ? `${investor.type}` : "investor";
    const locPart = investor.hq_location ? `, based in ${investor.hq_location}` : "";
    const fallbackDescription = `${investor.name} is a ${typePart}${locPart}. View their recent funding activity, portfolio companies, and round-level data tracked from SEC filings on raise(fn).`;
    const description = investor.description
      ? clip(investor.description, 160)
      : clip(fallbackDescription, 160);
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { title, description, url, type: "website", siteName: "raise(fn)" },
      twitter: { card: "summary_large_image", title, description },
    };
  } catch {
    // API failed — derive a per-entity title from the slug so each page is
    // still individually indexable. Generic fallback would make every dynamic
    // page identical to Google.
    const displayName = nameFromSlug(slug);
    const title = `${displayName} — Investor Profile | raise(fn)`;
    const description = `View funding activity and portfolio details for ${displayName} on raise(fn) — fundraising intelligence sourced from SEC filings and public records.`;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { title, description, url, type: "website", siteName: "raise(fn)" },
      twitter: { card: "summary_large_image", title, description },
    };
  }
}

const SITE = "https://www.raisefn.com";

export default async function InvestorDetailPage({ params }: Props) {
  const { slug } = await params;

  let investor, rounds;
  try {
    investor = await getInvestor(slug);
    const res = await getInvestorRounds(slug, { limit: 100 });
    rounds = res.data;
  } catch {
    return <TrackerComingSoon />;
  }

  // JSON-LD structured data — Organization with affiliated rounds where
  // possible. Lets Google render rich knowledge-panel-style results +
  // surfaces this as a real entity in their knowledge graph.
  const sameAs = [
    investor.website,
    investor.twitter ? `https://twitter.com/${investor.twitter}` : null,
  ].filter((x): x is string => !!x);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: investor.name,
    url: `${SITE}/tracker/investors/${slug}`,
    ...(investor.website && { sameAs }),
    ...(investor.description && { description: investor.description }),
    ...(investor.hq_location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: investor.hq_location,
      },
    }),
    ...(investor.type && { additionalType: investor.type }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
      <Link href="/tracker/investors" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        &larr; Back to investors
      </Link>

      <div className="mt-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">{investor.name}</h1>
          {investor.type && (
            <span className="rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-400">
              {investor.type}
            </span>
          )}
        </div>
        {investor.description && (
          <p className="mt-2 max-w-3xl text-sm text-zinc-400 leading-relaxed">
            {investor.description}
          </p>
        )}
        <div className="mt-3 flex gap-4 text-sm">
          {investor.website && (
            <a href={investor.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              Website
            </a>
          )}
          {investor.twitter && (
            <a href={`https://twitter.com/${investor.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              @{investor.twitter}
            </a>
          )}
          {investor.hq_location && (
            <span className="text-zinc-500">{investor.hq_location}</span>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Rounds ({rounds.length})</h2>
      </div>

      {rounds.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Date</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Project</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Type</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Amount</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Valuation</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Sector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {rounds.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                    {formatDate(r.date)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/tracker/projects/${r.project.slug}`}
                      className="font-medium text-white hover:text-blue-400 transition-colors"
                    >
                      {r.project.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {r.round_type && (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                        {r.round_type}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-300">
                    {formatUSD(r.amount_usd)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-300">
                    {formatUSD(r.valuation_usd)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {r.sector && (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs">
                        {r.sector}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-zinc-500">No rounds found for this investor.</p>
      )}

      <BrainCTAInline
        text={`Want to know if ${investor.name} is the right fit for your raise? Get matched with the right investors.`}
      />
      </div>
    </>
  );
}
