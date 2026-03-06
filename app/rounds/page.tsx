import Link from "next/link";
import { getRounds } from "@/lib/api";
import { formatUSD, formatDate } from "@/lib/format";
import Pagination from "@/components/pagination";

interface Props {
  searchParams: Promise<{
    offset?: string;
    sector?: string;
    round_type?: string;
    min_amount?: string;
  }>;
}

export default async function RoundsPage({ searchParams }: Props) {
  const params = await searchParams;
  const offset = parseInt(params.offset || "0");

  const { data: rounds, meta } = await getRounds({
    limit: 50,
    offset,
    sector: params.sector,
    round_type: params.round_type,
    min_amount: params.min_amount ? parseInt(params.min_amount) : undefined,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Funding Rounds</h1>
        <p className="text-sm text-zinc-400">
          {meta.total.toLocaleString()} rounds tracked
        </p>
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        <Link
          href="/rounds"
          className={`rounded-md px-3 py-1.5 ${!params.min_amount ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
        >
          All
        </Link>
        <Link
          href="/rounds?min_amount=1000000"
          className={`rounded-md px-3 py-1.5 ${params.min_amount === "1000000" ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
        >
          $1M+
        </Link>
        <Link
          href="/rounds?min_amount=10000000"
          className={`rounded-md px-3 py-1.5 ${params.min_amount === "10000000" ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
        >
          $10M+
        </Link>
        <Link
          href="/rounds?min_amount=50000000"
          className={`rounded-md px-3 py-1.5 ${params.min_amount === "50000000" ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
        >
          $50M+
        </Link>
      </div>

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
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Investors</th>
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
                    href={`/projects/${r.project.slug}`}
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
                <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">
                  {r.investors.slice(0, 3).map((i, idx) => (
                    <span key={i.id}>
                      <Link href={`/investors/${i.slug}`} className="text-zinc-400 hover:text-zinc-300">
                        {i.name}
                      </Link>
                      {idx < Math.min(r.investors.length, 3) - 1 && ", "}
                    </span>
                  ))}
                  {r.investors.length > 3 && (
                    <span className="text-zinc-500"> +{r.investors.length - 3}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        total={meta.total}
        limit={meta.limit}
        offset={meta.offset}
        hasMore={meta.has_more}
      />
    </div>
  );
}
