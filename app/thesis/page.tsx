"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    type: "cover" as const,
    text: "The why.",
  },
  {
    type: "text" as const,
    text: "Hi, I'm Justin. Of the 3 companies I've started: 1 failure, 1 exit, 1 TBD. 2 have raised capital. This one is for every founder who has to.",
  },
  {
    type: "text" as const,
    text: "From February 2021 to April 2022, we raised over $21M for my last startup, Torre.ai.",
  },
  {
    type: "stats" as const,
    text: "1,128 first meetings with investors\n4.7 first meetings per day on average\n24 investor checks\n2.1% conversion rate",
  },
  {
    type: "text" as const,
    text: "Brutal. I didn't know who to approach, how to pitch, how to build the narrative, how to create urgency, if the terms were right, or how to get warm intros. I was completely blind \u2014 and so is almost every founder who raises.",
  },
  {
    type: "text" as const,
    text: "Last year founders raised $425 billion across more than 24,000 deals. AI is about to displace millions of jobs \u2014 many of those people will become founders. The number of first-time raises is about to explode. And most of them will have no idea what they're doing.",
  },
  {
    type: "text" as const,
    text: "Investors have deal flow tools, databases, networks, and analysts. Founders have spreadsheets and gut feel.",
  },
  {
    type: "text" as const,
    text: "That asymmetry isn't an accident. Investors know the market rate on terms \u2014 founders don't. Investors know they passed on the last 15 similar deals \u2014 founders don't. Investors know what actually works \u2014 founders don't. The entire system runs on one side having more information than the other.",
  },
  {
    type: "text" as const,
    text: "The data from every raise exists. Who invests, at what terms, what they care about, how fast they move. But it's trapped inside hundreds of separate CRMs that never talk to each other.",
  },
  {
    type: "text" as const,
    text: "When a round closes, the investor keeps everything \u2014 the patterns, the comps, the signals. The founder walks away with nothing they can pass on \u2014 not even for their own next round. The knowledge doesn't die. It just stays on one side of the table.",
  },
  {
    type: "text" as const,
    text: "What if every founder's raise made the next founder's raise smarter? What if the knowledge from 1,000 raises was available to founder number 1,001?",
  },
  {
    type: "text" as const,
    text: "So I built raisefn. It's an AI fundraising advisor that learns from every raise. You talk to it, it remembers everything, and it gets smarter with every founder who uses it.",
  },
  {
    type: "text" as const,
    text: "After 50 raises, raisefn knows Investor X only writes checks after a third meeting. After 500, it knows which investors quietly co-invest together and which ones kill deals when they're both on the cap table. After 5,000, it knows more about the fundraising market than any human alive.",
  },
  {
    type: "text" as const,
    text: "Founders come for the intelligence. Investors come for the deal flow. The more founders raise through raisefn, the more investors need to be there. The more investors on the platform, the more valuable it is for founders. Both sides compound.",
  },
  {
    type: "text" as const,
    text: "The entire fundraising market is going AI-native. That's not a prediction \u2014 every major fund is already there. But AI is only as good as the data it runs on, and the real data from real raises doesn't exist in any system today. Whoever captures it first owns it permanently.",
  },
  {
    type: "text" as const,
    text: "Every founder and every investor will have an AI agent. Every one of those agents will need the most up-to-date intelligence on what's actually happening in the market. When that happens, it'll run on the intelligence we're building right now.",
  },
];

function DownArrow() {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-50">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-600"
      >
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    </div>
  );
}

export default function ThesisPage() {
  const [visible, setVisible] = useState<Set<number>>(new Set());
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-idx"));
          if (entry.isIntersecting) {
            setVisible((prev) => new Set(prev).add(idx));
            setCurrentIdx(idx);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll("[data-idx]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-zinc-950" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      {slides.map((slide, i) => (
        <section
          key={i}
          data-idx={i}
          className="relative min-h-screen flex items-center justify-center px-6 md:px-12"
        >
          <div
            className="max-w-3xl"
          >
            {slide.type === "cover" ? (
              <div className="text-center">
                <div className="text-5xl md:text-7xl font-bold mb-6">
                  <span className="text-orange-500">raise</span>
                  <span className="text-teal-400">(fn)</span>
                </div>
                <p className="text-2xl md:text-3xl text-zinc-300 font-normal">
                  {slide.text}
                </p>
              </div>
            ) : slide.type === "stats" ? (
              <div className="space-y-2">
                {slide.text.split("\n").map((line, j) => (
                  <p
                    key={j}
                    className="text-2xl md:text-4xl text-zinc-200 font-normal leading-relaxed"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-2xl md:text-4xl text-zinc-200 font-normal leading-relaxed">
                {slide.text}
              </p>
            )}
          </div>

        </section>
      ))}

      {currentIdx < slides.length - 1 && <DownArrow />}

      {/* Final CTA */}
      <section className="min-h-[50vh] flex items-center justify-center px-6">
        <div className="text-center">
          <a
            href="https://raisefn.com"
            className="text-lg text-teal-400 hover:text-teal-300 transition-colors"
          >
            raisefn.com
          </a>
          <p className="mt-2 text-sm text-zinc-600">justin@raisefn.com</p>
        </div>
      </section>
    </div>
  );
}
