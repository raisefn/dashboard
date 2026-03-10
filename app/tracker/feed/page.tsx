import Link from "next/link";
import { getRounds } from "@/lib/api";
import { formatUSD } from "@/lib/format";
import TrackerComingSoon from "@/components/tracker-coming-soon";

export const revalidate = 60;

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

const sourceColors: Record<string, string> = {
  sec_edgar: "text-sky-400",
  rss_news: "text-pink-400",
  crunchbase: "text-emerald-400",
};

function confidenceDot(confidence: number) {
  if (confidence >= 0.8) return "bg-emerald-400";
  if (confidence >= 0.5) return "bg-yellow-400";
  return "bg-red-400";
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1d ago";
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function FeedPage() {
  let rounds;
  try {
    const res = await getRounds({ limit: 50, sort: "-date" });
    rounds = res.data;
  } catch {
    return <TrackerComingSoon />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Live Feed</h1>
        <p className="text-sm text-zinc-400">
          Most recent funding rounds detected across all sources
        </p>
      </div>

      <div className="space-y-3">
        {rounds.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 transition-colors hover:bg-zinc-900/70"
          >
            {/* Confidence dot */}
            <div
              className={`h-2 w-2 shrink-0 rounded-full ${confidenceDot(r.confidence)}`}
              title={`${Math.round(r.confidence * 100)}% confidence`}
            />

            {/* Project + type */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/tracker/projects/${r.project.slug}`}
                  className="font-medium text-white hover:text-blue-400 transition-colors truncate"
                >
                  {r.project.name}
                </Link>
                {r.round_type && (
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      typeColors[r.round_type] || "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {r.round_type.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              {r.investors.length > 0 && (
                <p className="mt-0.5 text-xs text-zinc-500 truncate">
                  {r.investors
                    .slice(0, 3)
                    .map((i) => i.name)
                    .join(", ")}
                  {r.investors.length > 3 && ` +${r.investors.length - 3}`}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm font-medium text-zinc-200">
                {formatUSD(r.amount_usd)}
              </p>
            </div>

            {/* Source + time */}
            <div className="hidden shrink-0 text-right sm:block">
              <p
                className={`text-xs font-medium ${
                  sourceColors[r.source_type] || "text-zinc-500"
                }`}
              >
                {r.source_type.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-zinc-600">{timeAgo(r.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
