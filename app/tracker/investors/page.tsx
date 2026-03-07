import Link from "next/link";
import { getInvestors } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import Pagination from "@/components/pagination";

interface Props {
  searchParams: Promise<{
    offset?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function InvestorsPage({ searchParams }: Props) {
  const params = await searchParams;
  const offset = parseInt(params.offset || "0");
  const sort = params.sort || "rounds_count";

  const { data: investors, meta } = await getInvestors({
    limit: 50,
    offset,
    search: params.search,
    sort,
  });

  const sortLink = (field: string) => {
    const sp = new URLSearchParams();
    sp.set("sort", field);
    if (params.search) sp.set("search", params.search);
    return `/tracker/investors?${sp.toString()}`;
  };

  const sortArrow = (field: string) => (sort === field ? " \u25BC" : "");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Investors</h1>
          <p className="text-sm text-zinc-400">
            {meta.total.toLocaleString()} investors tracked
          </p>
        </div>
        <form className="flex gap-2">
          <input
            type="text"
            name="search"
            placeholder="Search investors..."
            defaultValue={params.search}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
          <input type="hidden" name="sort" value={sort} />
          <button
            type="submit"
            className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">
                <Link href={sortLink("name")}>Name{sortArrow("name")}</Link>
              </th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">
                <Link href={sortLink("rounds_count")}>Rounds{sortArrow("rounds_count")}</Link>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {investors.map((inv) => (
              <tr key={inv.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/tracker/investors/${inv.slug}`}
                    className="font-medium text-white hover:text-blue-400 transition-colors"
                  >
                    {inv.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-mono text-zinc-300">
                  {formatNumber(inv.rounds_count)}
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
