---
name: codimai-seo-geo-audit
description: Audit CodimAI website pages for SEO (search-engine optimization) and GEO (generative-engine optimization  being citable by AI answer engines like ChatGPT, Perplexity, Claude, Google AI Overviews). Use whenever the task is to check, score, or improve a page's discoverability, meta tags, structured data, internal linking, crawlability, or AI-citability  e.g. "audit the SEO on the Agents page", "is this page GEO-ready", "why isn't this ranking", "check my meta tags and schema". Runs a deterministic file-based audit (titles, descriptions, canonicals, OG/Twitter, JSON-LD, headings, alt text, sitemap/robots) and reports a scored checklist with concrete fixes. For writing the actual copy use codimai-content; for visual/layout use codimai-design.
---

# CodimAI  SEO + GEO Audit

This skill checks a static HTML page (or the whole site) against the SEO and GEO contract in `CLAUDE.md §6`, then reports a scored, actionable checklist. It is **diagnostic**  it tells you what to fix and why; use `codimai-content` to write the fix and `codimai-page-builder` to apply it.

Two concerns, one pass:

- **SEO**  being found and ranked by search engines (Google/Bing). Driven by crawlable semantic HTML, unique meta, canonical hygiene, structured data, internal links, and performance.
- **GEO**  being *cited* by generative answer engines (ChatGPT, Perplexity, Claude, Google AI Overviews). Driven by clean extractable facts, definitional sentences, FAQ/HowTo schema, and explicitly allowing AI crawlers.

## How to run an audit

1. **Scope it.** One page (`ai/insights.html`), a folder, or the whole repo. Default to whole repo when the user says "the site".
2. **Run the script.** It is deterministic and fast:
   ```bash
   python3 .claude/skills/codimai-seo-geo-audit/scripts/audit.py <path-or-glob>
   # whole site:
   python3 .claude/skills/codimai-seo-geo-audit/scripts/audit.py .
   ```
   It prints a per-file table of PASS / WARN / FAIL plus a site-level section (sitemap.xml, robots.txt, OG image existence) and a 0–100 score per page.
3. **Read the findings**, then for each FAIL/WARN explain the *why* and the concrete fix. Don't just dump the script output  interpret it.
4. **Re-run after fixes** to confirm the score moved. A page is "done" only when SEO and GEO checklists below are all green.

The script never edits files. It only reads and reports.

## SEO checklist (what the script enforces)

| Check | Rule | Why |
|-------|------|-----|
| `<title>` | present, unique across site, ≤ 60 chars | SERP truncation; primary ranking signal |
| meta description | present, ≤ 155 chars, not duplicated | controls SERP snippet (not a ranking factor, but CTR) |
| canonical | exactly one `<link rel="canonical">`, absolute `https://codimai.com/...`, resolves to a real file | prevents duplicate-content dilution |
| single `<h1>` | exactly one per page | document outline / topical clarity |
| heading order | no skipped levels (h1→h3 without h2) | accessible, parseable outline |
| Open Graph | `og:title`, `og:description`, `og:url`, `og:image` (image file exists), `og:type` | link previews on social + some AI engines |
| Twitter card | `twitter:card` = summary_large_image + title/description | X/Twitter previews |
| viewport | present | mobile-first indexing |
| lang | `<html lang="...">` | language targeting |
| img alt | every `<img>` has non-empty `alt` (decorative = `alt=""` explicitly) | a11y + image search |
| internal links | page links to at least one other site page; no broken internal hrefs | crawl depth + link equity |
| JSON-LD | at least one valid `application/ld+json` block that parses | rich results eligibility |

## GEO checklist (AI-citability  what makes the difference)

| Check | Rule | Why |
|-------|------|-----|
| AI crawlers allowed | `robots.txt` explicitly Allows GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended | if blocked, you cannot be cited at all |
| FAQ / definitional schema | page has `FAQPage` or `Question`/`Answer` JSON-LD, or a clear "What is X" section | answer engines lift Q&A pairs verbatim |
| definitional sentence | a clear `X is a …` / `X does …` sentence near the top | LLMs quote crisp definitions; vague hero copy isn't citable |
| self-contained claims | facts stated as standalone sentences (not "see above", not pronoun-only) | extracted out of context |
| entity clarity | brand + product named explicitly (not just "we"/"our platform") | disambiguation in answers |
| freshness signal | `dateModified`/`datePublished` in schema (blog posts) | recency weighting |
| structured lists | steps/benefits as real `<ol>`/`<ul>`, not prose blobs | easy to lift into answer bullets |

GEO is mostly **content shape**, so most fixes route to `codimai-content`. The script flags the mechanical ones (crawler allow-list, schema presence, list usage); judgment calls (is the definition crisp? are claims self-contained?) you assess by reading.

## Scoring & reporting

Report like this, never raw dumps:

```
ai/insights.html  92/100
  SEO  ✓ title (47)  ✓ desc (138)  ✓ canonical  ✓ h1×1  ✓ OG  ✓ JSON-LD(WebPage,FAQPage)
  GEO  ✓ AI crawlers  ✓ FAQPage  ⚠ definition  hero is poetic, add a plain "Insights AI is…" line
  FIX  Add one definitional sentence to the mission paragraph (see codimai-content).
```

Lead with the score, then only the items that aren't green, each with a one-line fix. End with the single highest-leverage change.

## Reference

- `CLAUDE.md §6`  the canonical SEO requirements for this repo.
- `references/geo-playbook.md`  deeper GEO tactics and example before/after rewrites.
