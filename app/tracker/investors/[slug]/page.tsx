import Link from "next/link";
import { getInvestor, getInvestorRounds } from "@/lib/api";
import { formatUSD, formatDate } from "@/lib/format";
import TrackerComingSoon from "@/components/tracker-coming-soon";

interface Props {
  params: Promise<{ slug: string }>;
}

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

  return (
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
    </div>
  );
}
