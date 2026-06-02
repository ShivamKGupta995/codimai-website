# Dev plan — Generative AI page

> File-by-file, step-by-step plan for building this page. Each step is small enough to verify in isolation.

## 0. Pre-flight

- [x] `content.md` is approved
- [x] `spec.md` is approved
- [ ] Branch `page/generative` created at Step 2.1

---

## 1. Files to create / modify

| # | File | Action | Why |
|---|------|--------|-----|
| 1 | `ai/generative.html` | **REWRITE** | Existing file is a skeleton (hero-only); replace completely with full page |
| 2 | `assets/js/generative-hero.js` | **CREATE** | Unique canvas animation: content-pipeline concept (Input → AI Engine → Output) |
| 3 | `partials/header.html` | **MODIFY** | 2 occurrences of `/ai.html#generative` → `/ai/generative.html` |
| 4 | `blogs/includes/header.php` | **MODIFY** | 2 occurrences of `/ai.html#generative` → `/ai/generative.html` |

**No CSS changes.** All components are already in `components.css`. No new classes needed.

**Nav links already correct** in: `index.html`, `404.html`, all `ai/*.html` siblings, all `agents/*.html`, `blogs/index.html`. These link to `generative.html` (sibling) or `../ai/generative.html` (from parent folders) — correct.

---

## 2. Build steps (in order)

### Step 2.1 — Branch

```bash
git checkout -b page/generative
```

---

### Step 2.2 — Create `assets/js/generative-hero.js`

Content-pipeline canvas: 3 input nodes → 1 AI Engine node → 4 output nodes. Full spec in `spec.md §8`.

**Node definitions:**
```
Input nodes (left column):     Brief · Product Data · Brand Guide
Engine node (centre):          AI Content Engine  (1.5× radius)
Output nodes (right column):   Blog Post · Email · Proposal · Docs
```

**Zone backdrops** (faint warm-grey, `arcTo` rounded rects, drawn before edges):
- `// INPUT` (left zone, covers Brief/Product Data/Brand Guide)
- `// GENERATE` (centre zone, covers AI Content Engine)
- `// OUTPUT` (right zone, covers all 4 output nodes)

**Edge + pulse rules:**
- Edges: quadratic bezier, `rgba(26,26,24,0.13)` stroke, small arrowheads at target end
- Pulses flow left-to-right only: from each input → Engine, then Engine → each output
- 2 simultaneous pulses on different edge paths at any time
- Pulse dot: `#1A1A18` fill, radius ≈ `W * 0.012`, with 3-ghost trail (opacity 0.25 / 0.12 / 0.05)
- Activation ring: expanding + fading arc on pulse arrival at engine and each output node

**Sizing (ALL via `W * factor` — no hard-clamped px values):**
```js
var R      = Math.max(14, W * 0.048);      // input/output node radius
var Reng   = Math.max(18, W * 0.068);      // engine node radius (larger)
var lw     = Math.max(1,  W * 0.0016);     // edge line width
var pdot   = Math.max(2,  W * 0.012);      // pulse dot radius
var fsize  = Math.max(10, W * 0.028);      // node label font size
var fsub   = Math.max(8,  W * 0.020);      // mono sub-label font size
```

**Canvas colours (brand palette, no hex outside these):**
- Background: `#F7F5F0`
- Node fill: `#FFFFFF`; border: `rgba(26,26,24,0.22)`; halo: `rgba(239,237,230,0.65)`
- Engine node border: `rgba(26,26,24,0.38)` (slightly darker to signal importance)
- Zone backdrop fill: `rgba(26,26,24,0.028)`; zone label colour: `#86847C`
- Pulse dot: `#1A1A18`
- Arrowhead: `rgba(26,26,24,0.28)`

**Lifecycle:**
- Resize: reinitialise on `window.resize` (debounced 150ms)
- Pause/resume: `document.addEventListener('visibilitychange', …)`
- Click-to-expand: wire `.hero--anim` click to the existing backdrop expansion pattern from `agentic-hero.js`

---

### Step 2.3 — Rewrite `ai/generative.html`

Build the full page following `spec.md §2` section order. Use the `agentic-ai.html` file as the structural template — copy header, footer, and script tags verbatim, then replace `<main>` content.

#### 2.3a — `<head>` block

```html
<title>Generative AI for Business Content — CodimAI</title>
<meta name="description" content="CodimAI builds custom generative AI systems that produce marketing copy, reports, emails, and documents automatically — at scale, on brand.">
<link rel="canonical" href="https://codimai.com/ai/generative">

<!-- Open Graph -->
<meta property="og:type"        content="website">
<meta property="og:site_name"   content="CodimAI">
<meta property="og:url"         content="https://codimai.com/ai/generative">
<meta property="og:title"       content="Generative AI for Business Content — CodimAI">
<meta property="og:description" content="CodimAI builds custom generative AI systems that produce marketing copy, reports, emails, and documents automatically — at scale, on brand.">
<meta property="og:image"       content="https://codimai.com/assets/img/og-generative.webp">

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="Generative AI for Business Content — CodimAI">
<meta name="twitter:description" content="CodimAI builds custom generative AI systems that produce marketing copy, reports, emails, and documents automatically — at scale, on brand.">
<meta name="twitter:image"       content="https://codimai.com/assets/img/og-generative.webp">
```

**JSON-LD (three blocks, inline in `<head>`):**

1. `WebPage` — name, description, url, datePublished `2026-06-02`, publisher
2. `BreadcrumbList` — Home (`https://codimai.com/`) → AI (`https://codimai.com/ai/`) → Generative (`https://codimai.com/ai/generative`)
3. `FAQPage` — 6 Q&A pairs from `content.md`

#### 2.3b — Header + mobile overlay

Copy verbatim from `agentic-ai.html` lines 141–210.
Update `aria-current="page"` to be on the "Generative" `<a>` (not Agentic AI).

#### 2.3c — Section 1: Hero (`hero hero--page`)

```
id="hero-heading" on the <h1>
Eyebrow:  GENERATIVE · SCALABLE · ON-BRAND
H1:       Content that writes itself, consistently
Lede:     CodimAI builds generative AI systems that produce high-quality marketing
          copy, business documents, and communications — at the pace your
          organisation demands.
CTA 1:    <a href="../get-started.html" class="cd-btn-primary">Book your free audit</a>
CTA 2:    <a href="#use-cases" class="cd-btn-secondary">See the process</a>
Canvas:   <canvas id="generative-canvas" class="hero__anim-canvas"></canvas>
```

#### 2.3d — Section 2: Statement (`.mission`)

```html
<section class="mission" aria-labelledby="statement-heading">
  <h2 id="statement-heading" class="visually-hidden">Our approach</h2>
  <div class="container">
    <p class="mission__text reveal">
      Content is your most repeated operational cost.
      <span class="mission__tail">Generative AI turns that cost into a compounding asset — writing accurately, at scale, in your voice.</span>
    </p>
  </div>
</section>
```

#### 2.3e — Section 3: Use Cases (`.section`, id="use-cases")

Eyebrow: `// WHAT IT GENERATES`
H2: `Every content type your business produces`
Lead: verbatim from `content.md` Use Cases lead
Grid: `.capabilities__grid` with 6 `.cap-card.cap-card--plain` items

```
01 — Marketing Content
02 — Email Generation
03 — Product Descriptions
04 — Proposal Creation
05 — Documentation
06 — Knowledge Base Generation
```

Body for each card from `content.md` verbatim. Internal link on Email Generation card → `../agents/email.html`.

#### 2.3f — Section 4: Business Benefits (`.section--soft`)

Eyebrow: `// BUSINESS IMPACT`
H2: `What changes when content scales`
Lead: verbatim from `content.md` Business Benefits lead
Grid: `.grid--2` with 4 `.card.card--wide` items

```
01 — Faster content creation
02 — Reduced manual effort
03 — Consistent brand communication
04 — Increased team productivity
```

Each card: `.card__num` (mono 01/02/…) + `.card__title` (Gilda Display) + `.card__body` — copy verbatim from `content.md`.

#### 2.3g — Sections 5–9: Process steps (5× `.process-step-section`, id="process")

Add `id="process"` to the first `.process-step-section` (step 01 only).

Copy the 5 process step sections verbatim from `agentic-ai.html` lines 267–483.

Update **only the text content** — keep all SVG markup, dot indicators, progress fills, and class names identical:

| Step | Title | Body (from content.md) |
|---|---|---|
| 01 | Business Audit | "We analyse your content workflows, volumes, and pain points…" |
| 02 | ROI Audit | "Before development begins, we model the expected return…" |
| 03 | Consultation & Strategy | "Our team designs the AI content strategy…" |
| 04 | Development & Deployment | "We build, fine-tune, integrate, and deploy the generative AI system…" |
| 05 | ROI Tracking & Optimisation | "We track output quality and throughput against the original ROI model…" |

#### 2.3h — Section 10: Why CodimAI (`.section--soft`, `.why-codimai__inner`)

Copy verbatim from `agentic-ai.html` lines 489–558.

Update:
- H2: `Built for output that earns its place`
- Lead: `Generative AI only works if the output is usable. CodimAI designs systems around your standards — not a generic model's defaults — and measures every deployment against business outcomes.`
- 6 `.why-row` items: titles identical; bodies from `content.md` Why CodimAI items 01–06 (content-specific copy)

#### 2.3i — Section 11: FAQ (`.section`, id="faq")

Copy structure from `agentic-ai.html` lines 564–633.

Replace all 6 Q&A pairs with content from `content.md` FAQ block verbatim.

#### 2.3j — Closing CTA + Footer (`.closing-screen.cd-block-dark`)

Copy verbatim from `agentic-ai.html` lines 638–703.

Update CTA copy:
```
Eyebrow:  Get Started
H2:       Get a free Business & ROI Audit
Body:     Find out exactly which content workflows generative AI can accelerate
          in your organisation — and what that acceleration is worth — before
          you commit to any development.
Button:   <a href="../get-started.html" class="cd-btn-primary">Book your audit</a>
```

#### 2.3k — Script tags (bottom of `<body>`)

```html
<script>
  var el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
</script>

<script src="../assets/js/nav.js" defer></script>
<script src="../assets/js/reveal.js" defer></script>
<script src="../assets/js/generative-hero.js" defer></script>
<script src="../assets/js/process-scroll.js" defer></script>
```

---

### Step 2.4 — Fix stale links in `partials/header.html`

Two occurrences of `/ai.html#generative` → `/ai/generative.html`:
- Line 22: desktop nav dropdown `<a>` href
- Line 72: mobile overlay `<a>` href

---

### Step 2.5 — Fix stale links in `blogs/includes/header.php`

Two occurrences of `/ai.html#generative` → `/ai/generative.html`:
- Line 16: desktop nav dropdown `<a>` href
- Line 53: mobile overlay `<a>` href

---

## 3. Self-check (run before declaring Stage 4 done)

- [ ] `ai/generative.html` is valid HTML (no unclosed tags, correct nesting)
- [ ] Single `<h1>` on the page
- [ ] Heading hierarchy: H1 → H2 (mission hidden h2) → H2 (use-cases) → H3 (cards) → H2 (benefits) → H3 (cards) → H2 (process steps, 5×) → H2 (why) → H3 (rows) → H2 (faq) → H2 (cta). No skips.
- [ ] `aria-current="page"` is on the Generative nav link (not Agentic AI)
- [ ] Zero literal hex values in `generative.html` — all `var(--cd-*)` or inline `style` from the approved pattern
- [ ] Canvas animation renders on load; nodes and zones are visible; pulses travel left-to-right
- [ ] Canvas pauses on tab hidden, resumes on focus
- [ ] Hero CTA "See the process" scrolls to `#use-cases` (which is the first in-page anchor before process steps)
- [ ] Hero CTA secondary anchor target (`#use-cases`) exists on the page
- [ ] 6 use case cards display correctly in 3-col grid (desktop) → 2-col (tablet) → 1-col (mobile)
- [ ] 4 benefit cards display in 2-col grid (desktop) → 1-col (mobile)
- [ ] Process scroll `.process-step-section` sections snap correctly (`.is-in-view` class added by `process-scroll.js`)
- [ ] `process-scroll.js` loaded — SVG draw animations trigger on scroll into view
- [ ] Why CodimAI section: 6 rows visible, left/right columns correct
- [ ] FAQ accordion opens/closes on click; keyboard-accessible (Enter/Space on summary)
- [ ] Closing CTA copy matches content.md exactly
- [ ] JSON-LD: `WebPage`, `BreadcrumbList` (3-item), `FAQPage` (6 Q&A) all present
- [ ] `partials/header.html` updated (no `ai.html#generative` remaining)
- [ ] `blogs/includes/header.php` updated (no `ai.html#generative` remaining)
- [ ] Mobile (360px): no horizontal overflow; hero stacks correctly; process steps readable
- [ ] Tablet (768px): use-cases 2-col, benefits 1-col; hero single column

---

## 4. Files to stage for commit

```
git add ai/generative.html
git add assets/js/generative-hero.js
git add partials/header.html
git add blogs/includes/header.php
git add .claude/pages/generative/
```

---

## 5. Commit message (do not commit until Stage 5 approval)

```
feat(pages): add generative AI page

- Complete generative.html page: hero with canvas animation,
  statement, use cases (6), business benefits (4), 5-step process,
  Why CodimAI, FAQ, and closing CTA
- New generative-hero.js canvas: content-pipeline concept
  (Input nodes → AI Engine → Output nodes) with bezier edges and
  animated pulses
- Fixed stale /ai.html#generative links in partials/header.html
  and blogs/includes/header.php
- Content, spec, and plan in .claude/pages/generative/
```

---

## 6. Out of scope for this PR

- OG image asset (`og-generative.webp`) — placeholder canonical URL in meta; asset to be added when imagery is provided
- `sitemap.xml` — no sitemap exists yet in the repo
- Backend form handling on `get-started.html` — separate PR
- Remaining AI sub-pages (Insights, Recommendation, Prediction, Data Analytics) — separate page builds
