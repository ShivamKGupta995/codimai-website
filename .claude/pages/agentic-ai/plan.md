# Dev plan  Agentic AI page

> File-by-file, step-by-step plan for building this page. Each step is small enough to verify in isolation.

## 0. Pre-flight

- [x] `content.md` is approved
- [x] `spec.md` is approved
- [ ] Branch `page/agentic-ai` created at Step 1

---

## 1. Files to create / modify

| # | File | Action | Why |
|---|------|--------|-----|
| 1 | `agentic-ai.html` | **CREATE** | The standalone Agentic AI page |
| 2 | `assets/css/components.css` | **MODIFY** | Add 3 new component blocks: `.process-list/.process-item`, `.faq/.faq-item`, `.cap-card--plain` |
| 3 | `index.html` | **MODIFY** | Update 4 `ai.html#agentic-ai` links → `agentic-ai.html` (nav, mobile nav, cap-card, footer) |
| 4 | `404.html` | **MODIFY** | Update 3 `ai.html#agentic-ai` links → `agentic-ai.html` (nav, mobile nav, footer) |

No `page-agentic-ai.css` needed  all styles go into `components.css` as reusable modifiers.

---

## 2. Build steps (in order)

### Step 2.1  Branch

```bash
git checkout -b page/agentic-ai
```

### Step 2.2  New CSS components (components.css)

Append **three new blocks** at the end of `components.css`, in this order:

#### Block A  `.cap-card--plain` modifier
```css
/* Suppress arrow on plain differentiator cards */
.cap-card--plain .cap-card__arrow { display: none; }
```

#### Block B  `.process-list` / `.process-item`
```css
.process-list {
  list-style: none;
  border-top: 1px solid var(--cd-border);
  margin-top: 56px;
}

.process-item {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 32px;
  align-items: start;
  padding: 36px 0;
  border-bottom: 1px solid var(--cd-border);
}

.process-item__num {
  font-family: var(--cd-font-mono);
  font-size: 13px;
  color: var(--cd-muted);
  letter-spacing: .08em;
  text-transform: uppercase;
  padding-top: 6px;
}

.process-item__title {
  font-family: var(--cd-font-display);
  font-weight: 400;
  font-size: 22px;
  color: var(--cd-ink);
  line-height: 1.2;
  margin-bottom: 10px;
}

.process-item__body {
  font-size: 15px;
  color: var(--cd-body);
  line-height: 1.65;
}

/* Tablet */
@media (max-width: 1023px) {
  .process-item { grid-template-columns: 56px 1fr; gap: 24px; }
}

/* Mobile */
@media (max-width: 639px) {
  .process-item { grid-template-columns: 1fr; gap: 8px; }
  .process-item__num { padding-top: 0; }
}
```

#### Block C  `.faq` / `.faq-item`
```css
.faq {
  max-width: 760px;
  margin: 56px auto 0;
  border-top: 1px solid var(--cd-border);
}

.faq-item {
  border-bottom: 1px solid var(--cd-border);
}

.faq-item summary {
  font-family: var(--cd-font-display);
  font-size: 19px;
  color: var(--cd-ink);
  padding: 22px 0;
  cursor: pointer;
  list-style: none;
  line-height: 1.3;
}

.faq-item summary::-webkit-details-marker { display: none; }

.faq-item[open] summary { color: var(--cd-ink); }

.faq-item__body {
  font-size: 15px;
  color: var(--cd-body);
  line-height: 1.65;
  padding-bottom: 22px;
}

@media (max-width: 639px) {
  .faq-item summary { font-size: 17px; }
}
```

---

### Step 2.3  Create `agentic-ai.html` scaffold

Create the file with:
- `<!DOCTYPE html>` + `<html lang="en">`
- Full `<head>` (see Step 2.4)
- Shared `<header>` nav (copy verbatim from `index.html` lines 70–116, then update active state: add `aria-current="page"` to "AI" button)
- Shared mobile overlay (copy verbatim from `index.html` lines 118–139, updating agentic-ai link)
- `<main id="main-content">` placeholder
- Shared footer + `closing-screen` (copy verbatim from `index.html` lines 390–end)
- Script tags (Step 2.8)

---

### Step 2.4  `<head>` (SEO + fonts + schema)

```html
<title>Agentic AI Solutions for Business  CodimAI</title>
<meta name="description" content="CodimAI builds custom agentic AI systems grounded in a proven five-step process  starting with a free Business &amp; ROI Audit before a line of code is written.">
<link rel="canonical" href="https://codimai.com/agentic-ai">

<!-- Open Graph -->
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://codimai.com/agentic-ai">
<meta property="og:title"       content="Agentic AI Solutions for Business  CodimAI">
<meta property="og:description" content="CodimAI builds custom agentic AI systems grounded in a proven five-step process  starting with a free Business &amp; ROI Audit before a line of code is written.">
<meta property="og:image"       content="https://codimai.com/assets/img/og-agentic-ai.webp">

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="Agentic AI Solutions for Business  CodimAI">
<meta name="twitter:description" content="CodimAI builds custom agentic AI systems grounded in a proven five-step process  starting with a free Business &amp; ROI Audit before a line of code is written.">
<meta name="twitter:image"       content="https://codimai.com/assets/img/og-agentic-ai.webp">
```

**JSON-LD blocks (three, inline in `<head>`):**

1. `WebPage`  name, description, url, datePublished
2. `BreadcrumbList`  Home → AI → Agentic AI
3. `FAQPage`  6 Q&A items from content.md

---

### Step 2.5  Hero section

Use the same markup pattern as `index.html` hero. No canvas  replace with a `<div class="hero__img-wrap">` containing an `<img>` (hero-agentic-ai.webp or placeholder `<div>`).

```
Eyebrow:  AGENTIC · AUTONOMOUS · ROI-FIRST
H1:       AI agents built around your business
Lede:     CodimAI designs and deploys agentic AI systems…
CTA 1:    <a href="get-started.html" class="cd-btn-primary">Book your free audit</a>
CTA 2:    <a href="#process" class="cd-btn-secondary">See how it works</a>
```

---

### Step 2.6  Statement section

```html
<section class="mission" aria-labelledby="statement-heading">
  <h2 id="statement-heading" class="visually-hidden">Our approach</h2>
  <div class="container">
    <p class="mission__text reveal">
      Every CodimAI engagement starts with a business question.
      <span class="mission__tail">We answer it  with evidence  before we build anything.</span>
    </p>
  </div>
</section>
```

---

### Step 2.7  The CodimAI Process section (id="process")

```html
<section id="process" class="section" aria-labelledby="process-heading">
  <div class="container">
    <header class="section__head reveal">
      <p class="section__eyebrow">// THE PROCESS</p>
      <h2 id="process-heading" class="section__heading">Five steps from opportunity to measurable result</h2>
      <p class="section__lead">CodimAI's delivery process is built around your business, not around technology…</p>
    </header>
    <ol class="process-list">
      <!-- 5 .process-item rows, verbatim from content.md, steps 01–05 -->
      <!-- Each: <li class="process-item reveal"> -->
      <!--   <span class="process-item__num">01</span> -->
      <!--   <div> -->
      <!--     <h3 class="process-item__title">Business Audit</h3> -->
      <!--     <p class="process-item__body">We analyse your workflows…</p> -->
      <!--   </div> -->
      <!-- </li> -->
    </ol>
  </div>
</section>
```

---

### Step 2.8  Why CodimAI section (soft background)

```html
<section id="why-codimai" class="section section--soft" aria-labelledby="why-heading">
  <div class="container">
    <header class="section__head reveal">
      <p class="section__eyebrow">// WHY CODIMAI</p>
      <h2 id="why-heading" class="section__heading">Built for impact, not for novelty</h2>
      <p class="section__lead">We do not build AI for the sake of AI…</p>
    </header>
    <div class="capabilities__grid">
      <!-- 6 .cap-card.cap-card--plain items, verbatim from content.md differentiators 01–06 -->
    </div>
  </div>
</section>
```

---

### Step 2.9  FAQ section

```html
<section id="faq" class="section" aria-labelledby="faq-heading">
  <div class="container">
    <header class="section__head reveal">
      <p class="section__eyebrow">// FAQ</p>
      <h2 id="faq-heading" class="section__heading">Common questions</h2>
    </header>
    <dl class="faq">
      <!-- 6 .faq-item <details> blocks, verbatim Q&A from content.md -->
      <!-- Each: <details class="faq-item reveal"> -->
      <!--   <summary>Question text</summary> -->
      <!--   <p class="faq-item__body">Answer text</p> -->
      <!-- </details> -->
    </dl>
  </div>
</section>
```

---

### Step 2.10  Closing dark CTA

Reuse the `.closing-screen` + `.site-cta` pattern from `index.html` verbatim, updating copy:

```
Eyebrow:  Get Started
H2:       Get a free Business & ROI Audit
Body:     Find out exactly where agentic AI will create value…
Button:   <a href="get-started.html" class="cd-btn-primary">Book your audit</a>
```

---

### Step 2.11  JS (script tags)

At bottom of `<body>`, with `defer`:
```html
<script src="assets/js/nav.js" defer></script>
<script src="assets/js/reveal.js" defer></script>
```

No page-specific JS needed.

---

### Step 2.12  Update nav links in `index.html` (4 occurrences)

Change `ai.html#agentic-ai` → `agentic-ai.html` at these exact locations:

| Line (approx) | Context | Change |
|---|---|---|
| 83 | Desktop nav dropdown  "Agentic AI" `<a>` | `href="agentic-ai.html"` |
| 123 | Mobile overlay submenu  "Agentic AI" `<a>` | `href="agentic-ai.html"` |
| 210 | Home capabilities card  `.cap-card` link | `href="agentic-ai.html"` |
| 420 | Footer  "Agentic AI" link | `href="agentic-ai.html"` |

---

### Step 2.13  Update nav links in `404.html` (3 occurrences)

Change `ai.html#agentic-ai` → `agentic-ai.html`:

| Line (approx) | Context |
|---|---|
| 75 | Desktop nav dropdown |
| 115 | Mobile overlay submenu |
| 213 | Footer |

---

## 3. Self-check (run before declaring Stage 4 done)

- [ ] `agentic-ai.html` validates (W3C or browser devtools  no unclosed tags)
- [ ] Single `<h1>` on the page
- [ ] Heading hierarchy: H1 → H2 → H3 (no skips)
- [ ] No hex values outside `tokens.css`
- [ ] All `var(--cd-*)` tokens resolve (no typos)
- [ ] `data-reveal` on all major section headers and cards
- [ ] Hero CTA "See how it works" scrolls to `#process`
- [ ] All buttons/links have visible focus ring (`:focus-visible`)
- [ ] Mobile view at 360px: process items stack cleanly, no overflow
- [ ] Tablet view at 768px: 3-col grid drops to 2-col
- [ ] Nav "Agentic AI" link updated in `index.html` and `404.html` (all occurrences)
- [ ] JSON-LD: `WebPage`, `BreadcrumbList`, `FAQPage` blocks present and valid

---

## 4. Files to stage for commit

```
git add agentic-ai.html
git add assets/css/components.css
git add index.html
git add 404.html
git add .claude/pages/agentic-ai/
```

---

## 5. Commit message (do not commit until Stage 5 approval)

```
feat(pages): add standalone agentic-ai page

- New page at /agentic-ai with hero, statement, CodimAI Process
  (5 steps), Why CodimAI (6 differentiators), FAQ, and closing CTA
- Added .process-list/.process-item, .faq/.faq-item, .cap-card--plain
  to components.css
- Updated Agentic AI nav link in index.html and 404.html
- Content, spec, and plan in .claude/pages/agentic-ai/
```

---

## 6. Out of scope for this PR

- `ai.html` and its remaining sections (Generative, Insights, Recommendation, Prediction, Data Analytics)  separate page builds
- Hero image / OG image assets (`hero-agentic-ai.webp`, `og-agentic-ai.webp`)  placeholder `<div>` used until assets are provided
- `sitemap.xml`  no sitemap exists yet in the repo; will be created when the full site IA is built
- Backend form handling on `get-started.html`  separate PR
