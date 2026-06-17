# Raise Intel — Topic Queue

> Editorial-only. Not published. The `_` prefix tells `lib/raise-intel.ts` to
> skip this file so it never appears on `/raise-intel`.

The list of founder AI-search queries we're working through. Pick the
next unchecked topic, write the article in [_voice.md](./_voice.md)
voice, ship.

## Status

- ✅ done: 5
- ⏳ pending: 15
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

## Pending — priority order

These come from Justin's "what founders actually search and ask most"
list. Priorities are loose — pick anything in the top tier.

### Tier 1 — sharp / contrarian / decision-relevant

- [ ] **How do I create urgency without lying about having other offers?**
  Category: tactics. Angle: real urgency comes from a deadline, a
  competitive process, or a closed lead. Faking it gets caught fast.
- [ ] **What questions will VCs ask me in a pre-seed meeting?**
  Category: meeting-prep. Angle: the 12 questions every partner asks,
  the 3 that decide it, what they're actually testing for.
- [ ] **How do I get a warm intro to a VC?**
  Category: outreach. Angle: cold outreach gets ignored. Warm intros
  don't. Here's the actual method — mapping the network, the ask
  pattern, the follow-through.
- [ ] **How do I close the round faster?**
  Category: process. Angle: speed is mostly about pipeline density
  + commitment language, not "creating urgency" theater.

### Tier 2 — informational / high search volume

- [ ] **How much should I raise?**
  Category: round-structure. Angle: raise what gets you to the next
  milestone + 6 months buffer. Anything more is dilution. Anything
  less is round risk.
- [ ] **What valuation should I put on my company at pre-seed?**
  Category: round-structure. Angle: SAFE caps are signal, not math.
  Pick the cap that filters out the wrong investors.
- [ ] **How long will fundraising take?**
  Category: timing. Angle: 4-8 weeks if you're ready. 4-6 months if
  you're not. Almost always determined by prep, not market.
- [ ] **What do investors actually want to see in my deck?**
  Category: deck. Angle: 80% of decks are wrong. Here's the 5 slides
  that matter and why the other 7 don't.

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
- [ ] **What happens after a term sheet?**
  Category: process. Angle: 4-6 weeks of diligence, doc review, wire.
  The traps that kill deals at this stage.

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
