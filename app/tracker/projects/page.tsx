import Link from "next/link";
import { getProjects } from "@/lib/api";
import { formatUSD, formatNumber } from "@/lib/format";
import Pagination from "@/components/pagination";
import TrackerComingSoon from "@/components/tracker-coming-soon";

interface Props {
  searchParams: Promise<{
    sort?: string;
    search?: string;
    sector?: string;
    offset?: string;
  }>;
}

/** Pick the single most impressive metric for a project. */
function highlight(p: { tvl: number | null; market_cap: number | null; github_stars: number | null; twitter_followers: number | null }) {
  if (p.tvl) return { label: "TVL", value: formatUSD(p.tvl) };
  if (p.market_cap) return { label: "Mkt Cap", value: formatUSD(p.market_cap) };
  if (p.github_stars) return { label: "Stars", value: formatNumber(p.github_stars) };
  if (p.twitter_followers) return { label: "Followers", value: formatNumber(p.twitter_followers) };
  return null;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const params = await searchParams;
  const offset = parseInt(params.offset || "0");
  const sort = params.sort || "last_enriched_at";

  let projects, meta;
  try {
    const res = await getProjects({
      limit: 50,
      offset,
      sort,
      search: params.search,
      sector: params.sector,
    });
    projects = res.data;
    meta = res.meta;
  } catch {
    return <TrackerComingSoon />;
  }

  const sortLink = (field: string) => {
    const sp = new URLSearchParams();
    sp.set("sort", field);
    if (params.search) sp.set("search", params.search);
    if (params.sector) sp.set("sector", params.sector);
    return `/tracker/projects?${sp.toString()}`;
  };

  const sortArrow = (field: string) => (sort === field ? " ▼" : "");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-zinc-400">
            {meta.total.toLocaleString()} projects tracked
          </p>
        </div>
        <form action="/tracker/projects" className="flex gap-2">
          <input
            type="text"
            name="search"
            placeholder="Search projects..."
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
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Sector</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Highlight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {projects.map((p) => {
              const h = highlight(p);
              return (
                <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/tracker/projects/${p.slug}`}
                      className="font-medium text-white hover:text-blue-400 transition-colors"
                    >
                      {p.name}
                    </Link>
                    {p.token_symbol && (
                      <span className="ml-2 text-xs text-zinc-500">{p.token_symbol}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {p.sector && (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs">
                        {p.sector}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      p.status === "active"
                        ? "bg-emerald-900/50 text-emerald-300"
                        : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {h ? (
                      <span className="text-zinc-300 font-mono text-xs">
                        <span className="text-zinc-500 mr-1">{h.label}</span>
                        {h.value}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
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
