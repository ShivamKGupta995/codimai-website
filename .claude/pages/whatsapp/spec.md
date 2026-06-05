# Page spec  WhatsApp Agent

> Bridges approved `content.md` and the build. This is a **rebuild** of the existing minimal `agents/whatsapp.html` into a full product showcase. Anyone reading this file should be able to build the page without re-deciding anything.

## 1. Page metadata
- **Slug:** `/agents/whatsapp`
- **File:** `agents/whatsapp.html` (overwrite existing)
- **Page type:** Product / Feature
- **Primary keyword:** WhatsApp AI agent
- **Secondary keywords:** WhatsApp business automation, WhatsApp chatbot builder, WhatsApp message templates, WhatsApp catalog
- **Meta title:** `WhatsApp Business AI Agent  CodimAI` (35 chars)
- **Meta description:** `A WhatsApp agent that messages at scale, builds chat flows and forms, shows a product catalog, and plugs into any app. See it live on a phone.` (140 chars)
- **Canonical URL:** `https://codimai.com/agents/whatsapp.html`

## 2. Section map (content → design)

Each row is one full-screen, scroll-snapped section (`min-height: 100vh` + `scroll-snap-align: start`, already on the listed base classes).

| # | Section ID | Content source | Section type | Notes |
|---|------------|----------------|--------------|-------|
| 1 | `hero` | Hero | Interior hero `.hero--page` | Two-column: copy left, **unique canvas** `#whatsapp-canvas` right (`whatsapp-hero.js`). Click-to-expand popup like agentic. |
| 2 | `statement` | Statement | `.mission` | One serif line + `.mission__tail`. |
| 3 | `capabilities` | What you can do on WhatsApp | `.section.section--dense` + `.grid.grid--3` of 6 `.card` | Numbered 01–06: Unlimited messaging, Custom templates, Product catalog, Smart replies, Chat flows & forms, Connect any app. |
| 4 | `preview` | See it the way your customer does | **NEW** `.wa-preview` two-column: copy left, **animated phone** right | Signature moment. Phone runs a scripted WhatsApp conversation via `whatsapp-chat.js`. `.section--soft` background. |
| 5 | `builder` | Build conversations without code | `.section` + `.section__head` + `.process-list` (3 `.process-item`) | Map the journey → Wire it to your data → Preview and publish. |
| 6 | `integrations` | Connect it to anything you run | `.section.section--dense` + `.grid.grid--2` of 4 `.card` | Cards: CRM, E-commerce, Helpdesk, Internal dashboards. Lead paragraph in `.section__head`. |
| 7 | `how` | Grounded in your business | `.section.section--soft.section--dense` + `.process-list` (3) | Connect knowledge → Set guardrails → Go live on official API. |
| 8 | `faq` | FAQ | `.section` + `.faq` (`<details>` × 6) | Mirrors FAQPage JSON-LD exactly. |
| 9 | `closing` | Closing CTA + footer | `.closing-screen.cd-block-dark` > `.site-cta` + `.site-footer` | Exactly one dark block. Reused verbatim from current page. |

> Two `.process-list` sections (5 and 7) are intentional and read distinctly because of different surrounds (white vs soft) and different headings. No new pattern needed.

## 3. Components used (reuse map)

| Component | Source | New or reused? |
|-----------|--------|----------------|
| `.site-header`, `.nav-*`, `.nav-mobile-overlay` | components.css | reused (verbatim  current nav already marks WhatsApp `aria-current`) |
| `.hero.hero--page`, `.hero__inner/content/eyebrow/title/lede/actions` | components.css | reused |
| `.hero--anim`, `.hero__anim-canvas`, `.hero-anim-backdrop`, `.hero--anim__close`, `.hero--anim--expanded` | components.css | reused (canvas popup machinery) |
| `.mission`, `.mission__text`, `.mission__tail` | components.css | reused |
| `.section`, `--soft`, `--dense`, `.section__head/eyebrow/heading/lead` | components.css | reused |
| `.grid`, `.grid--3`, `.grid--2`, `.card`, `.card__num/title/body` | components.css | reused |
| `.process-list`, `.process-item`, `__num/title/body` | components.css | reused |
| `.faq`, `.faq-item`, `.faq-item__body` | components.css | reused |
| `.closing-screen`, `.cd-block-dark`, `.site-cta*`, `.site-footer*` | components.css | reused |
| `.cd-btn-primary`, `.cd-btn-secondary` | components.css (base) | reused |
| `.reveal` | components.css | reused |
| **`.wa-preview`, `.wa-preview__inner`, `.wa-preview__copy`** | components.css | **NEW**  two-column showcase wrapper (copy \| phone), collapses at ≤1023px |
| **`.wa-phone`, `.wa-phone__notch`, `.wa-phone__bar`, `.wa-phone__avatar`, `.wa-phone__name`, `.wa-phone__sub`, `.wa-phone__thread`** | components.css | **NEW**  device frame + chat header |
| **`.wa-msg`, `.wa-msg--in`, `.wa-msg--out`, `.wa-msg__time`, `.wa-typing` (3 dots)** | components.css | **NEW**  chat bubbles + typing indicator |
| **`.wa-quick`, `.wa-quick__btn`** | components.css | **NEW**  quick-reply button row |
| **`.wa-catalog`, `.wa-catalog__img`, `.wa-catalog__name`, `.wa-catalog__price`** | components.css | **NEW**  in-chat product catalog card |
| **`.wa-formcard`, `.wa-formcard__row`** | components.css | **NEW**  in-chat form card preview |

All NEW classes added to `components.css` (not a page CSS file) per DRY rule.

## 4. Brand tokens used

Only existing tokens from `tokens.css`. **No new tokens invented.**

- Backgrounds: `--cd-canvas`, `--cd-surface`, `--cd-soft`, `--cd-ink-block`
- Text: `--cd-ink`, `--cd-body`, `--cd-muted`, `--cd-on-dark`
- Borders: `--cd-border`, `--cd-border-strong`
- Radius: `--cd-radius`, `--cd-radius-sm` (+ phone uses a larger composed radius from these where needed)
- Fonts: `--cd-font-display`, `--cd-font-body`, `--cd-font-mono`

**Phone colour decision (on-brand, no green):** to honour the brand's near-monochrome rule and avoid inventing a colour, the phone is editorial warm-neutral:
- Phone shell: `--cd-ink-block` frame, `--cd-canvas` screen.
- Incoming bubble (`--in`): `--cd-surface` fill, `--cd-border` hairline, `--cd-body` text.
- Outgoing bubble (`--out`): `--cd-ink-block` fill, `--cd-on-dark` text (reads as "you/agent").
- Quick-reply buttons: transparent with `--cd-border` + `--cd-ink` text.
- This reads unmistakably as a chat without neon WhatsApp green. *If the client wants literal WhatsApp green, that requires one new accent token  flagged at the gate, not assumed.*

## 5. Responsive behavior

- **Desktop ≥ 1024px:** capabilities `grid--3` (6 → 3×2); integrations `grid--2` (4 → 2×2); `.wa-preview__inner` two columns (copy | phone), phone max-width ~340px, sticky-centered.
- **Tablet 640–1023px:** `grid--3` → 2 columns; `.wa-preview__inner` stacks to single column (copy above, phone centered below); hero collapses to single column (canvas below copy) per `.hero--page` rule.
- **Mobile < 640px:** all grids single column; phone scales to max-width 300px, centered; section padding `88px`; hero canvas aspect 4/3.
- Touch targets ≥ 44×44px (quick-reply buttons sized accordingly).
- `prefers-reduced-motion: reduce` → phone chat shows the **final** completed conversation statically (no typing animation); hero canvas pulses disabled; reveals instant.
- Test breakpoints: 360 / 768 / 1280.

## 6. SEO + schema

- `<title>`: `WhatsApp Business AI Agent  CodimAI`
- `<meta name="description">`: as in §1.
- `<link rel="canonical">`: `https://codimai.com/agents/whatsapp.html`
- Open Graph: `og:type=website`, `og:site_name`, `og:url`, `og:title`, `og:description`, `og:image=https://codimai.com/assets/img/og-default.png` (existing asset; no new image needed since the visual is canvas/CSS).
- Twitter Card: `summary_large_image` (title, description, image as OG).
- **JSON-LD blocks (single `@graph`):**
  - [ ] `Organization`  no (Home only)
  - [x] `WebPage`  name/description/url/datePublished `2026-06-04`/publisher
  - [x] `BreadcrumbList`  Home → Agents → WhatsApp
  - [x] `FAQPage`  all 6 Q&A from content.md verbatim
  - [ ] `BlogPosting`  no

## 7. Internal links

| From section | To page | Anchor text |
|--------------|---------|-------------|
| Capabilities (Smart replies card body or lead) | `../ai/agentic-ai.html` | "agentic AI capabilities" |
| Integrations lead | `../ai/data-analytics.html` | "data analytics" |
| Builder / preview copy | `../get-started.html` | "Book a free audit" (CTA) |
| Nav + footer | siblings: email, google-review, blogs-agent; AI pages; blogs; get-started | reused chrome |

## 8. Imagery

No raster imagery required  the two visuals are generated:
| Slot | Description | Source | Alt / a11y |
|------|-------------|--------|------------|
| Hero right | WhatsApp routing graph (inbound contacts → agent node → Reply/Template/Catalog/Flow/Form/CRM) | `<canvas>` via `whatsapp-hero.js` | container `aria-hidden="true"` (decorative) |
| Preview right | Scripted WhatsApp conversation (greeting → quick replies → catalog card → form) | CSS `.wa-phone` + `whatsapp-chat.js` | phone has `role="img"` + `aria-label` describing the demo; live region not needed |
| OG image | reuse `assets/img/og-default.png` | existing |  |

## 9. JavaScript

| File | New/Reused | Purpose |
|------|-----------|---------|
| `assets/js/nav.js` | reused | nav hairline + dropdown + mobile |
| `assets/js/reveal.js` | reused | `.reveal` IntersectionObserver |
| `assets/js/whatsapp-hero.js` | **NEW** | hero canvas graph; scales all sizes by `W`; pause on `visibilitychange`; click-to-expand popup (same machinery as `agentic-hero.js`) |
| `assets/js/whatsapp-chat.js` | **NEW** | phone scripted conversation: typing indicator → bubbles → quick replies → catalog → form, looping; starts on IntersectionObserver enter, pauses on hidden tab; respects `prefers-reduced-motion` (renders final state, no loop) |

`process-scroll.js` is **not** needed (no `.process-step-section` heavy steps used; plain `.process-list` instead).

### Hero canvas concept (`whatsapp-hero.js`)  v2, "growth through conversations"
> Revised after build: the first node-graph version read too much like the other agent pages. Replaced with a business-growth visual that is distinct and customer-facing.
- **Growth chart that draws itself:** a smooth (Catmull-Rom) upward-trending curve from lower-left to upper-right, with a soft WhatsApp-green area fill, drawn progressively left→right on a loop (≈5.4s draw, 1.3s hold, reset).
- **Climbing message bubbles:** small white WhatsApp chat bubbles (tail + green double-tick) pop in at three data points as the curve passes them.
- **Live counter chip (top-left):** "conversations / mo" counts up to ~1,240 with a green `▲ %` as the curve climbs.
- Faint gridlines + mono baseline label `// GROWTH IN CONVERSATIONS`. Glowing green head dot travels the line.
- Palette: BG `#F7F5F0`, ink `#1A1A18`, muted `#86847C`, surface `#FFFFFF`, accent WhatsApp green `#1FA855` + soft green fill  warm canvas with a single green accent tying it to WhatsApp. (Canvas JS uses literals, mirroring the existing hero-JS precedent.)
- Still follows guideline: unique per-page canvas, no hero image, all sizes scale with `W`, pauses on hidden tab, click-to-expand popup, `prefers-reduced-motion` renders the final static state.

## 10. Definition of done for this page
- [ ] Every content chunk mapped to a section (9 sections above)
- [ ] Every section uses an existing component or a flagged NEW one (all `.wa-*` flagged)
- [ ] All CSS tokens reference existing variables; no invented colour (phone is monochrome)
- [ ] Responsive at 360 / 768 / 1280; phone + grids stack correctly
- [ ] SEO + schema complete (WebPage + BreadcrumbList + FAQPage)
- [ ] Internal links resolve to real pages
- [ ] Single `<h1>` (hero), logical h2/h3, semantic landmarks
- [ ] `prefers-reduced-motion` handled for both canvas and phone
- [ ] DRY: NEW classes live in `components.css`, not inline/page CSS
