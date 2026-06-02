# Page spec — Agentic AI

> Bridges approved `content.md` and the build. Anyone reading this file should be able to build the page without re-deciding anything.

## 1. Page metadata

- **Slug:** `/agentic-ai`
- **File:** `agentic-ai.html`
- **Page type:** Feature / Product
- **Primary keyword:** agentic AI solutions for business
- **Secondary keywords:** custom AI development, business AI ROI, AI implementation process
- **Meta title:** Agentic AI Solutions for Business — CodimAI
- **Meta description:** CodimAI builds custom agentic AI systems grounded in a proven five-step process — starting with a free Business & ROI Audit before a line of code is written.
- **Canonical URL:** `https://codimai.com/agentic-ai`

---

## 2. Section map (content → design)

| # | Section ID | Content source | Section type | Notes |
|---|------------|----------------|--------------|-------|
| 1 | `hero` | content.md → Hero | `.hero` (reused) | Background: `var(--cd-canvas)`. Hero image: atmospheric 3D workspace / AI-pipeline render, 16:7 desktop / 4:5 mobile, 12px radius, hairline border |
| 2 | `statement` | content.md → Statement | `.mission` (reused) | One big Gilda Display sentence, centered, `padding: 140px` top/bottom |
| 3 | `process` | content.md → The CodimAI Process | `.section` + `.process-list` **NEW** | White background. Section header (eyebrow + H2 + lead). Followed by a `<ol class="process-list">` of 5 `.process-item` rows |
| 4 | `why-codimai` | content.md → Why CodimAI | `.section--soft` + `.capabilities__grid` + `.cap-card` (reused) | Soft background. 3×2 grid of `.cap-card` — reuse existing cap-card pattern, no arrow needed; add `.cap-card--plain` modifier to suppress arrow |
| 5 | `faq` | content.md → FAQ | `.section` + `.faq` **NEW** | White background. `<dl class="faq">` with 6 `.faq-item` `<details>` rows; hairline dividers top/bottom per item |
| 6 | `closing` | content.md → Closing CTA | `.site-cta` + `.section--dark` (reused) | Exactly one dark block. Eyebrow hidden. Serif H2 + body + `.cd-btn-primary` |

---

## 3. Components used (reuse map)

| Component | Source file | New or reused? |
|-----------|-------------|----------------|
| `.hero` | components.css | reused |
| `.mission` | components.css | reused |
| `.section` | components.css | reused |
| `.section--soft` | components.css | reused |
| `.section--dark` / `.site-cta` | components.css | reused |
| `.section__eyebrow` | components.css | reused |
| `.section__heading` | components.css | reused |
| `.capabilities__grid` | components.css | reused (for Why CodimAI 3×2 grid) |
| `.cap-card` + `__num` + `__title` + `__body` | components.css | reused |
| `.cap-card--plain` | components.css | **NEW** — modifier: `display:none` on `.cap-card__arrow` so plain differentiator cards have no CTA arrow |
| `.process-list` | components.css | **NEW** — `<ol>` list-style-none; `border-top: 1px solid var(--cd-border)`; each item bottom-bordered |
| `.process-item` | components.css | **NEW** — `display: grid; grid-template-columns: 72px 1fr; gap: 32px; align-items: start; padding: 36px 0; border-bottom: 1px solid var(--cd-border)` |
| `.process-item__num` | components.css | **NEW** — `font-family: var(--cd-font-mono); font-size: 13px; color: var(--cd-muted); letter-spacing: .08em; text-transform: uppercase; padding-top: 6px` |
| `.process-item__title` | components.css | **NEW** — `font-family: var(--cd-font-display); font-weight: 400; font-size: 22px; color: var(--cd-ink); line-height: 1.2; margin-bottom: 10px` |
| `.process-item__body` | components.css | **NEW** — `font-size: 15px; color: var(--cd-body); line-height: 1.65` |
| `.faq` | components.css | **NEW** — `<dl>` reset; `border-top: 1px solid var(--cd-border)`; max-width 760px; margin: 0 auto |
| `.faq-item` | components.css | **NEW** — `<details>` with `border-bottom: 1px solid var(--cd-border)`; `<summary>` is the question: `font-family: var(--cd-font-display); font-size: 19px; color: var(--cd-ink); padding: 22px 0; cursor: pointer; list-style: none`; body is `font-size: 15px; color: var(--cd-body); padding-bottom: 22px; line-height: 1.65` |
| `.cd-btn-primary` | tokens.css | reused |
| `.cd-btn-secondary` | tokens.css | reused |
| `.reveal` | components.css | reused — apply `data-reveal` to section headers, process items, cards |

---

## 4. Brand tokens used

All values via CSS variables only — no literal hex outside `tokens.css`.

- **Backgrounds:** `var(--cd-canvas)`, `var(--cd-surface)`, `var(--cd-soft)`, `var(--cd-ink-block)`
- **Text:** `var(--cd-ink)`, `var(--cd-body)`, `var(--cd-muted)`, `var(--cd-on-dark)`, `var(--cd-on-dark-soft)`
- **Borders:** `var(--cd-border)`, `var(--cd-border-strong)`
- **Radius:** `var(--cd-radius-sm)`, `var(--cd-radius)`
- **Fonts:** `var(--cd-font-display)`, `var(--cd-font-body)`, `var(--cd-font-mono)`

---

## 5. Responsive behavior

Default rules from `codimai-design` apply. Page-specific overrides:

| Breakpoint | Process list | Why CodimAI grid | FAQ |
|---|---|---|---|
| Desktop ≥ 1024px | `grid-template-columns: 72px 1fr` per item | `.grid--3` (3 columns) | max-width 760px centered |
| Tablet 640–1023px | `grid-template-columns: 56px 1fr`, gap 24px | `.grid--2` (2 columns) | max-width 100% |
| Mobile < 640px | Single column: num above content, gap 8px | Single column | Full width, question font 17px |

- Hero headline: `clamp(44px, 7vw, 76px)` — standard from `codimai-design`
- Section padding: `120px` desktop / `88px` mobile — standard

---

## 6. SEO + schema

- `<title>`: Agentic AI Solutions for Business — CodimAI
- `<meta name="description">`: CodimAI builds custom agentic AI systems grounded in a proven five-step process — starting with a free Business & ROI Audit before a line of code is written.
- `<link rel="canonical" href="https://codimai.com/agentic-ai">`
- **Open Graph:** `og:title`, `og:description`, `og:image` → `assets/img/og-agentic-ai.webp` (1200×630)
- **Twitter Card:** `summary_large_image`
- **JSON-LD blocks:**
  - [x] `WebPage` — name, description, url, breadcrumb
  - [x] `BreadcrumbList` — Home → AI → Agentic AI
  - [x] `FAQPage` — 6 Q&A pairs from FAQ section
  - [ ] `Organization` — Home only, skip here
  - [ ] `BlogPosting` — blog only, skip here

---

## 7. Internal links

| From section | Link target | Anchor text |
|---|---|---|
| Hero CTA secondary | `#process` (same page anchor) | "See how it works" |
| Hero CTA primary | `get-started.html` | "Book your free audit" |
| Closing CTA button | `get-started.html` | "Book your audit" |

---

## 8. Imagery

| Slot | Description | Filename | Alt text | Dimensions |
|---|---|---|---|---|
| Hero | Atmospheric 3D AI / data-pipeline render, warm ambient light, depth and space | `hero-agentic-ai.webp` | "Abstract 3D render representing agentic AI workflow orchestration" | 1600×700 (desktop) / 800×1000 (mobile) |
| OG image | Social share card matching hero crop | `og-agentic-ai.webp` | — | 1200×630 |

> If imagery is not available, use a placeholder `<div>` with `background: var(--cd-soft); border-radius: var(--cd-radius)` at the correct aspect ratio. Do not use stock UI screenshots.

---

## 9. Open questions / decisions to confirm

- [ ] Is there an existing hero image to use, or should the hero image slot be a styled placeholder for now?
- [ ] Should the "Book your free audit" CTA link to `get-started.html` or a specific anchor (`get-started.html#audit`)?

---

## 10. Definition of done for this page

- [x] Every approved content chunk has a section in the map
- [x] Every section uses an existing component, or a new one is explicitly flagged and described
- [x] All tokens reference existing CSS variables — no literal hex
- [x] Responsive behavior documented for 360 / 768 / 1280
- [x] SEO + schema block complete
- [x] Internal links resolve to real pages/anchors
- [x] Imagery slots defined with filenames + alt text + dimensions
