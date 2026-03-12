import Link from "next/link";
import { getProject, getRounds, type Founder } from "@/lib/api";
import { formatUSD, formatNumber, formatPercent, formatPrice, formatDate, percentColor } from "@/lib/format";
import StatsCard from "@/components/stats-card";
import TrackerComingSoon from "@/components/tracker-coming-soon";

interface Props {
  params: Promise<{ slug: string }>;
}

function FounderCard({ founder }: { founder: Founder }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-white truncate">{founder.name}</h3>
          {founder.role && (
            <p className="text-xs text-zinc-500">{founder.role}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {founder.linkedin && (
            <a
              href={founder.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              LinkedIn
            </a>
          )}
          {founder.twitter && (
            <a
              href={`https://twitter.com/${founder.twitter.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {founder.twitter}
            </a>
          )}
          {founder.github && (
            <a
              href={`https://github.com/${founder.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
      {founder.bio && (
        <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-3">
          {founder.bio}
        </p>
      )}
      {founder.previous_companies && founder.previous_companies.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-zinc-600">Previously:</span>
          {founder.previous_companies.slice(0, 5).map((pc, i) => (
            <span
              key={i}
              className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
            >
              {pc.name}
              {pc.role && <span className="text-zinc-600"> ({pc.role})</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;

  let project, rounds;
  try {
    project = await getProject(slug);
    const { data: allRounds } = await getRounds({ limit: 200 });
    rounds = allRounds.filter((r) => r.project.slug === slug);
  } catch {
    return <TrackerComingSoon />;
  }

  const founders = project.founders || [];

  return (
    <div>
      <Link href="/tracker/projects" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        &larr; Back to projects
      </Link>

      <div className="mt-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          {project.token_symbol && (
            <span className="rounded bg-zinc-800 px-2 py-1 text-sm font-mono text-zinc-400">
              {project.token_symbol}
            </span>
          )}
          {project.status !== "active" && (
            <span className="rounded bg-red-900/50 px-2 py-1 text-xs text-red-300">
              {project.status}
            </span>
          )}
        </div>
        {project.description && (
          <p className="mt-2 max-w-3xl text-sm text-zinc-400 leading-relaxed">
            {project.description}
          </p>
        )}
        <div className="mt-3 flex gap-4 text-sm">
          {project.website && (
            <a href={project.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              Website
            </a>
          )}
          {project.twitter && (
            <a href={`https://twitter.com/${project.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              @{project.twitter}
            </a>
          )}
          {project.github && (
            <a href={project.github.startsWith("http") ? project.github : `https://github.com/${project.github}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              GitHub
            </a>
          )}
        </div>
        {project.chains && project.chains.length > 0 && (
          <div className="mt-3 flex gap-2">
            {project.chains.map((chain) => (
              <span key={chain} className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                {chain}
              </span>
            ))}
          </div>
        )}
      </div>

      {(() => {
        const stats = [
          project.tvl != null && { label: "TVL", value: formatUSD(project.tvl), subValue: project.tvl_change_7d != null ? `${formatPercent(project.tvl_change_7d)} 7d` : undefined, subColor: percentColor(project.tvl_change_7d) },
          project.market_cap != null && { label: "Market Cap", value: formatUSD(project.market_cap) },
          project.token_price_usd != null && { label: "Token Price", value: formatPrice(project.token_price_usd) },
          project.github_stars != null && { label: "GitHub Stars", value: formatNumber(project.github_stars) },
          project.github_contributors != null && { label: "Contributors", value: formatNumber(project.github_contributors) },
          project.github_commits_30d != null && { label: "30d Commits", value: formatNumber(project.github_commits_30d) },
          project.twitter_followers != null && { label: "Twitter Followers", value: formatNumber(project.twitter_followers) },
          project.reddit_subscribers != null && { label: "Reddit Subscribers", value: formatNumber(project.reddit_subscribers) },
          project.token_holder_count != null && { label: "Token Holders", value: formatNumber(project.token_holder_count) },
        ].filter(Boolean) as { label: string; value: string; subValue?: string; subColor?: string }[];

        if (stats.length === 0) return null;

        const cols = stats.length <= 3 ? "sm:grid-cols-3" : stats.length <= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3 lg:grid-cols-6";

        return (
          <div className={`grid grid-cols-2 gap-4 ${cols}`}>
            {stats.map((s) => (
              <StatsCard key={s.label} label={s.label} value={s.value} subValue={s.subValue} subColor={s.subColor} />
            ))}
          </div>
        );
      })()}

      {/* Founders */}
      {founders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Team</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {founders.map((f) => (
              <FounderCard key={f.id} founder={f} />
            ))}
          </div>
        </div>
      )}

      {/* Founders */}
      {founders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Team</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {founders.map((f) => (
              <FounderCard key={f.id} founder={f} />
            ))}
          </div>
        </div>
      )}

      {rounds.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Funding Rounds</h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-400">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-400">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-400">Amount</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-400">Valuation</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-400">Lead Investors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {rounds.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3 text-zinc-300">{formatDate(r.date)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                        {r.round_type || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300">
                      {formatUSD(r.amount_usd)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300">
                      {formatUSD(r.valuation_usd)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {r.investors
                        .filter((i) => i.is_lead)
                        .map((i) => (
                          <Link key={i.id} href={`/tracker/investors/${i.slug}`} className="text-blue-400 hover:text-blue-300 mr-2">
                            {i.name}
                          </Link>
                        ))}
                      {r.investors.filter((i) => i.is_lead).length === 0 &&
                        r.investors.slice(0, 3).map((i) => (
                          <Link key={i.id} href={`/tracker/investors/${i.slug}`} className="text-zinc-400 hover:text-zinc-300 mr-2">
                            {i.name}
                          </Link>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
