---
name: codimai-design
description: Apply CodimAI's design and layout system — section composition, hero patterns, grid + card patterns, navigation, footer, the seven approved UI moments, interaction states, motion, and responsive rules. Use this whenever you are deciding how a CodimAI page or component is laid out, structured, or animated — distinct from codimai-brand (which is colors, fonts, tokens) and codimai-content (which is words). Trigger for any "build this page", "design this section", "lay out this component", or "how should this card behave on hover" request. Read codimai-brand alongside for tokens; this skill never duplicates color or font values.
---

# CodimAI — Design System

This is the layout and composition authority. Brand tokens live in `codimai-brand` and are referenced via CSS variables (`var(--cd-*)`) — never duplicated here. Content rules live in `codimai-content`. This skill answers: *where does it go, how does it behave, when does it move.*

## Scroll-snap rule (all pages)

Every full-screen section must have `scroll-snap-align: start` + `min-height: 100vh` so each scroll = one complete screen. This is already applied globally to `.hero`, `.hero--page`, `.mission`, `.section`, `.capabilities`, `.agents`, `.blog-preview`, `.closing-screen` in `components.css`. Any new section class must add both.

```css
.my-new-section {
  min-height: 100vh;
  min-height: 100svh;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
}
```

Global snap is enabled via `html { scroll-snap-type: y mandatory; }`. Mobile degrades to `proximity` at ≤768px.

## The one design principle

**Imagery and typography carry the page. UI chrome stays quiet.** If a screen looks busy in grayscale (before imagery), it's wrong — strip components, don't add color.

## The seven UI moments (the complete approved list)

Classic ≠ boring. Craft shows up in these seven places only. Anything outside this list is off-brand.

1. **The hero image** — full-bleed or near-full-width 3D-world render. Where 90% of the visual interest lives.
2. **Scroll-reveal fades** — opacity 0 → 1 over 400–600ms as element enters viewport. No translate, no bounce. One `IntersectionObserver` for the whole page.
3. **Sticky nav hairline** — nav is transparent at top, gains a 1px `var(--cd-border)` bottom border after 8px scroll.
4. **Dropdown panels** — soft fade-in on hover/focus. Hairline border, 12px radius, no drop shadow.
5. **Card hover** — border tone steps from `var(--cd-border)` to `var(--cd-border-strong)`. **No transforms, no shadows, no scale.**
6. **Mono numbered labels** — small `01 / 02 / 03` in JetBrains Mono above each card title. Does most of the editorial work.
7. **One dark closing block** — `var(--cd-ink-block)` section used exactly once per page, near the end, as punctuation.

Forbidden anywhere: gradients on backgrounds, glow shadows, neon, parallax, scroll-jacking, animated SVG blobs, marquee logos, testimonial sliders, video heroes with autoplay, more than two CTAs per hero, drop shadows on cards, customer-logo bars on the home page, emoji.

## Page composition pattern

Every CodimAI page composes from the same primitives:

```
<header class="nav">                  ← shared partial
<main>
  <section class="hero">              ← always first, always centered, always 1 image below
  <section class="section--statement">← optional; one big serif sentence
  <section class="section">           ← repeat as needed; alternate .section--soft
  <section class="section--dark">     ← exactly once, near the end
</main>
<footer class="footer">               ← shared partial
```

Section padding: `120px` top/bottom desktop, `88px` mobile. Statement section uses extra `padding: 140px` to feel like punctuation.

## Container

One container, used everywhere. `max-width: 1180px; margin: 0 auto; padding: 0 24px;` (desktop) / `0 20px` (mobile).

## Hero composition (the highest-leverage decision)

Stack, top to bottom, centered:

1. **Eyebrow** — JetBrains Mono 12px, uppercase, letter-spacing 0.12em, color `var(--cd-muted)`. Margin-bottom 28px.
2. **Headline** — Gilda Display 400, `clamp(44px, 7vw, 84px)`, line-height 1.06, max-width 880px, color `var(--cd-ink)`. Margin-bottom 24px.
3. **Sub** — Inter 18–19px, line-height 1.6, max-width 580px, color `var(--cd-body)`. Margin-bottom 36px.
4. **CTAs** — primary + secondary, gap 14px, centered. Flex-wrap on mobile.
5. **Hero image** — margin-top 72px, 12px radius, 1px hairline border. Aspect 16:7 desktop / 4:5 mobile.

Hero section padding: `96px` top / `96px` bottom. Generous, on purpose.

## Section pattern

Every non-hero section uses this pattern:

```html
<section class="section [section--soft|section--dark]">
  <div class="container">
    <header class="section__head">
      <p class="eyebrow">// LABEL</p>
      <h2 class="display section__title">Headline as a statement.</h2>
    </header>
    <!-- grid / list / cards / etc. -->
  </div>
</section>
```

Section title: `clamp(34px, 4.6vw, 52px)`. `section__head` max-width 760px, margin-bottom 56px.

## Grid + cards

One card primitive, reused everywhere.

```css
.grid { display: grid; gap: 24px; }
.grid--3 { grid-template-columns: repeat(3, 1fr); }
.grid--2 { grid-template-columns: repeat(2, 1fr); }

.card {
  background: var(--cd-surface);
  border: 1px solid var(--cd-border);
  border-radius: var(--cd-radius);
  padding: 28px;
  display: flex; flex-direction: column; gap: 10px;
  transition: border-color .2s ease;
}
.card:hover { border-color: var(--cd-border-strong); }
.card__num   { font-family: var(--cd-font-mono); font-size: 12px; color: var(--cd-muted); letter-spacing: .06em; text-transform: uppercase; }
.card__title { font-family: var(--cd-font-display); font-weight: 400; font-size: 22px; color: var(--cd-ink); line-height: 1.18; }
.card__body  { font-size: 14.5px; color: var(--cd-body); }
```

Card modifiers: `.card--wide` (padding 32px, title 24px) for 2-column grids.

## Post list (blog teasers, research)

Use a hairline-divided `<ul>` instead of cards when items are mostly text:

```css
.post-list { list-style: none; border-top: 1px solid var(--cd-border); }
.post      { border-bottom: 1px solid var(--cd-border); }
.post__link{ display: grid; grid-template-columns: 200px 1fr; gap: 24px; align-items: baseline; padding: 28px 0; transition: padding-left .25s ease; }
.post__link:hover { padding-left: 8px; }       /* one of the seven UI moments */
.post__meta { font-family: var(--cd-font-mono); font-size: 12px; color: var(--cd-muted); text-transform: uppercase; }
.post__title{ font-family: var(--cd-font-display); font-weight: 400; font-size: 24px; color: var(--cd-ink); line-height: 1.2; }
```

## Navigation

Sticky, transparent at top, hairline on scroll. Logo left (serif), links center, primary CTA right. Two dropdowns (`AI`, `Agents`) reveal soft panels on hover and focus. Mobile: hamburger opens a full-screen overlay (warm-white, serif headings, fade-in only).

Dropdown panel: `min-width: 220px; background: var(--cd-surface); border: 1px solid var(--cd-border); border-radius: var(--cd-radius); padding: 12px;`. Items get 8px padding and soft hover background `var(--cd-soft)`.

Keyboard accessibility is required: `aria-expanded`, focus-visible state, Esc closes, Tab cycles correctly.

## Footer

Two-column grid (1:2). Left: serif logo + © line. Right: three columns of small links (Product / Company / Legal). Single `1px` top border. No social-icon row by default — keep it editorial.

## Interaction states (the only ones allowed)

- **Hover on text link:** color shifts from `var(--cd-body)` to `var(--cd-ink)`. No underline change.
- **Hover on card:** border tone change (above). Nothing else.
- **Hover on button:** primary = opacity 0.86. Secondary = border color `var(--cd-ink)`.
- **Focus visible:** 2px outline in `var(--cd-ink)` with 2px offset. Required on every interactive element.
- **Active (pressed):** none. Keep buttons calm.

## Motion principles

- Only opacity transitions on reveal. No translateY, no scale, no rotate.
- Duration 400–600ms, ease-out.
- Hover transitions 200ms.
- No motion below 8px scroll (avoid jitter at page top).
- Respect `prefers-reduced-motion: reduce` → disable all reveals, instant opacity 1.

## Responsive rules

- Desktop ≥ 1024px: full grid as designed.
- Tablet 640–1023px: 3-column grids become 2-column; hero headline drops to 56px.
- Mobile < 640px: single column everywhere; nav collapses to hamburger; hero headline `44–48px`; section padding `88px`.
- All touch targets ≥ 44×44px.
- Test breakpoints: 360 / 768 / 1280.

## File layout (where this code lives)

```
assets/css/
  tokens.css       ← from codimai-brand (DO NOT duplicate values)
  base.css         ← reset, body, typography, container
  components.css   ← .nav, .btn, .card, .post-list, .section, .footer
  page-[slug].css  ← per-page overrides only when truly page-unique
assets/js/
  nav.js           ← sticky hairline + dropdown + mobile menu
  reveal.js        ← one IntersectionObserver for [data-reveal]
```

DRY rule: no `.section`, `.btn`, `.card`, or `.container` styles in `page-*.css`. If a page needs something not in `components.css`, add it to `components.css` as a modifier and reuse it.

## Section catalogue (the approved section types)

When laying out a new page, compose from these. Don't invent new section types unless you have a strong reason.

| Section | When to use | Layout |
| --- | --- | --- |
| **Hero — home** | Home page only | Full-screen (`min-height: 100vh`), canvas animation, centered text |
| **Hero — interior** | All other pages | `.hero--page`: two-column grid (text \| canvas), `padding-block: 96px` |
| **Statement** | Page-defining sentence | One big serif line, centered, `.mission` component |
| **Capability grid** | 4–6 related items | `.grid--3` of `.cap-card`s with `__num` |
| **Process list** | Sequential numbered steps | `.process-list` > `.process-item` (mono num \| serif title + body) |
| **Feature pair** | 2–4 deeper features | `.grid--2` of `.card--wide` |
| **FAQ** | Bottom of every product/feature page | `.faq` > `.faq-item` (`<details>` accordion), hairline dividers |
| **Post list** | Blog teasers, research index | `.post-list` |
| **Closing dark CTA** | Exactly once, near end | `.site-cta` inside `.closing-screen.cd-block-dark`, serif h2 + one button |

## Interior page hero — standard pattern

All pages except Home use the two-column interior hero. This is not optional.

```html
<section class="hero hero--page" aria-labelledby="hero-heading">
  <div class="container hero__inner">

    <!-- Left: text -->
    <div class="hero__content">
      <p class="hero__eyebrow reveal">Eyebrow label</p>
      <h1 id="hero-heading" class="hero__title cd-display reveal">Headline</h1>
      <p class="hero__lede reveal">Sub-headline ≤ 25 words.</p>
      <div class="hero__actions reveal">
        <a href="get-started.html" class="cd-btn-primary">Primary CTA</a>
        <a href="#anchor" class="cd-btn-secondary">Secondary CTA</a>
      </div>
    </div>

    <!-- Right: concept-specific canvas animation -->
    <div class="hero--anim reveal" aria-hidden="true">
      <canvas id="[slug]-canvas" class="hero__anim-canvas"></canvas>
    </div>

  </div>
</section>
```

CSS (`components.css`):
```css
.hero--page { min-height: unset; padding-block: 96px; }
.hero--page .hero__inner { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.hero--page .hero__content { max-width: none; }
.hero--anim { position: relative; border-radius: var(--cd-radius); border: 1px solid var(--cd-border); background: var(--cd-surface); overflow: hidden; aspect-ratio: 5/4; }
.hero__anim-canvas { display: block; width: 100%; height: 100%; }
@media (max-width: 1023px) { .hero--page .hero__inner { grid-template-columns: 1fr; } .hero--anim { aspect-ratio: 16/7; } }
@media (max-width: 639px)  { .hero--page { padding-block: 72px; } .hero--anim { aspect-ratio: 4/3; } }
```

## Canvas animation per page

Each interior page's canvas animation lives in `assets/js/[slug]-hero.js` and must represent the page's specific concept.

**Design rules for canvas animations:**
- Background: `#F7F5F0` (brand canvas)
- Nodes: white fill (`#FFFFFF`), `rgba(26,26,24,0.22)` border, soft outer halo (`rgba(239,237,230,0.65)`)
- Edges: quadratic bezier curves, `rgba(26,26,24,0.13)` stroke, small arrowheads
- Pulses: `#1A1A18` filled dot (r ≈ 2–3.5px) with 3-ghost trailing dots
- Node labels: Inter 500, mono sub-label in JetBrains Mono
- Activation ring: expanding + fading arc on pulse arrival
- Section zone backdrops (if concept has layers): very faint filled rounded rects drawn with `arcTo` (not `ctx.roundRect`)
- Always pause on `visibilitychange: hidden`, resume on focus
- Scale all sizes with `W` (canvas pixel width) to stay responsive

**Agentic AI page canvas reference** (`agentic-hero.js`):
- 11 nodes across 5 layers: Intent → [Vision/Language/Audio/Sensors] → [Planner/Memory/Knowledge] → [Executor/Verifier] → Output
- 19 directed edges including a Verifier → Planner feedback loop
- 3 zone backdrops: `// PERCEPTION`, `// COGNITION`, `// DECISION`
- Pulses respawn on each edge individually after random 500–2100ms delay
