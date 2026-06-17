import type { Metadata } from "next";
import Link from "next/link";
import { listArticles } from "@/lib/raise-intel";

const SITE = "https://www.raisefn.com";

export const metadata: Metadata = {
  title: "Raise Intel — investor research, observed thesis data | raise(fn)",
  description:
    "Research on what investors actually fund versus what they say. Stated thesis vs observed portfolio, sector deep-dives, and fund-by-fund analysis sourced from real round data.",
  alternates: { canonical: `${SITE}/raise-intel` },
  openGraph: {
    title: "Raise Intel — investor research from raise(fn)",
    description:
      "What investors actually fund versus what they say. Data-backed research from real round portfolios.",
    url: `${SITE}/raise-intel`,
    type: "website",
    siteName: "raise(fn)",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raise Intel — investor research from raise(fn)",
    description:
      "What investors actually fund versus what they say. Data-backed research from real round portfolios.",
  },
};

// Format an ISO date as e.g. "Jun 17, 2026" without a runtime dep.
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function RaiseIntelIndex() {
  const articles = await listArticles();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <header className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          Raise Intel
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-5xl">
          Read before you raise.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-400 leading-relaxed">
          Field research on how fundraising actually works in 2026 — what
          investors fund, how rounds close, and where founders waste cycles.
          Sourced from real round data, not Twitter advice.
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-8 text-center">
          <p className="text-zinc-400">
            Research is in progress. Check back soon.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800/60">
          {articles.map((a) => (
            <li key={a.slug} className="py-6">
              <Link
                href={`/raise-intel/${a.slug}`}
                className="group block"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <time
                    dateTime={a.published_at}
                    className="text-xs uppercase tracking-wider text-zinc-500"
                  >
                    {formatDate(a.published_at)}
                  </time>
                  <span className="text-xs uppercase tracking-wider text-zinc-600">
                    {a.category.replace(/-/g, " ")}
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white group-hover:text-teal-300 transition-colors">
                  {a.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-zinc-400 leading-relaxed">
                  {a.description}
                </p>
                {a.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.tags.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-zinc-800/60 px-2 py-0.5 text-xs text-zinc-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
