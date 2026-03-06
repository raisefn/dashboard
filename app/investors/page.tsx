import Link from "next/link";
import { getInvestors } from "@/lib/api";
import Pagination from "@/components/pagination";

interface Props {
  searchParams: Promise<{
    offset?: string;
    search?: string;
    type?: string;
  }>;
}

export default async function InvestorsPage({ searchParams }: Props) {
  const params = await searchParams;
  const offset = parseInt(params.offset || "0");

  const { data: investors, meta } = await getInvestors({
    limit: 50,
    offset,
    search: params.search,
    type: params.type,
  });

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
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Name</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Type</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Location</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Website</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {investors.map((inv) => (
              <tr key={inv.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/investors/${inv.slug}`}
                    className="font-medium text-white hover:text-blue-400 transition-colors"
                  >
                    {inv.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {inv.type && (
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs">
                      {inv.type}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-400">{inv.hq_location || "—"}</td>
                <td className="px-4 py-3">
                  {inv.website && (
                    <a href={inv.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs">
                      {inv.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
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
