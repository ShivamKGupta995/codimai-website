# Page spec — Data Analytics

> Bridges approved `content.md` and the build. Anyone reading this file should be able to build the page without re-deciding anything.

---

## 1. Page metadata

- **Slug:** `/ai/data-analytics`
- **File:** `ai/data-analytics.html`
- **Page type:** Feature / Product
- **Primary keyword:** business data analytics AI
- **Secondary keywords:** business intelligence platform, AI-powered dashboards, KPI analytics
- **Meta title:** `Data Analytics & Business Intelligence — CodimAI`
- **Meta description:** `CodimAI turns raw business data into decision-ready intelligence — from customer behaviour to revenue trends, operational metrics, and executive dashboards.`
- **Canonical URL:** `https://codimai.com/ai/data-analytics`

---

## 2. Section map (content → design)

| # | Section ID | Content source | Section type / Component | Notes |
|---|---|---|---|---|
| 1 | `hero` | content.md → Hero | `.hero.hero--page` | Two-column: text left, canvas animation right. Canvas: data pipeline flow. |
| 2 | `statement` | content.md → Statement | `.mission` | One serif sentence centered. Existing component — no change. |
| 3 | `use-cases` | content.md → Section 1 | `.section.section--soft.section--dense` + `.grid--3` of `.card` | 5 cards, numbered 01–05 with `.card__num`. Lead + body in `.section__head`. Internal link to `agentic-ai.html`. |
| 4 | `benefits` | content.md → Section 2 | `.section` + `.grid--2` of `.card.card--wide` | 4 benefit cards. No numbers. Lead + body in `.section__head`. |
| 5 | `approach` | content.md → Section 3 | `.section.section--soft.section--dense` + `.process-list` | 5-step compact process list (`.process-item` with num/title/body). Internal link to `generative.html`. |
| 6–10 | `process-1` … `process-5` | content.md → Section 4 (5 steps) | `.process-step-section` × 5 | Full-screen scroll storytelling. Each step = one viewport. Unique SVG icon per step. Progress bar + dot indicator included. |
| 11 | `why-codimai` | content.md → Section 5 | `.section.section--dark` + `.why-codimai__inner` + `.why-list` | Dark block. Left column: heading + lead paragraph. Right column: `.why-list` of 6 `.why-row` items. Exactly one dark section per page — this is it. |
| 12 | `faq` | content.md → FAQ | `.section` + `.faq` > `.faq-item` (`<details>`) | 6 Q&As. `.section__head` has eyebrow + h2. `.faq` starts below. Max-width 760px on `.faq`. |
| 13 | `closing` | content.md → Closing CTA | `.closing-screen` + `.site-cta` + `.site-footer` | Standard dark closing screen. Warm-white button (`.cd-btn-primary` dark-block variant). Footer shares this screen. |

**Total scroll positions:** 13 (Hero + Statement + Use Cases + Benefits + Approach + 5×Process + Why + FAQ + Closing)

---

## 3. Components used (reuse map)

| Component | Source | New or reused? |
|---|---|---|
| `.site-header` | components.css | reused |
| `.nav-links`, `.nav-dropdown` | components.css | reused |
| `.hero.hero--page` | components.css | reused |
| `.hero--anim`, `.hero__anim-canvas` | components.css | reused |
| `.hero-anim-backdrop`, `.hero--anim--expanded`, `.hero--anim__close` | components.css | reused |
| `.mission`, `.mission__text` | components.css | reused |
| `.section`, `.section--soft`, `.section--dense` | components.css | reused |
| `.section__head`, `.section__eyebrow`, `.section__heading`, `.section__lead` | components.css | reused |
| `.grid--3`, `.grid--2` | components.css | reused |
| `.card`, `.card__num`, `.card__title`, `.card__body`, `.card__icon` | components.css | reused |
| `.card--wide` | components.css | reused (modifier: `padding: 32px; title 24px`) |
| `.process-list`, `.process-item`, `.process-item__num`, `.process-item__title`, `.process-item__body` | components.css | reused |
| `.process-step-section`, `.process-step__wrap`, `.process-step__bg-num`, `.process-step__dots`, `.process-step__dot`, `.process-step__eyebrow`, `.process-step__icon`, `.process-step__title`, `.process-step__body`, `.process-step__next`, `.process-step__progress`, `.process-step__progress-fill` | components.css | reused |
| `.why-codimai__inner`, `.why-codimai__heading`, `.why-list`, `.why-row`, `.why-row__num`, `.why-row__title`, `.why-row__body` | components.css | reused |
| `.faq`, `.faq-item`, `.faq-item__body` | components.css | reused |
| `.closing-screen`, `.site-cta`, `.site-cta__heading`, `.site-cta__body` | components.css | reused |
| `.site-footer` | components.css | reused |
| `.cd-btn-primary`, `.cd-btn-secondary` | base.css / components.css | reused |
| `.reveal` | components.css | reused — applied to hero text, section heads |
| `.container` | base.css | reused |

**No new components required.** All sections compose from existing primitives.

---

## 4. Brand tokens used

- **Backgrounds:** `--cd-canvas` (page default), `--cd-soft` (alternating sections), `--cd-ink-block` (Why CodimAI dark section + closing screen)
- **Surfaces:** `--cd-surface` (card fills)
- **Text:** `--cd-ink` (headings), `--cd-body` (body), `--cd-muted` (eyebrows, mono labels, process nums), `--cd-on-dark` (headings on dark), `--cd-on-dark-soft` (body on dark)
- **Borders:** `--cd-border` (cards, list dividers), `--cd-border-strong` (card hover)
- **Radius:** `--cd-radius` (cards, canvas panel), `--cd-radius-sm` (small elements)
- **Fonts:** `--cd-font-display` (Gilda Display — headings, card titles, process titles), `--cd-font-body` (Inter — body, nav), `--cd-font-mono` (JetBrains Mono — eyebrows, nums, labels)

Zero hex values outside `assets/css/tokens.css`.

---

## 5. Responsive behavior

Default rules from `codimai-design` apply. Page-specific notes:

| Breakpoint | Behavior |
|---|---|
| Desktop ≥ 1024px | Hero: 1fr 1fr grid (text | canvas). Use Cases: `.grid--3` (3 col). Benefits: `.grid--2` (2 col). Why: 2fr 3fr grid. |
| Tablet 640–1023px | Hero collapses to 1 col (canvas below text, aspect 16/7). `.grid--3` → 2 col. Why: 1 col. |
| Mobile < 640px | Hero `padding-block: 72px`, canvas `aspect-ratio: 4/3`. All grids → 1 col. `.process-item` collapses num under content. `.faq summary` 17px. |

**Process-step sections:** full-screen at all sizes; `.process-step__wrap` padding reduces on mobile (`5rem 1.25rem 4rem`). Already handled in components.css.

---

## 6. SEO + schema

- `<title>`: `Data Analytics & Business Intelligence — CodimAI`
- `<meta name="description">`: `CodimAI turns raw business data into decision-ready intelligence — from customer behaviour to revenue trends, operational metrics, and executive dashboards.`
- `<link rel="canonical">`: `https://codimai.com/ai/data-analytics`
- **Open Graph:**
  - `og:title`: `Data Analytics & Business Intelligence — CodimAI`
  - `og:description`: same as meta description
  - `og:image`: `../assets/img/og-data-analytics.webp` (1200×630)
  - `og:type`: `website`
- **Twitter Card:** `summary_large_image`
- **JSON-LD blocks:**
  - [x] `WebPage` — name, description, url, breadcrumb
  - [x] `BreadcrumbList` — Home → AI → Data Analytics
  - [x] `FAQPage` — 6 Q&A pairs from FAQ section
  - [ ] `Organization` — Home only, not repeated here

---

## 7. Internal links

| From section | To page | Anchor text |
|---|---|---|
| Use Cases section lead / card footer | `agentic-ai.html` | "our agentic AI capabilities" |
| Approach section lead | `generative.html` | "Generative AI" |
| Hero CTA secondary | `#use-cases` anchor | "See use cases" |
| Why CodimAI | `../get-started.html` | implicit via closing CTA |
| FAQ — Q4 (vs BI tools) | stays on page | — |

---

## 8. Imagery

No static images in the hero. Canvas animation is the sole visual on the right.

| Slot | Description | Filename | Alt text |
|---|---|---|---|
| OG image | Abstract data-flow render — nodes, edges, warm neutral tones | `og-data-analytics.webp` | Data analytics intelligence layer — CodimAI |
| (all others) | No section imagery required — the page is copy + canvas + components only | — | — |

---

## 9. Canvas animation spec (`assets/js/data-analytics-hero.js`)

**Concept:** Data Pipeline Intelligence — raw data sources flow left-to-right through an analytics layer and emerge as structured insights.

**Node layout (left → right, 3 zones):**

| Zone | Label | Nodes |
|---|---|---|
| `// DATA SOURCES` | Left zone | CRM, ERP, Ops, Events (4 source nodes) |
| `// ANALYTICS LAYER` | Center zone | Ingest, Model, KPIs, Patterns (4 processing nodes) |
| `// INSIGHTS` | Right zone | Revenue, Behaviour, Executive, Alert (4 output nodes) |

**Edges:** directed bezier curves from each source to Ingest, from Ingest to Model, Model to KPIs + Patterns, then KPIs/Patterns fan out to all 4 output nodes. Total ≈ 14 edges.

**Pulse animation:** data particles travel left → right along each edge with 3-ghost trail. Pulses on output nodes show an activation ring. Respawn delay per edge: 600–2200ms random.

**Zone backdrops:** 3 faint `arcTo` rounded rects with mono zone labels drawn before edges.

**Canvas sizing:** all node radii, font sizes, line widths scaled with `W * factor`. No hard px with small upper clamp.

**Colors:** `#F7F5F0` BG, `#1A1A18` nodes/edges/text, `#86847C` muted labels, `#FFFFFF` node fill. No other hex.

**Pause/resume:** `visibilitychange` handler — pause on hidden, resume on focus.

**Click-to-expand:** triggers `.hero--anim--expanded` + `.hero-anim-backdrop` (existing JS pattern from other pages).

---

## 10. Open questions / decisions

None. All content is fully specified and approved. No open questions before build.

---

## 11. Definition of done for this page

- [x] Every approved content chunk has a section in the map (13 sections)
- [x] Every section uses an existing component — no new CSS classes required
- [x] All tokens reference existing CSS variables — no hex values outside tokens.css
- [x] Responsive behavior documented for 360 / 768 / 1280
- [x] SEO + schema block is complete (WebPage, BreadcrumbList, FAQPage)
- [x] All internal links resolve to real pages (`agentic-ai.html`, `generative.html`, `../get-started.html`)
- [x] Canvas animation fully specified — concept, nodes, zones, edge routing, pulse behavior
- [x] No new components — zero additions to components.css required
