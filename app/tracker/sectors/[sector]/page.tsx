import Link from "next/link";
import { getRounds, getStatsSectors } from "@/lib/api";
import { formatUSD, formatDate } from "@/lib/format";
import TrackerComingSoon from "@/components/tracker-coming-soon";
import StatsCard from "@/components/stats-card";

const typeColors: Record<string, string> = {
  seed: "bg-emerald-900/60 text-emerald-300",
  pre_seed: "bg-emerald-900/40 text-emerald-400",
  series_a: "bg-blue-900/60 text-blue-300",
  series_b: "bg-violet-900/60 text-violet-300",
  series_c: "bg-purple-900/60 text-purple-300",
  series_d: "bg-fuchsia-900/60 text-fuchsia-300",
  strategic: "bg-amber-900/60 text-amber-300",
  grant: "bg-teal-900/60 text-teal-300",
  ico: "bg-orange-900/60 text-orange-300",
  ido: "bg-orange-900/40 text-orange-400",
  private: "bg-zinc-700/60 text-zinc-300",
};

interface Props {
  params: Promise<{ sector: string }>;
}

export const dynamic = "force-dynamic";

export default async function SectorDetailPage({ params }: Props) {
  const { sector } = await params;
  const sectorName = decodeURIComponent(sector);

  let sectorStats, rounds;
  try {
    const [sectors, roundsRes] = await Promise.all([
      getStatsSectors("all"),
      getRounds({ sector: sectorName, limit: 50, sort: "-date" }),
    ]);
    sectorStats = sectors.find(
      (s) => s.sector.toLowerCase() === sectorName.toLowerCase()
    );
    rounds = roundsRes.data;
  } catch {
    return <TrackerComingSoon />;
  }

  if (!sectorStats && rounds.length === 0) {
    return <TrackerComingSoon />;
  }

  const displayName = sectorName.replace(/_/g, " ");

  return (
    <div>
      <Link
        href="/tracker/pulse"
        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        &larr; Back to Market Pulse
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-white capitalize">
          {displayName}
        </h1>
        <p className="text-sm text-zinc-400">Sector overview and recent rounds</p>
      </div>

      {sectorStats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-8">
          <StatsCard
            label="Total Rounds"
            value={sectorStats.round_count.toLocaleString()}
          />
          <StatsCard
            label="Total Capital"
            value={formatUSD(sectorStats.total_capital)}
          />
          <StatsCard
            label="Avg Round"
            value={formatUSD(sectorStats.avg_round_size)}
          />
        </div>
      )}

      {rounds.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">
            Recent Rounds
          </h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-400">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-400">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-400">
                    Investors
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {rounds.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/tracker/projects/${r.project.slug}`}
                        className="font-medium text-zinc-200 hover:text-white"
                      >
                        {r.project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {r.round_type && (
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            typeColors[r.round_type] ||
                            "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {r.round_type.replace(/_/g, " ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300">
                      {formatUSD(r.amount_usd)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 truncate max-w-xs">
                      {r.investors
                        .slice(0, 3)
                        .map((i) => (
                          <Link
                            key={i.id}
                            href={`/tracker/investors/${i.slug}`}
                            className="text-blue-400 hover:text-blue-300 mr-2"
                          >
                            {i.name}
                          </Link>
                        ))}
                      {r.investors.length > 3 && (
                        <span className="text-zinc-600">
                          +{r.investors.length - 3}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500">
                      {formatDate(r.date)}
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
