# GEO Playbook — making CodimAI pages citable by AI answer engines

GEO (Generative Engine Optimization) is the practice of structuring a page so AI answer engines — ChatGPT, Perplexity, Claude, Google AI Overviews, Bing Copilot — will **quote and cite it** when a user asks a related question. It overlaps with SEO (you must be crawlable) but the winning unit is different: SEO ranks *pages*, GEO lifts *sentences*.

## The mental model

An answer engine retrieves candidate passages, then synthesizes a reply, citing the passages it used. To be cited, a passage must be:

1. **Retrievable** — the crawler is allowed in and the fact is on a real, indexable URL.
2. **Extractable** — the sentence makes sense lifted out of its surrounding context.
3. **Attributable** — it names the entity, so the model knows what the fact is *about*.
4. **Trustworthy** — structured (schema), dated, and specific rather than hyped.

Optimize for the sentence that an AI would copy into its answer.

## Tactics, in priority order

### 1. Let the crawlers in (mechanical, do this first)
`robots.txt` must explicitly `Allow` GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, and `Google-Extended`. A blocked crawler = zero citations, regardless of content quality. The repo's `robots.txt` already does this — keep it.

### 2. Open with a definitional sentence
Answer engines love crisp `X is a …` definitions. The hero can be poetic, but the **mission/intro paragraph** should contain one plain, self-contained definition.

> **Weak (poetic, not citable):**
> "From intent to worlds you can build in."
>
> **Strong (definitional, citable):**
> "Insights AI is CodimAI's analysis layer that turns raw business data into decisions — it surfaces the *why* behind a metric, not just the number."

The second one can be lifted verbatim into "What is CodimAI Insights AI?" answers.

### 3. State facts as standalone claims
Avoid pronouns-as-subjects and back-references across sentences. Each claim should survive being copied alone.

> **Weak:** "It does this faster than the alternatives, as shown above."
> **Strong:** "CodimAI's Email Agent drafts and sends replies in under two seconds per message."

### 4. Use real FAQ schema
A `FAQPage` JSON-LD block with `Question`/`Answer` pairs is the single highest-leverage GEO feature — engines lift Q&A pairs almost verbatim. Mirror the on-page FAQ exactly in the schema. Every CodimAI capability/agent page should ship 3–5 real questions a buyer would ask.

### 5. Structure steps and benefits as lists
`<ol>` for processes ("How it works"), `<ul>` for benefits. Engines convert real lists into answer bullets; prose blobs get skipped.

### 6. Name the entity, every time
Say "CodimAI's WhatsApp Agent", not "our agent" / "the platform". Disambiguation is what lets a model attribute the fact to *you* in a multi-source answer.

### 7. Signal freshness on time-sensitive pages
Blog posts carry `datePublished` + `dateModified` in `BlogPosting` schema and a visible date. Recency is a tie-breaker in answer synthesis.

## Quick before/after audit pattern

When reviewing a page for GEO, scan the first screen of visible text and ask: *"If an AI answered 'What is [this page's topic]?', is there a sentence here it could copy?"* If no — that's the fix. Route the rewrite to `codimai-content`; it knows the voice constraints (no hype, plain declaratives) that also happen to make text more citable.

## What NOT to do
- Don't keyword-stuff — answer engines penalize and humans bounce.
- Don't fabricate stats for "citability" — false specifics destroy trust and are a brand-voice violation.
- Don't hide the definition behind JS — it must be in the served HTML.
