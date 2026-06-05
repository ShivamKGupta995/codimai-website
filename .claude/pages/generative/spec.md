# Page spec  Generative AI

> Bridges approved `content.md` and the build. Anyone reading this file should be able to build the page without re-deciding anything.

## 1. Page metadata

- **Slug:** `/ai/generative`
- **File:** `ai/generative.html`
- **Page type:** Feature / Product
- **Primary keyword:** generative AI for business content
- **Secondary keywords:** AI content generation, automated document creation, AI email generation
- **Meta title:** Generative AI for Business Content  CodimAI
- **Meta description:** CodimAI builds custom generative AI systems that produce marketing copy, reports, emails, and documents automatically  at scale, on brand.
- **Canonical URL:** `https://codimai.com/ai/generative`

---

## 2. Section map (content → design)

| # | Section ID | Content source | Section type | Notes |
|---|------------|----------------|--------------|-------|
| 1 | `hero` | content.md → Hero | `.hero--page` (reused) | Two-column interior hero. Left: eyebrow + H1 + lede + CTAs. Right: unique canvas animation `generative-hero.js`. No image slot. |
| 2 | `statement` | content.md → Statement | `.mission` (reused) | One Gilda Display sentence centred, `padding: 140px` top/bottom. |
| 3 | `use-cases` | content.md → Use Cases | `.section` + `.grid--3` of `.cap-card--plain` (reused) | White background. 6 cards numbered 01–06. No arrow (`.cap-card--plain` modifier). Section header (eyebrow + H2 + lead). |
| 4 | `benefits` | content.md → Business Benefits | `.section--soft` + `.grid--2` of `.card--wide` (reused) | Soft background. 4 cards in a 2×2 grid. Each card has a mono number, serif title, body paragraph. |
| 5 | `process-01` | content.md → Process / 01 Business Audit | `.process-step-section` (reused) | Full-screen scroll-snap. SVG: magnifying glass. Progress 20%. |
| 6 | `process-02` | content.md → Process / 02 ROI Audit | `.process-step-section` (reused) | SVG: bar chart. Progress 40%. Alternates to soft background via `:nth-of-type(even)`. |
| 7 | `process-03` | content.md → Process / 03 Consultation & Strategy | `.process-step-section` (reused) | SVG: branching tree. Progress 60%. |
| 8 | `process-04` | content.md → Process / 04 Development & Deployment | `.process-step-section` (reused) | SVG: code brackets. Progress 80%. Alternates to soft background. |
| 9 | `process-05` | content.md → Process / 05 ROI Tracking & Optimisation | `.process-step-section` (reused) | SVG: upward trend line. Progress 100%. |
| 10 | `why-codimai` | content.md → Why CodimAI | `.section--soft` + `.why-codimai__inner` + `.why-list` (reused) | Two-column editorial layout. Left: eyebrow + H2 + lead + CTA button. Right: 6 `.why-row` numbered items. |
| 11 | `faq` | content.md → FAQ | `.section` + `.faq` + 6 `.faq-item` (reused) | White background. `<details>` accordion, hairline dividers. Section header (eyebrow + H2). |
| 12 | `closing` | content.md → Closing CTA | `.closing-screen.cd-block-dark` + `.site-cta` (reused) | Dark block containing CTA section + footer. Exactly one per page. |

---

## 3. Components used (reuse map)

All components already exist in `assets/css/components.css`  no new CSS required.

| Component | Source file | New or reused? |
|-----------|-------------|----------------|
| `.site-header`, `.nav-links`, `.nav-dropdown`, `.nav-mobile-overlay` | components.css | reused |
| `.hero--page`, `.hero__inner`, `.hero__content` | components.css | reused |
| `.hero--anim`, `.hero__anim-canvas` | components.css | reused |
| `.hero__eyebrow`, `.hero__title`, `.hero__lede`, `.hero__actions` | components.css | reused |
| `.mission`, `.mission__text`, `.mission__tail` | components.css | reused |
| `.section`, `.section--soft` | components.css | reused |
| `.section__eyebrow`, `.section__heading`, `.section__head`, `.section__lead` | components.css | reused |
| `.cap-card`, `.cap-card__num`, `.cap-card__title`, `.cap-card__body` | components.css | reused |
| `.cap-card--plain` | components.css | reused (suppresses arrow) |
| `.card--wide`, `.card__num`, `.card__title`, `.card__body` | components.css | reused |
| `.grid--3`, `.grid--2` | components.css | reused |
| `.process-step-section` + all sub-classes | components.css | reused |
| `.why-codimai__inner`, `.why-codimai__heading`, `.why-list`, `.why-row`, `.why-row__num`, `.why-row__title`, `.why-row__body` | components.css | reused |
| `.faq`, `.faq-item`, `.faq-item__body` | components.css | reused |
| `.closing-screen.cd-block-dark`, `.site-cta`, `.site-cta__heading`, `.site-cta__body` | components.css | reused |
| `.site-footer` + sub-classes | components.css | reused |
| `.reveal` + `[data-reveal]` | components.css | reused |
| `.cd-btn-primary`, `.cd-btn-secondary` | tokens.css | reused |

**New JS file required:**
- `assets/js/generative-hero.js`  canvas animation unique to this page (see §8)

---

## 4. Brand tokens used

All values via CSS custom properties  zero literal hex values outside `tokens.css`.

- **Backgrounds:** `var(--cd-canvas)`, `var(--cd-surface)`, `var(--cd-soft)`, `var(--cd-ink-block)`
- **Text:** `var(--cd-ink)`, `var(--cd-body)`, `var(--cd-muted)`, `var(--cd-on-dark)`, `var(--cd-on-dark-soft)`
- **Borders:** `var(--cd-border)`, `var(--cd-border-strong)`
- **Radius:** `var(--cd-radius-sm)`, `var(--cd-radius)`
- **Fonts:** `var(--cd-font-display)`, `var(--cd-font-body)`, `var(--cd-font-mono)`

---

## 5. Responsive behavior

Default rules from `codimai-design` apply everywhere. Page-specific notes:

| Breakpoint | Use Cases grid | Benefits grid | Process steps | Why CodimAI |
|---|---|---|---|---|
| Desktop ≥ 1024px | `.grid--3` (3 cols) | `.grid--2` (2 cols) | Full-screen, two-column icon+text | Two-column: lead left, list right |
| Tablet 640–1023px | 2 columns | 1 column | Centered, icon above text | Single column, list below lead |
| Mobile < 640px | 1 column | 1 column | Compact: icon 48px, reduced padding | Single column |

- Hero: collapses to single column at ≤ 1023px (already in `.hero--page` responsive rules)
- Hero headline: `clamp(44px, 7vw, 76px)`  standard
- Section padding: `120px` desktop / `88px` mobile  standard

---

## 6. SEO + schema

- `<title>`: Generative AI for Business Content  CodimAI
- `<meta name="description">`: CodimAI builds custom generative AI systems that produce marketing copy, reports, emails, and documents automatically  at scale, on brand.
- `<link rel="canonical" href="https://codimai.com/ai/generative">`
- **Open Graph:** `og:title`, `og:description`, `og:image` → `assets/img/og-generative.webp` (1200×630)
- **Twitter Card:** `summary_large_image`
- **JSON-LD blocks:**
  - [x] `WebPage`  name, description, url, publisher
  - [x] `BreadcrumbList`  Home → AI → Generative
  - [x] `FAQPage`  6 Q&A pairs from FAQ section
  - [ ] `Organization`  Home only, skip here
  - [ ] `BlogPosting`  blog only, skip here

---

## 7. Internal links

| From section | Link target | Anchor text |
|---|---|---|
| Hero CTA primary | `../get-started.html` | "Book your free audit" |
| Hero CTA secondary | `#use-cases` (same-page anchor) | "See the process" |
| Use Cases section  Email Generation card | `../agents/email.html` | "our Email Agent" |
| Why CodimAI left column CTA | `../get-started.html` | "Book a free audit" |
| Closing CTA button | `../get-started.html` | "Book your audit" |

---

## 8. Canvas animation  `generative-hero.js`

**Concept:** A content pipeline  documents flowing from structured inputs through a generation layer to output channels. Shows the transformation from raw data/briefs to finished content assets.

**Node layout (left → right pipeline):**

```
Layer 1  INPUT          Layer 2  GENERATE        Layer 3  OUTPUT
[ Brief ]                                           [ Blog Post ]
[ Product Data ] ──────→ [ AI Content Engine ] ──→ [ Email ]
[ Brand Guide ]                                     [ Proposal ]
                                                    [ Docs ]
```

**Visual spec:**
- 8 nodes total: 3 input, 1 central engine (larger, ~1.5× radius), 4 output
- Zone backdrops: `// INPUT`, `// GENERATE`, `// OUTPUT`  faint warm-grey rounded rects drawn with `arcTo`
- Input nodes: white fill, warm border, mono labels
- Engine node: slightly larger, slightly darker border to signal importance
- Output nodes: white fill, same style as input
- Edges: quadratic bezier curves with arrowheads; pulses travel left-to-right only
- Pulses: `#1A1A18` dot, 3-ghost trail, activation ring on arrival at engine and each output
- Two simultaneous pulses on different edges for visual activity
- All sizes use `W * factor`  no hard-clamped px values
- Background: `#F7F5F0`; pause on `visibilitychange: hidden`

---

## 9. SVG icons for process steps

Reuse the same draw-animation SVG pattern from `agentic-ai.html`:

| Step | Icon concept | SVG elements |
|---|---|---|
| 01 Business Audit | Magnifying glass | `circle` + two `line`s (cross-hairs)  **copy from agentic-ai.html** |
| 02 ROI Audit | Bar chart | `line` (axes) + 4 vertical `line` bars  **copy from agentic-ai.html** |
| 03 Consultation & Strategy | Branching tree | `circle` (root) + `line` (stem) + 2 branch `line`s + 2 `circle`s (leaves)  **copy from agentic-ai.html** |
| 04 Development & Deployment | Code brackets | `polyline` `< >` + diagonal slash  **copy from agentic-ai.html** |
| 05 ROI Tracking & Optimisation | Trend line | `line` (axes) + `polyline` (upward) + arrowhead  **copy from agentic-ai.html** |

All 5 SVGs are already in `agentic-ai.html` lines 282–466  copy verbatim. Do not redesign.

---

## 10. Open questions / decisions to confirm

None. All content, layout, components, and tokens are determined.

---

## 11. Definition of done for this page

- [x] Every approved content chunk has a section in the map
- [x] Every section uses an existing component (no new CSS needed)
- [x] All tokens reference existing CSS variables  no literal hex
- [x] Responsive behavior documented for 360 / 768 / 1280
- [x] SEO + schema block complete (WebPage + BreadcrumbList + FAQPage)
- [x] Internal links resolve to real pages
- [x] Canvas animation concept specified (`generative-hero.js`)
- [x] Process step SVGs specified (copy from `agentic-ai.html`)
