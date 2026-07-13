# Raise Intel — Topic Queue

> Editorial-only. Not published. The `_` prefix tells `lib/raise-intel.ts` to
> skip this file so it never appears on `/raise-intel`.

The list of founder AI-search queries we're working through. Pick the
next unchecked topic, write the article in [_voice.md](./_voice.md)
voice, ship.

## Status

- ✅ done: 12
- ⏳ pending: 9
- 🎯 cadence target: daily (~1/day)

## Workflow

1. Pick the highest-priority unchecked topic (or any unchecked one if
   priority feels arbitrary)
2. Write the article using [_template.md](./_template.md) as a starting
   point and [_voice.md](./_voice.md) for register
3. Add 3 `related_slugs` (cross-links into the cluster)
4. Add 2-3 in-body cross-article links where natural
5. Ship via commit + push
6. Check the box here

## Published

- [x] **Am I ready to raise — or should I wait?**
  → [/raise-intel/am-i-ready-to-raise](/raise-intel/am-i-ready-to-raise)
- [x] **How do I find investors who actually invest in my space?**
  → [/raise-intel/how-to-find-investors-who-invest-in-my-space](/raise-intel/how-to-find-investors-who-invest-in-my-space)
- [x] **How do I write a cold email to a VC that actually works?**
  → [/raise-intel/how-do-i-write-a-cold-email-to-a-vc](/raise-intel/how-do-i-write-a-cold-email-to-a-vc)
- [x] **Who is actually writing checks right now?**
  → [/raise-intel/who-is-actually-writing-checks-right-now](/raise-intel/who-is-actually-writing-checks-right-now)
- [x] **How do I know if a VC passed — or is just slow?**
  → [/raise-intel/how-do-i-know-if-a-vc-passed-or-is-just-slow](/raise-intel/how-do-i-know-if-a-vc-passed-or-is-just-slow)
- [x] **How do I create urgency without lying about having other offers?**
  → [/raise-intel/how-do-i-create-urgency-without-lying](/raise-intel/how-do-i-create-urgency-without-lying)
- [x] **How do I close the round faster?**
  → [/raise-intel/how-do-i-close-the-round-faster](/raise-intel/how-do-i-close-the-round-faster)
- [x] **Can AI raise money for me?** ✅ published 2026-06-30
  → [/raise-intel/can-ai-raise-money-for-me](/raise-intel/can-ai-raise-money-for-me)

## Pending — priority order

These come from Justin's "what founders actually search and ask most"
list. Priorities are loose — pick anything in the top tier.

### Tier 1 — sharp / contrarian / decision-relevant
- [x] **What questions will VCs ask me in a pre-seed meeting?** ✅ published 2026-06-19
  → [/raise-intel/what-questions-will-vcs-ask-me-in-a-pre-seed-meeting](/raise-intel/what-questions-will-vcs-ask-me-in-a-pre-seed-meeting)
- [x] **How do I get a warm intro to a VC?** ✅ published 2026-06-18
  → [/raise-intel/how-do-i-get-a-warm-intro-to-a-vc](/raise-intel/how-do-i-get-a-warm-intro-to-a-vc)
### Tier 2 — informational / high search volume

- [x] **How much should I raise?** ✅ published 2026-07-06
  → [/raise-intel/how-much-should-i-raise](/raise-intel/how-much-should-i-raise)
- [x] **What valuation should I put on my company at pre-seed?** ✅ published 2026-07-13
  → [/raise-intel/what-valuation-should-i-put-on-my-company-at-pre-seed](/raise-intel/what-valuation-should-i-put-on-my-company-at-pre-seed)
- [x] **How long will fundraising take?** ✅ published 2026-07-06
  → [/raise-intel/how-long-will-fundraising-take](/raise-intel/how-long-will-fundraising-take)
- [x] **What do investors actually want to see in my deck?** ✅ published 2026-07-13
  → [/raise-intel/what-do-investors-actually-want-to-see-in-my-deck](/raise-intel/what-do-investors-actually-want-to-see-in-my-deck)

### Tier 3 — tactical / process

- [ ] **What are standard SAFE terms in 2026?**
  Category: terms. Angle: most "standard" SAFE terms have drifted in
  the last 18 months. Here's what to push back on.
- [ ] **Should I take angel money or go straight to VCs?**
  Category: round-structure. Angle: not either/or. The right answer
  is usually "angels first, VCs second."
- [ ] **How do I run multiple investor conversations at once?**
  Category: process. Angle: parallelism is the unlock. Sequential
  pitching costs you weeks.
- [ ] **What metrics do I need at my stage?**
  Category: metrics. Angle: slope beats level. Investors fund lines,
  not points.
- [ ] **How do I follow up with a VC without being annoying?**
  Category: outreach. Angle: most "annoying" follow-up is just bad
  follow-up. Here's the cadence that works.
- [ ] **How do I negotiate terms with a VC?**
  Category: terms. Angle: most terms aren't really negotiable. Pick
  the 2-3 that are and push hard there. Concede the rest.
- [x] **What happens after a term sheet?** ✅ published 2026-07-13
  → [/raise-intel/what-happens-after-a-term-sheet](/raise-intel/what-happens-after-a-term-sheet)

## Cross-link plan

When writing each new article, link to at least 2 of:

- The closest topical neighbor (e.g. "valuation" article → "how much
  should I raise")
- One of the foundational five (above)
- A different category (e.g. an outreach piece linking to a metrics
  piece) — wider cluster

Add the cross-link both in-body (where natural) and in `related_slugs`
frontmatter. The Related research block at the bottom of every article
will render them automatically.

## When the queue gets low

Re-read Justin's original list, scan the recent fundraising Twitter /
substack discourse for new common questions, ask ChatGPT/Claude/
Perplexity directly: "what are founders asking about fundraising right
now?" Add to Tier 1/2/3 above.

Target queue depth: at least 15 unchecked at any time. Replenish when
we drop below 10.
