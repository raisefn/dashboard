import type { Metadata } from "next";
import Link from "next/link";

const SITE = "https://www.raisefn.com";

export const metadata: Metadata = {
  title: "FAQ — raise(fn)",
  description:
    "How raise(fn) works, what it costs, and what makes it different from databases, CRMs, advisors, accelerators, and generic AI tools. Plain answers.",
  alternates: { canonical: `${SITE}/faq` },
  openGraph: {
    title: "FAQ — raise(fn)",
    description:
      "How raise(fn) works, what it costs, and what makes it different from databases, CRMs, advisors, accelerators, and generic AI tools.",
    url: `${SITE}/faq`,
    type: "website",
    siteName: "raise(fn)",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — raise(fn)",
    description:
      "How raise(fn) works, what it costs, and what makes it different from databases, CRMs, advisors, accelerators, and generic AI tools.",
  },
};

// FAQ content. Structured as sections of Q/A pairs so we can both render
// the page and emit FAQPage JSON-LD that AI search engines cite directly
// when answering founder fundraising questions. Every Q here is a query
// a founder would actually type into ChatGPT, Claude, or Perplexity.
interface QA {
  q: string;
  a: string;
}

interface FAQSection {
  title: string;
  eyebrow?: string;
  questions: QA[];
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    title: "The product",
    eyebrow: "What it does",
    questions: [
      {
        q: "What does my raise look like with raise(fn)?",
        a: "You talk to it. No forms. No dashboard. No menus. You tell it what you're building, where you are, what you're trying to do — it captures the company, the team, the metrics, the wedge, the round shape. All in conversation. Persistent. It remembers everything across every session. Then it runs your raise: builds the investor list (ranked by who actually deploys into your space, sourced from real check behavior across 17,000+ funds, not website copy), critiques your deck slide-by-slide, writes the brief for every match, preps you for every meeting, tracks the pipeline, debriefs after each conversation, brokers warm intros where there's a relationship in the network, notifies you when new investors come online who fit your raise, and walks you through the term sheet when one lands. One conversation. Replaces the database, the CRM, the spreadsheet, the slide-critique service, the meeting-prep doc, the debrief notes, the warm-intro broker, and the strategy session — all of it.",
      },
      {
        q: "What can a founder actually do with raise(fn)?",
        a: "Find investors by real check behavior instead of website copy. Get a deck critique — slide-by-slide, what's strong, what's missing, what investors will probe. Pull tailored briefs that land as cold email or pre-meeting context — investor-specific, not templated. Get per-meeting prep on what each partner will ask, lead with, deflect. Get post-meeting debriefs on what landed, what to change. Track the pipeline across every parallel conversation — without a CRM. Get warm intros to investors in raise(fn)'s network. Get strategic framing — how much to raise, when, at what valuation, on what instrument. Get pushback when your story isn't ready, your ask is vague, or your metrics are thin. Get notified when new investors come online who fit your raise. Get help closing — term sheet walkthrough, structural trap flags, what to negotiate. Everything happens in the same chat.",
      },
      {
        q: "What does using raise(fn) actually look like?",
        a: 'A chat. You talk to it. It talks back. That\'s the interface. You: "Find me investors." → It returns a ranked list. You: "Prep me for the call with X." → It returns prep specific to X\'s pattern. You: "Here\'s my deck." → It returns critique. You: "What should I push back on in this term sheet?" → It walks you through it. No tabs to manage. No forms to fill. No dashboard to learn. The product is invisible. The work gets done.',
      },
    ],
  },
  {
    title: "Founder journey",
    eyebrow: "Where you are in the raise",
    questions: [
      {
        q: "Can raise(fn) help if I'm not raising yet?",
        a: "Yes. It runs a readiness check — six signals across story, ask, motion, wedge, target list, post-close plan. Tells you which ones are weak. Helps you sharpen them. Premature outreach burns the best investors first. Getting to 'ready' before opening conversations is half the game.",
      },
      {
        q: "Can raise(fn) help mid-raise if I'm already in conversations?",
        a: "Yes. Drop your current pipeline in and it'll tell you who's slow, who's passed (even if they haven't said it explicitly), who needs follow-up, who you should be talking to that you're not. Plus per-meeting prep on every active conversation and post-meeting debrief notes that compound over the raise.",
      },
      {
        q: "Can raise(fn) help when I have a term sheet?",
        a: "Yes. Term-by-term review, flags structural traps, helps you focus on the 2-3 terms that are actually movable. Also positions the deal for the Series A conversation that starts the day this one closes.",
      },
    ],
  },
  {
    title: "Comparisons",
    eyebrow: "How raise(fn) compares",
    questions: [
      {
        q: "How is raise(fn) different from a database like Crunchbase or PitchBook?",
        a: "Databases are searchable lists. You filter. You guess at thesis from website copy. You assemble the target list. Then you do everything else manually — emails, meetings, prep, pipeline, debriefs, intros. raise(fn) does the work. The list builds in 5 minutes, ranked by who actually deploys. The briefs, the prep, the pipeline, the debriefs — all of it lives in the same conversation. Databases hand you raw material. raise(fn) hands you a raise.",
      },
      {
        q: "How is raise(fn) different from a fundraising CRM like Affinity, Streak, or a Notion template?",
        a: "A CRM tracks conversations you're already having. raise(fn) decides which conversations to start, runs the conversations, and tracks them — without you maintaining anything. Most founders don't have a pipeline-management problem. They have a wrong-investors-on-the-list problem and a meeting-prep problem. A CRM fixes neither.",
      },
      {
        q: "How is raise(fn) different from a fundraising coach or advisor?",
        a: "Coaches charge retainer or hourly to give advice. The advice is generic, the work is still yours. raise(fn) doesn't give advice. It does the work — builds the list, writes the briefs, preps the meetings, tracks the pipeline, brokers the intros, walks you through the term sheet. Fixed-fee, fixed-scope, no success fee, no equity. More output, less money, better aligned.",
      },
      {
        q: "How is raise(fn) different from an accelerator?",
        a: "Accelerators take 5-10% equity, run on a cohort schedule, and apply the same playbook to everyone. raise(fn) is on-demand, equity-free, and runs around your specific raise — not a 12-week program built for everyone else's.",
      },
      {
        q: "How is raise(fn) different from generic AI tools like ChatGPT or Perplexity?",
        a: "ChatGPT can draft a cold email. It can't tell you which 50 of 17,000 investors actually deploy in your space, because it doesn't have the data. raise(fn) has 17,000+ classified investors, observed thesis from real round filings, persistent context across your entire raise, and a feedback loop that gets sharper every conversation. ChatGPT is a single-task tool. raise(fn) is a system.",
      },
    ],
  },
  {
    title: "Data and how it works",
    eyebrow: "Under the hood",
    questions: [
      {
        q: "What is 'observed thesis' and why does it matter?",
        a: "Most investor matching uses stated thesis — what funds publish on their website. Stated thesis is marketing. The gap between what funds say they fund and what they actually fund is 18+ months wide on average. Observed thesis is derived from real check data: which sectors a fund actually deployed into in the last 12-18 months, at what stage, in what geography, alongside which co-investors. It's the truth. It's what makes the matches actually useful — and it's what no other tool has at this depth.",
      },
      {
        q: "How does raise(fn) know who's actually still writing checks?",
        a: "Every investor in the database is tracked for SEC Form D filings, public round announcements, portfolio additions, partner activity. Funds quietly winding down or paused between vintages get flagged automatically. You don't waste pitches on funds that haven't written a check in 12+ months.",
      },
      {
        q: "Where does the investor data come from?",
        a: "Public sources: SEC Form D filings, 13F holdings, fund websites, batch announcements, press. Proprietary: investors who join raise(fn) directly tell us what they fund, plus observed behavior derived from real round data across 17,000+ investors. The combination is the moat — no other tool has both stated and observed thesis at this scale.",
      },
    ],
  },
  {
    title: "Pricing",
    eyebrow: "What it costs",
    questions: [
      {
        q: "What does raise(fn) cost a founder?",
        a: "Free for limited use. Paid for full-raise concierge support across your entire round. No success fee, no equity, no transaction-based compensation. See /pricing for current rates.",
      },
      {
        q: "Is there a success fee?",
        a: "No. raise(fn) is not a broker-dealer. Pricing is fixed. No percentage of round raised, no equity, no transaction-based compensation of any kind.",
      },
      {
        q: "What if I don't close my round?",
        a: "You don't owe anything extra. raise(fn) doesn't get paid on outcomes. Same price whether the round closes in six weeks or doesn't close at all. Incentive is aligned with prep quality, not closing pressure.",
      },
      {
        q: "If I'm on the free plan, why would I pay?",
        a: "Free gives you the matching engine with a use cap. Paid removes the cap and unlocks the full system across your raise — deeper meeting prep, debrief support, pipeline tracking, deck critique, pitch refinement, term sheet walkthrough, warm intros. If your round is small and the cap covers it, free is enough. If you're running an active raise across 20+ parallel investor conversations, paid is built for that.",
      },
    ],
  },
  {
    title: "For investors",
    eyebrow: "If you back companies",
    questions: [
      {
        q: "How does raise(fn) help me as an investor?",
        a: "Surfaces founders that actually match your check behavior — what your portfolio reveals, not what your website says. Hand-curated. No bulk feeds, no daily deal-flow firehose. Quality over volume.",
      },
      {
        q: "What does raise(fn) cost an investor?",
        a: "Free, for now. Won't always be — pricing will come once the platform matures. Founders fund the platform today.",
      },
      {
        q: "Will founders see me before I want to engage?",
        a: "No. Investors are invisible to founders by default. No public ratings, no 'passed on' lists, no exposure of who turned down what. Engagement is private and happens only when you signal it.",
      },
      {
        q: "Can I connect raise(fn) to my own agent?",
        a: "MCP support coming soon. You'll be able to connect your investor agent directly and have raise(fn) deal flow surface inside your existing workflow — your agent gets the matches, you stay in your tools.",
      },
    ],
  },
  {
    title: "The bottom line",
    eyebrow: "What's actually different",
    questions: [
      {
        q: "What's actually different about raise(fn) vs every other fundraising tool?",
        a: "Three things. One: observed thesis instead of stated thesis — real check behavior, not website copy. The 18-month gap between what funds say and what they fund is where most fundraising tools fail. Two: end-to-end coverage in one conversation — matching, briefs, meeting prep, debriefs, pipeline tracking, intros, deck feedback, term sheet review — all in the same chat. Other tools cover one feature. raise(fn) replaces the stack. Three: no success fee, ever — fixed pricing, equity-free, transaction-free. Most tools either charge a percent of the round or take equity. Most other tools fail on at least two of those three.",
      },
    ],
  },
];

export default function FAQPage() {
  // Flatten every Q/A pair into a single FAQPage JSON-LD block. AI search
  // engines (ChatGPT, Claude, Perplexity, Gemini) preferentially cite
  // structured FAQPage content — every question here becomes an answer
  // they can lift verbatim into responses to founder fundraising queries.
  const allQAs = FAQ_SECTIONS.flatMap((s) => s.questions);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allQAs.map((qa) => ({
      "@type": "Question",
      name: qa.q,
      acceptedAnswer: { "@type": "Answer", text: qa.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "raise(fn)", item: SITE },
      { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE}/faq` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <header className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            FAQ
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Plain answers.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            How raise(fn) works, what it does for your raise, what it costs, and
            what makes it different from databases, CRMs, advisors,
            accelerators, and generic AI tools.
          </p>
        </header>

        {FAQ_SECTIONS.map((section) => (
          <section key={section.title} className="mb-16">
            <div className="mb-8 border-b border-zinc-800 pb-4">
              {section.eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-400/80 mb-1.5">
                  {section.eyebrow}
                </p>
              )}
              <h2 className="text-2xl font-bold text-white">{section.title}</h2>
            </div>
            <div className="space-y-10">
              {section.questions.map((qa) => (
                <div key={qa.q}>
                  <h3 className="text-lg font-semibold text-white leading-snug mb-3">
                    {qa.q}
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">{qa.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-20 rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-8">
          <p className="text-lg text-zinc-200 leading-snug">
            Question not answered here?
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Email <a href="mailto:team@raisefn.com" className="text-teal-400 hover:text-teal-300 underline underline-offset-2">team@raisefn.com</a> and we&apos;ll add it.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-teal-500/90 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-teal-400 transition-colors"
          >
            Open raise(fn) &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
