import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticleBySlug, listArticles, extractFaqs } from "@/lib/raise-intel";

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE = "https://www.raisefn.com";

export async function generateStaticParams() {
  const articles = await listArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "published") {
    return {
      title: "Article not found | Raise Intel",
      description: "This article doesn't exist or hasn't been published yet.",
      robots: { index: false },
    };
  }
  const url = `${SITE}/raise-intel/${slug}`;
  return {
    title: `${article.title} | Raise Intel`,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      siteName: "raise(fn)",
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function RaiseIntelArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "published") notFound();

  // JSON-LD Article schema — gives Google a clean signal that this is
  // editorial research content. Organization publisher reinforces the
  // brand entity. mainEntityOfPage closes the loop so Google associates
  // the article with this exact URL.
  const url = `${SITE}/raise-intel/${slug}`;
  const articleSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.published_at,
    ...(article.updated_at && { dateModified: article.updated_at }),
    author: { "@type": "Organization", name: "raise(fn)" },
    publisher: {
      "@type": "Organization",
      name: "raise(fn)",
      url: SITE,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: article.tags.join(", "),
  };

  // FAQPage schema — AI search engines (ChatGPT, Claude, Perplexity,
  // Gemini) preferentially cite structured Q&A pairs in their answers.
  // We extract from the body markdown so there's a single source of
  // truth and the FAQ renders inline in the article too.
  const faqs = extractFaqs(article.body);
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <article className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href="/raise-intel"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          &larr; Raise Intel
        </Link>

        <header className="mt-6 mb-10">
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-zinc-500">
            <time dateTime={article.published_at}>
              {formatDate(article.published_at)}
            </time>
            <span className="text-zinc-700">·</span>
            <span>{article.category.replace(/-/g, " ")}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl leading-tight">
            {article.title}
          </h1>
          {article.tldr && (
            <div className="mt-6 rounded-lg border border-teal-400/30 bg-teal-400/5 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1.5">
                Short answer
              </p>
              <p className="text-zinc-100 leading-relaxed">{article.tldr}</p>
            </div>
          )}
          {article.hero_stat && !article.tldr && (
            <div className="mt-6 rounded-lg border-l-4 border-teal-400 bg-zinc-900/40 px-5 py-4">
              <p className="text-lg text-zinc-200 leading-snug">
                {article.hero_stat}
              </p>
            </div>
          )}
        </header>

        {/* Article body — react-markdown + remark-gfm for tables, task lists,
           strikethrough, autolinks. Custom components add tailwind styles and
           open external links safely. Internal `/tracker/...` links stay as
           Next Link so client-side nav works. */}
        <div className="raise-intel-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="mt-12 mb-4 text-3xl font-bold text-white">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-10 mb-3 text-2xl font-semibold text-white">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 mb-2 text-xl font-semibold text-zinc-100">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="my-4 text-zinc-300 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="my-4 list-disc space-y-1.5 pl-6 text-zinc-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="my-4 list-decimal space-y-1.5 pl-6 text-zinc-300">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-6 border-l-4 border-zinc-700 pl-4 italic text-zinc-400">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => {
                if (!href) return <span>{children}</span>;
                const isInternal = href.startsWith("/") || href.startsWith("#");
                if (isInternal) {
                  return (
                    <Link
                      href={href}
                      className="text-teal-400 hover:text-teal-300 underline underline-offset-2"
                    >
                      {children}
                    </Link>
                  );
                }
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 underline underline-offset-2"
                  >
                    {children}
                  </a>
                );
              },
              table: ({ children }) => (
                <div className="my-6 overflow-x-auto rounded-lg border border-zinc-800">
                  <table className="w-full text-sm">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="border-b border-zinc-800 bg-zinc-900/50">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-zinc-800/50">{children}</tbody>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 text-left font-medium text-zinc-400">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-zinc-300">{children}</td>
              ),
              code: ({ children }) => (
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm text-teal-300 font-mono">
                  {children}
                </code>
              ),
              hr: () => <hr className="my-10 border-zinc-800" />,
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),
            }}
          >
            {article.body}
          </ReactMarkdown>
        </div>

        {(article.cta_text || article.cta_href) && (
          <div className="mt-16 rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-8">
            <p className="text-lg text-zinc-200 leading-snug">
              {article.cta_text ||
                "Find investors who actually fund what you're building."}
            </p>
            <Link
              href={article.cta_href || "/signup"}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-teal-500/90 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-teal-400 transition-colors"
            >
              Try raise(fn) free &rarr;
            </Link>
          </div>
        )}

        {(article.fund_slugs.length > 0 || article.sector_slugs.length > 0) && (
          <div className="mt-12 border-t border-zinc-800 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Referenced in this article
            </p>
            <div className="flex flex-wrap gap-2">
              {article.fund_slugs.map((s) => (
                <Link
                  key={`fund-${s}`}
                  href={`/tracker/investors/${s}`}
                  className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                >
                  {s.replace(/-/g, " ")}
                </Link>
              ))}
              {article.sector_slugs.map((s) => (
                <Link
                  key={`sector-${s}`}
                  href={`/tracker/sectors/${s}`}
                  className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                >
                  {s.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
