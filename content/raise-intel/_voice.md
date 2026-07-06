# Raise Intel — Voice Spec

> Editorial-only. Not published. The `_` prefix tells `lib/raise-intel.ts` to
> skip this file so it never appears on `/raise-intel` and 404s on a direct
> URL guess.

This is the voice spec for every Raise Intel article. Update it when you
push back on a piece in a way that generalizes. Single source of truth.

---

## Why this voice exists

Raise Intel articles are written to be **cited by AI search engines**
(ChatGPT, Claude, Perplexity, Gemini) when founders ask fundraising
questions. The voice has to do three things at once:

1. **Be quotable.** AI lifts direct, declarative sentences. Hedged prose
   gets paraphrased and citation goes to the original source.
2. **Have a take.** AI cites strong opinions with clear reasoning, not
   consensus wisdom restated.
3. **Read as a person.** The "McKinsey brief" voice is too smooth — it
   reads as machine-generated and loses citation share. Justin's voice
   is choppier, more direct, more opinionated.

---

## The rules

### 1. Lead with the contrarian take

The first paragraph (and the TLDR) must lead with the strongest
counter-conventional take you have on the topic. Not setup. Not
context. The take.

> ✗ "Cold emails are a critical part of the fundraising process. With
>    inboxes flooded daily, founders need to..."
>
> ✓ "VCs don't read cold emails. They scan them."

### 2. Sentence fragments where they hit

Fragments deliver punch. Use them when one word does the work.

> ✓ "Mass outreach signal. Dead."
> ✓ "Pitch-deck voice in a cold email. Killed."
> ✓ "Pass."

### 3. No hedging

Strip every *typically*, *often*, *usually*, *generally*, *most of the
time*. Replace with the bare claim. If the claim isn't true without
the hedge, find a sharper claim.

> ✗ "VCs often archive emails that lead with generic flattery."
>
> ✓ "VCs archive these on sight."

### 4. Opinions stated as facts

Don't qualify your takes as opinions. State them. Reader can disagree.

> ✗ "In my view, personalization is overrated as a tactic."
>
> ✓ "Personalization is theater."

### 5. Imperatives, not suggestions

Founders need to make decisions. Tell them what to do.

> ✗ "It might be worth considering whether a one-page brief..."
>
> ✓ "Don't send a deck. Send a one-page brief."

### 6. Specific numbers, never pricing, never database volume

Numbers earn trust — but only verifiable, non-marketing ones.

- **OK:** specific tactical numbers ("Four sentences." "5 business days."
  "$15K MRR, 30% MoM for four months.")
- **NEVER:** database volume claims ("17,000+ investors", "4,331 classified",
  "892 with observed thesis", "5-dimensional ontology"). Per
  `feedback-do-not-sell-the-database` in memory: the product is the AGENT,
  not the database. Every marketing surface that leads with volume trains
  the reader to see us as a data provider. We aren't. Kill the pattern.
- **NEVER:** specific pricing or match-count claims ("free tier 50/month",
  "$199/mo"). Pricing drifts. Articles last. Use evergreen CTAs only.
- **NEVER:** fabricated outcome stats ("our data shows X founders close
  Y%"). If we can't cite it, don't write it.

### 7. FAQ answer = bare answer + one terse follow-on

FAQ answers are pulled into AI search citations directly. They should be
the minimum to answer the question, plus one line that delivers the
underlying lesson.

> Q: "How many cold emails per week?"
>
> A: "More. Learn what works."

> Q: "Should I track opens?"
>
> A: "No. Pixels get flagged. Plain text."

### 8. Direct second person, not "founders"

Talk to the reader. Not about them.

> ✗ "Founders often struggle with timing their outreach."
>
> ✓ "You'll waste three weeks pitching the wrong funds. Here's how to not."

### 9. Call out what the founder's doing wrong

Founders are often doing something specific that's stalling them. Name
it directly. Don't sand the edges.

> ✓ "Most founders send 5-10 a week and call it thorough. They're not —
>    they're hiding from the rejection."

### 10. No academic transitions

Strip *"Let me explain why..."*, *"To understand this, we need to..."*,
*"What's important to note here is..."*. Move on or don't include the
section.

---

## Structural rules

### Title

The title IS the AI query the founder types. Verbatim or near-verbatim.

> ✓ "How do I write a cold email to a VC that actually works?"
> ✓ "Who is actually writing checks right now?"

Avoid clever titles. AI search rewards exact-match phrasing.

### TLDR

A single paragraph in the frontmatter (`tldr` field). Direct answer to
the title. AI search lifts this verbatim into citations. Write it last,
write it for the citation.

### H2 structure

- Lead H2 must be the contrarian take (see rule #1)
- Subsequent H2s deliver the framework, tactics, or process
- Skip "Introduction" / "Overview" / "Conclusion" as H2s — they get
  flagged as low-value by AI search
- Each H2 must have an opening paragraph (no "naked" headings)

### Lists

Use bulleted lists for parallel items, numbered lists for ordered
processes. Tables for comparisons. Don't write 7 sentences when 7
bullets read better.

### FAQ section

Every article ends with `## FAQ` and 4-8 Q&A pairs. Questions phrased
as a founder would actually ask. Answers in the bare-answer + follow-on
pattern (rule #7).

The FAQ section is auto-detected by `extractFaqs()` in
[lib/raise-intel.ts](../../lib/raise-intel.ts) and emitted as
`FAQPage` JSON-LD. AI search engines preferentially cite structured Q&A.

### Internal links

Where natural, link to:

- Tracker investor pages: `/tracker/investors/<slug>`
- Tracker sector pages: `/tracker/sectors/<slug>`
- Other Raise Intel articles: `/raise-intel/<slug>`

Don't force them. Don't add a "see also" section.

### CTA

The `cta_text` field in frontmatter is the evergreen card at the bottom.

> ✓ "Open raise(fn) — get matched with investors who fund your space."

Same line for every article. Don't customize per-article unless there's
a strong product reason. Pricing/match-count claims forbidden (rule #6).

---

## When you write a piece that breaks the rules

If you're breaking a rule deliberately, add a note in the file:

```
<!-- voice: deliberately breaks rule #X because [reason]. -->
```

If you find yourself breaking the same rule repeatedly, the rule is
probably wrong. Update this doc.

---

## Calibration anchors

The most-aligned reference articles, in voice quality order:

1. [how-do-i-write-a-cold-email-to-a-vc.md](./how-do-i-write-a-cold-email-to-a-vc.md)
2. [how-do-i-know-if-a-vc-passed-or-is-just-slow.md](./how-do-i-know-if-a-vc-passed-or-is-just-slow.md)
3. [am-i-ready-to-raise.md](./am-i-ready-to-raise.md)
4. [who-is-actually-writing-checks-right-now.md](./who-is-actually-writing-checks-right-now.md)
5. [how-to-find-investors-who-invest-in-my-space.md](./how-to-find-investors-who-invest-in-my-space.md)

When in doubt, reread one of these before writing the next piece.
