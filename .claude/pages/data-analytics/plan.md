# Dev plan — Data Analytics

> File-by-file, step-by-step plan. The build stage executes this verbatim.

---

## 0. Pre-flight

- [x] `content.md` is approved
- [x] `spec.md` is approved
- [ ] Branch `page/data-analytics` created at Step 1

---

## 1. Files to create / modify

| # | File | Action | Why |
|---|---|---|---|
| 1 | `ai/data-analytics.html` | REPLACE | Old stub has wrong title, meta, and no content. Full rebuild from approved content + spec. |
| 2 | `assets/js/data-analytics-hero.js` | CREATE | Canvas animation for the hero right column (data pipeline flow visualization). |
| 3 | `assets/css/components.css` | NO CHANGE | All required components already exist — zero new CSS needed. |
| 4 | `sitemap.xml` | VERIFY | URL `https://codimai.com/ai/data-analytics` — check it exists; add if missing. |
| 5 | `.claude/pages/data-analytics/notes.md` | CREATE | Decisions log. |

No `page-data-analytics.css` needed — everything composes from existing components.

---

## 2. Build steps (in order)

### Step 2.1 — Branch

```bash
git checkout -b page/data-analytics
```

### Step 2.2 — Head (SEO + fonts + JSON-LD)

Replace the `<head>` of `ai/data-analytics.html` with:
- `<title>Data Analytics & Business Intelligence — CodimAI</title>`
- `<meta name="description">` (155 chars, from content.md)
- `<link rel="canonical" href="https://codimai.com/ai/data-analytics">`
- Full Open Graph block: og:type, og:site_name, og:url, og:title, og:description, og:image
- Twitter Card: summary_large_image, title, description, image
- Google Fonts preconnect + stylesheet (Gilda Display + Inter + JetBrains Mono)
- CSS links: tokens.css → base.css → components.css
- JSON-LD `<script>` with `@graph` containing:
  - `WebPage` (name, description, url, datePublished, publisher)
  - `BreadcrumbList` (Home → AI → Data Analytics, 3 items)
  - `FAQPage` (6 Q&A pairs verbatim from content.md FAQ)

### Step 2.3 — Shared header + mobile nav

Copy the nav block verbatim from `ai/generative.html` (it has the correct structure with all dropdown links). Set `aria-current="page"` on the "AI" dropdown button and the "Data Analytics" menu item.

### Step 2.4 — Hero section

```html
<section class="hero hero--page" aria-labelledby="hero-heading">
  <div class="container hero__inner">
    <div class="hero__content">
      <p class="hero__eyebrow reveal">DATA · INTELLIGENCE · DECISIONS</p>
      <h1 id="hero-heading" class="hero__title cd-display reveal">
        Turn Business Data into <em>Actionable</em> Intelligence
      </h1>
      <p class="hero__lede reveal">
        CodimAI analyses customer behaviour, revenue trends, and operational
        metrics to surface the insights that drive smarter decisions.
      </p>
      <div class="hero__actions reveal">
        <a href="../get-started.html" class="cd-btn-primary">Start your audit</a>
        <a href="#use-cases" class="cd-btn-secondary">See use cases</a>
      </div>
    </div>
    <div class="hero--anim reveal" aria-hidden="true">
      <canvas id="data-analytics-canvas" class="hero__anim-canvas"></canvas>
      <button class="hero--anim__close" aria-label="Close expanded view">&#x2715;</button>
    </div>
  </div>
</section>
<div class="hero-anim-backdrop" aria-hidden="true"></div>
```

### Step 2.5 — Statement section

```html
<section class="mission" aria-label="Page statement">
  <div class="container">
    <p class="mission__text reveal">
      Data does not create clarity on its own. CodimAI builds the intelligence
      layer that transforms raw numbers into decisions your teams can act on today.
    </p>
  </div>
</section>
```

### Step 2.6 — Use Cases section

`id="use-cases"` — targeted by hero secondary CTA.

Layout: `.section.section--soft.section--dense` + `.section__head` (eyebrow, h2, lead, body) + `.grid.grid--3` of 5 `.card` elements (numbered 01–05). Internal link to `agentic-ai.html` added as an inline link in the section body.

Cards:
- 01 Customer Behaviour Analysis
- 02 Revenue Analysis
- 03 Operational Monitoring
- 04 Business Intelligence
- 05 Executive Reporting

### Step 2.7 — Business Benefits section

`id="benefits"`.

Layout: `.section` + `.section__head` + `.grid.grid--2` of 4 `.card` elements (no numbers — these are structural benefits, not sequence). No icon needed.

Cards:
- Better Decision-Making
- Faster Reporting
- Increased Visibility
- Strategic Growth Opportunities

### Step 2.8 — CodimAI Approach section

`id="approach"`.

Layout: `.section.section--soft.section--dense` + `.section__head` + `.process-list` of 5 `.process-item` rows. Internal link to `generative.html` in section body.

Steps: Data Audit → KPI Identification → Insight Framework Design → Dashboard & Analytics Development → Continuous Improvement.

### Step 2.9 — The CodimAI Process (5 full-screen sections)

`id="process"` on first section only.

Pattern: 5 × `.process-step-section` with identical internal structure (copy verbatim from `agentic-ai.html`, change content only). Unique SVG icons per step:

| Step | Title | SVG concept |
|---|---|---|
| 01 | Business Audit | Magnifying glass over a document (search/analyze) |
| 02 | ROI Audit | Chart bars rising with a checkmark |
| 03 | Consultation & Strategy | Two overlapping circles / Venn (strategy alignment) |
| 04 | Development & Deployment | Code bracket `</>` with upward arrow |
| 05 | ROI Tracking & Optimisation | Circular arrow (continuous loop) with chart line |

Progress bar `--fill`: 20% / 40% / 60% / 80% / 100%.
Dots: update `is-done` / `is-active` per step.
Step 5 has no `.process-step__next` link (it's the last).

### Step 2.10 — Why CodimAI section (dark)

`id="why-codimai"`.

Layout: `.section.section--dark` + `.container` + `.why-codimai__inner` (2fr 3fr grid):
- Left: `.why-codimai__heading` + `<p>` lead paragraph
- Right: `.why-list` of 6 `.why-row` items (numbered 01–06)

Rows: ROI-First Approach, Business-Focused Solutions, Custom AI Development, Enterprise-Ready Architecture, End-to-End Delivery, Long-Term Support & Optimisation.

### Step 2.11 — FAQ section

`id="faq"`.

Layout: `.section` + `.section__head` (eyebrow `// FAQ`, h2 "Common Questions") + `.faq` containing 6 `.faq-item` `<details>` elements.

All 6 Q&A pairs verbatim from content.md.

### Step 2.12 — Closing CTA + Footer

`.closing-screen` wrapping `.site-cta` + `.site-footer`.

CTA:
- Eyebrow: `// GET STARTED`
- Heading: "Get a Free Business & ROI Audit"
- Body: "Discover where AI can create the greatest impact in your organisation before investing in development."
- Button: "Request your audit" → `../get-started.html`

Footer: copy verbatim from `ai/generative.html`.

### Step 2.13 — JS files (bottom of `<body>`)

```html
<script src="../assets/js/nav.js" defer></script>
<script src="../assets/js/reveal.js" defer></script>
<script src="../assets/js/process-scroll.js" defer></script>
<script src="../assets/js/data-analytics-hero.js" defer></script>
```

### Step 2.14 — Canvas animation (`assets/js/data-analytics-hero.js`)

Build the data pipeline animation per spec §9:

**Architecture:**
- 12 nodes across 3 zones:
  - Zone L `// DATA SOURCES`: CRM, ERP, Ops, Events (column x ≈ 0.18W)
  - Zone C `// ANALYTICS LAYER`: Ingest, Model, KPIs, Patterns (column x ≈ 0.50W)
  - Zone R `// INSIGHTS`: Revenue, Behaviour, Executive, Alert (column x ≈ 0.82W)
- Zone backdrops: 3 faint `arcTo` rounded rects drawn before nodes
- ~14 directed quadratic bezier edges (left → center → right fan-out)
- Pulses: filled dot `r ≈ W*0.004` with 3-ghost trail, travelling left → right
- Activation ring on arrival at output nodes
- Respawn delay per edge: `600 + Math.random() * 1600` ms

**Sizing rules (all `W * factor`, no hard px):**
```js
var nodeR = Math.max(10, W * 0.028);
var fontSize = Math.max(9, W * 0.022);
var monoSize = Math.max(7, W * 0.016);
ctx.lineWidth = Math.max(0.8, W * 0.0015);
```

**visibilitychange:** pause `requestAnimationFrame` on `hidden`, restart on `visible`.

**Click-to-expand:** `hero--anim` click → add `.hero--anim--expanded` + open `.hero-anim-backdrop`; close button + backdrop click → remove both. (Matches pattern in `agentic-hero.js`.)

### Step 2.15 — Sitemap check

Verify `sitemap.xml` contains `<loc>https://codimai.com/ai/data-analytics</loc>`. Add if missing.

---

## 3. Self-check before declaring done

- [ ] `<h1>` is unique and present once
- [ ] Heading hierarchy: h1 → h2 (section titles) → h3 (card titles if any) — no skips
- [ ] All `class` names exist in `components.css` or `base.css` — zero invented classes
- [ ] Zero hex values in `data-analytics.html` or `data-analytics-hero.js` outside the four allowed canvas colours
- [ ] All internal links resolve: `agentic-ai.html`, `generative.html`, `../get-started.html`, `#use-cases`
- [ ] Canvas animation loads, animates, pauses on tab switch, resumes correctly
- [ ] Click-to-expand works on desktop
- [ ] Scroll-snap: each section snaps cleanly at desktop 1280px
- [ ] Mobile 360px: hero single column, all grids single column, process steps legible
- [ ] Nav: active state on "AI" + "Data Analytics" item
- [ ] JSON-LD: WebPage, BreadcrumbList, FAQPage all present and valid
- [ ] OG image path is correct (`../assets/img/og-data-analytics.webp`) — file may not exist yet, path must be correct
- [ ] `sitemap.xml` contains the data-analytics URL

---

## 4. Files to stage for commit

```bash
git add ai/data-analytics.html
git add assets/js/data-analytics-hero.js
git add sitemap.xml                      # if modified
git add .claude/pages/data-analytics/
```

---

## 5. Commit message (do not commit until Stage 5 approval)

```
feat(pages): add data-analytics page

- Full rebuild of ai/data-analytics.html from approved content + spec
- New canvas animation: assets/js/data-analytics-hero.js
  (data pipeline flow — sources → analytics layer → insights)
- 13 scroll-snap sections; zero new CSS components required
- WebPage, BreadcrumbList, FAQPage JSON-LD included
- Content, spec, and plan in .claude/pages/data-analytics/
```

---

## 6. Out of scope for this PR

- OG image `og-data-analytics.webp` — path is set correctly; image file is a future asset task
- Backend form handling for "Request your audit" CTA — handled in get-started.html
