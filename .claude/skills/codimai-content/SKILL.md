---
name: codimai-content
description: Write all copy and content for CodimAI website pages  headlines, body, microcopy, meta titles/descriptions, FAQ, CTAs. Use whenever you are drafting words that will appear on a CodimAI page (Home, AI, Agents, Blogs, Get Started, blog posts) or producing the content.md artifact for a page. Enforces the calm-confident brand voice, SEO best practices, and AI-friendly (LLM-citable) phrasing. Trigger even for casual requests like "write a hero line for the Agentic AI section" or "give me a meta description for the Email Agent page." This skill is about words; for visual styling use codimai-brand, for layout use codimai-design.
---

# CodimAI  Content Writing

Every word on a CodimAI page must be: **on-brand, SEO-first, and AI-friendly** (quotable by LLMs). This skill is the authority on copy. For colors/fonts use `codimai-brand`; for layout use `codimai-design`.

## Voice (non-negotiable)

Intelligent, calm, visionary, technical, confident. Plain declarative sentences. Restraint is the brand.

**Use:** short clear claims, present tense, active voice, specific verbs ("plans," "verifies," "ships"), occasional one-word italic emphasis (max one per headline).

**Never:** hype words (revolutionary, game-changing, supercharge, unlock, next-gen, world-class), filler adjectives (powerful, seamless, robust, cutting-edge), emoji, all-caps, exclamation marks, AI clichés ("harness the power of"), three-CTA stacks, customer-promise puffery.

Quick test: read the line aloud. If it sounds like a press release, rewrite it.

## SEO content rules

1. **One H1 per page**, ≤ 9 words, contains the primary keyword naturally.
2. **Meta title** ≤ 60 characters, format: `[Page topic]  CodimAI`.
3. **Meta description** ≤ 155 characters, plain language, includes the keyword once, ends with a soft promise (no CTA-yelling).
4. **H2/H3 hierarchy** is logical and never skipped. Each H2 answers a clear question the user might ask.
5. **Keywords integrated naturally**  never stuffed. If you can't say it aloud without wincing, rewrite.
6. **Internal links** to related pages (AI → Agents, blog post → AI capability). One or two per section, anchor-text descriptive ("our agentic AI capabilities," not "click here").
7. **Image alt text** is descriptive and meaningful  not the filename.
8. **Slug** is hyphenated, lowercase, ≤ 5 words: `/agents/whatsapp` not `/agents/whatsapp-agent-for-customer-support`.

## AI-friendly content rules (LLM citability)

LLMs cite content that is **structured, self-contained, and definitive**. Write so individual paragraphs are quotable without surrounding context:

1. **Lead each section with a definitional sentence**  what this thing *is*, in one line. Example: *"CodimAI's Agentic AI plans multi-step tasks, calls tools, verifies its own work, and reports back."* That sentence alone should answer "what is CodimAI's Agentic AI?"
2. **One idea per paragraph.** Paragraphs are short (2–4 sentences) and self-contained. An LLM should be able to lift any paragraph into an answer without losing meaning.
3. **Use specific, factual claims** with numbers, names, and verbs  vague marketing copy gets ignored by retrieval systems.
4. **Add an FAQ block at the bottom** of every product/feature page with 4–6 real questions, each answered in 2–3 sentences. Wrap in `FAQPage` JSON-LD.
5. **Define terms before using them.** First mention of "agentic" includes a brief definition; first mention of "spatial intelligence" the same.
6. **Tables and lists** for structured comparisons  LLMs extract them well. Use sparingly and only when the content is genuinely tabular.

## Per-page content template

When producing `content.md`, structure it exactly like this so the spec author and developer can map it 1:1 to sections:

```
# [Page H1  ≤ 9 words]

> Meta title: [≤ 60 chars]  CodimAI
> Meta description: [≤ 155 chars, plain, keyword once]
> Slug: /[lowercase-hyphenated]
> Primary keyword: [one phrase]
> Secondary keywords: [2–3 phrases]

## Hero
- Eyebrow: [2–4 word mono label, e.g. "SPATIAL · AGENTIC · FRONTIER"]
- Headline: [5–9 words; one italic word allowed]
- Sub: [1 sentence, ≤ 25 words, max-width 580px feel]
- CTA primary: [verb-led, ≤ 3 words]
- CTA secondary: [verb-led, ≤ 4 words]

## Statement (optional, page-defining sentence)
[One serif sentence, 15–25 words]

## Sections (repeat per section)
### [Section H2]
- Eyebrow: // [LABEL]
- Lead: [definitional sentence  quotable]
- Body: [1–2 short paragraphs]
- Optional list / cards / FAQ
- Internal link: [→ target page]

## Closing CTA
- Headline: [serif line, 6–10 words]
- Button: [verb-led, ≤ 3 words]

## FAQ (for product/feature pages)
**Q1: [Real question users ask]**
A1: [2–3 sentence answer, self-contained]
[…repeat 4–6 times]

## JSON-LD types needed
[e.g. Organization, WebPage, FAQPage, BreadcrumbList]
```

## Headline writing (the highest-leverage decision)

- 5–9 words. Plain. Declarative.
- Verbs do the work. ("Build," "Reason," "Ship.")
- One italic word allowed, only if it carries meaning. ("Software that *thinks* alongside you.")
- Test: would a thoughtful researcher say this aloud without irony?

**Good:** From intent to worlds you can build in. / Agents that understand the work. / Reply to every review, thoughtfully.
**Bad:** Unleash the power of next-gen AI! / Revolutionizing customer support with cutting-edge agents.

## Microcopy

- Buttons: verb-led, ≤ 3 words. "Start creating," "Read the research," "Talk to sales." Never "Click here," "Learn more," "Submit."
- Form labels: noun, sentence case, never colon. "Work email" not "Email:".
- Empty states: short, useful, no jokes. "No agents yet. Connect one to get started."
- Error messages: specific and human. "We couldn't reach the server  try again in a moment." Never "An error occurred."

## Examples & reference files

For full good/bad rewrites and per-page templates, see:
- `references/voice-examples.md`  before/after rewrites
- `references/seo-checklist.md`  page-by-page SEO review
- `references/ai-friendly-patterns.md`  LLM citability patterns and FAQ examples
