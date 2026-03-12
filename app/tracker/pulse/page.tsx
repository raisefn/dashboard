import Link from "next/link";
import {
  getStatsOverview,
  getStatsInvestors,
  getStatsMomentum,
  getStatsSignals,
  getStatsVelocity,
  getHealth,
  type SectorMomentum,
  type ProjectSignal,
  type InvestorVelocity,
} from "@/lib/api";
import { formatUSD, formatNumber, formatPercent, percentColor } from "@/lib/format";
import StatsCard from "@/components/stats-card";
import TrackerComingSoon from "@/components/tracker-coming-soon";
import { typeColorsText } from "@/lib/colors";

export const revalidate = 60;

const PERIODS = [
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
  { value: "all", label: "All time" },
];

async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

interface Props {
  searchParams: Promise<{ period?: string }>;
}

export default async function PulsePage({ searchParams }: Props) {
  const params = await searchParams;
  const period = params.period || "90d";

  // Core data — page falls back to coming soon if these fail
  let overview, investors, health;
  try {
    [overview, investors, health] = await Promise.all([
      getStatsOverview(period),
      getStatsInvestors(period, 10),
      getHealth(),
    ]);
  } catch {
    return <TrackerComingSoon />;
  }

  // Derived metrics — fail independently, sections just don't render
  const [momentum, signals, velocity] = await Promise.all([
    safeFetch<SectorMomentum[]>(() => getStatsMomentum(period)),
    safeFetch<ProjectSignal[]>(() => getStatsSignals(15)),
    safeFetch<InvestorVelocity[]>(() => getStatsVelocity(15)),
  ]);

  const changePct = overview.prior_period_change;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Pulse</h1>
          <p className="text-sm text-zinc-400">
            Fundraising activity overview
          </p>
        </div>

        {/* Period selector */}
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/tracker/pulse?period=${p.value}`}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.value
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        <StatsCard
          label="Rounds"
          value={formatNumber(overview.total_rounds)}
          subValue={
            changePct?.total_rounds_pct != null
              ? `${changePct.total_rounds_pct >= 0 ? "+" : ""}${changePct.total_rounds_pct.toFixed(1)}%`
              : undefined
          }
          subColor={
            changePct?.total_rounds_pct != null
              ? changePct.total_rounds_pct >= 0
                ? "text-emerald-400"
                : "text-red-400"
              : undefined
          }
        />
        <StatsCard
          label="Total Capital"
          value={formatUSD(overview.total_capital)}
          subValue={
            changePct?.total_capital_pct != null
              ? `${changePct.total_capital_pct >= 0 ? "+" : ""}${changePct.total_capital_pct.toFixed(1)}%`
              : undefined
          }
          subColor={
            changePct?.total_capital_pct != null
              ? changePct.total_capital_pct >= 0
                ? "text-emerald-400"
                : "text-red-400"
              : undefined
          }
        />
        <StatsCard
          label="Avg Round"
          value={formatUSD(overview.avg_round_size)}
        />
        <StatsCard
          label="Data Sources"
          value={formatNumber(health.project_count)}
          subValue={`Last: ${new Date(health.last_collection).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Round type breakdown */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">
            By Round Type
          </h2>
          <div className="space-y-3">
            {overview.by_round_type
              .sort((a, b) => b.count - a.count)
              .map((rt) => {
                const pct =
                  overview.total_rounds > 0
                    ? (rt.count / overview.total_rounds) * 100
                    : 0;
                return (
                  <div key={rt.round_type} className="flex items-center gap-3">
                    <span
                      className={`w-24 text-sm font-medium ${
                        typeColorsText[rt.round_type] || "text-zinc-400"
                      }`}
                    >
                      {rt.round_type.replace(/_/g, " ")}
                    </span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-zinc-600"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-10 text-right text-xs text-zinc-400">
                      {rt.count}
                    </span>
                    <span className="w-16 text-right font-mono text-xs text-zinc-500">
                      {formatUSD(rt.total_capital)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Most active investors */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">
            Most Active Investors
          </h2>
          <div className="space-y-2">
            {investors.most_active.map((inv, i) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-zinc-800/50 transition-colors"
              >
                <span className="w-5 text-xs text-zinc-600">{i + 1}</span>
                <Link
                  href={`/tracker/investors/${inv.slug}`}
                  className="flex-1 text-sm font-medium text-zinc-200 hover:text-white truncate"
                >
                  {inv.name}
                </Link>
                <span className="text-xs text-zinc-400">
                  {inv.round_count} rounds
                </span>
                <span className="w-16 text-right font-mono text-xs text-zinc-500">
                  {formatUSD(inv.total_deployed)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sector Momentum */}
      {momentum && momentum.length > 0 && (
        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="mb-1 text-sm font-semibold text-zinc-300">
            Sector Momentum
          </h2>
          <p className="mb-4 text-xs text-zinc-500">
            Deal count and capital change vs. prior period
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="pb-2 text-left font-medium">Sector</th>
                  <th className="pb-2 text-right font-medium">Deals</th>
                  <th className="pb-2 text-right font-medium">vs Prior</th>
                  <th className="pb-2 text-right font-medium">Capital</th>
                  <th className="pb-2 text-right font-medium">vs Prior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {momentum
                  .sort((a, b) => (b.current_count ?? 0) - (a.current_count ?? 0))
                  .slice(0, 12)
                  .map((s) => (
                    <tr key={s.sector} className="hover:bg-zinc-800/30">
                      <td className="py-2 capitalize">
                        <Link
                          href={`/tracker/sectors/${encodeURIComponent(s.sector)}`}
                          className="text-zinc-300 hover:text-white transition-colors"
                        >
                          {s.sector.replace(/_/g, " ")}
                        </Link>
                      </td>
                      <td className="py-2 text-right font-mono text-zinc-400">
                        {s.current_count}
                      </td>
                      <td className={`py-2 text-right font-mono ${percentColor(s.change_pct)}`}>
                        {formatPercent(s.change_pct)}
                      </td>
                      <td className="py-2 text-right font-mono text-zinc-400">
                        {formatUSD(s.current_capital)}
                      </td>
                      <td className={`py-2 text-right font-mono ${percentColor(s.capital_change_pct)}`}>
                        {formatPercent(s.capital_change_pct)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Raise Signals */}
        {signals && signals.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="mb-1 text-sm font-semibold text-zinc-300">
              Likely to Raise
            </h2>
            <p className="mb-4 text-xs text-zinc-500">
              Projects 9-24 months since last round, ranked by activity
            </p>
            <div className="space-y-2">
              {signals.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="w-5 text-xs text-zinc-600">{i + 1}</span>
                  <Link
                    href={`/tracker/projects/${p.slug}`}
                    className="flex-1 text-sm font-medium text-zinc-200 hover:text-white truncate"
                  >
                    {p.name}
                  </Link>
                  <span className="text-xs text-zinc-500 capitalize hidden sm:inline">
                    {p.sector?.replace(/_/g, " ") || "—"}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {p.days_since_last_raise}d ago
                  </span>
                  <span className="w-16 text-right font-mono text-xs text-zinc-500">
                    {formatUSD(p.total_raised)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investor Velocity */}
        {velocity && velocity.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="mb-1 text-sm font-semibold text-zinc-300">
              Investor Velocity
            </h2>
            <p className="mb-4 text-xs text-zinc-500">
              Deal pace — recent activity and avg cadence
            </p>
            <div className="space-y-2">
              {velocity.map((inv, i) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="w-5 text-xs text-zinc-600">{i + 1}</span>
                  <Link
                    href={`/tracker/investors/${inv.slug}`}
                    className="flex-1 text-sm font-medium text-zinc-200 hover:text-white truncate"
                  >
                    {inv.name}
                  </Link>
                  <div className="flex gap-3 text-xs">
                    <span className="text-zinc-500">
                      <span className="text-zinc-300 font-mono">{inv.deals_30d}</span> /30d
                    </span>
                    <span className="text-zinc-500">
                      <span className="text-zinc-300 font-mono">{inv.deals_90d}</span> /90d
                    </span>
                    <span className="text-zinc-500 hidden sm:inline">
                      <span className="text-zinc-300 font-mono">{inv.deals_365d}</span> /1y
                    </span>
                  </div>
                  <span className="w-14 text-right text-xs text-zinc-500">
                    {inv.avg_days_between_deals != null
                      ? `${Math.round(inv.avg_days_between_deals)}d avg`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
