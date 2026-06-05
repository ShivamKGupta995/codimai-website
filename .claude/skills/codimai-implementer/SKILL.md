---
name: codimai-implementer
description: Implement code changes on the CodimAI website the right way  features, edits, fixes, refactors, and new components on the static HTML/CSS/JS site. Use whenever you are about to WRITE or MODIFY code in this repo and want it to land correctly the first time: adding a section or component, wiring JS, editing shared chrome, touching CSS, fixing a bug, or refactoring. Enforces the engineering contract in CLAUDE.md §7 (DRY, tokens-only CSS, semantic + accessible HTML, progressive enhancement, no build step) and runs the implement → test → audit loop. Distinct from codimai-page-builder (which orchestrates a whole NEW page through gated stages)  this skill is the hands-on discipline for any change, large or small. Pair with codimai-brand/design/content for the what; this skill is the how.
---

# CodimAI  Implementer

This is the **how-to-write-the-code** skill. When you are about to edit or add code in this repo, follow this discipline so the change is DRY, accessible, on-brand, and ships without breaking the gate. It is the connective tissue between deciding *what* to build (brand/design/content) and proving it works (testing/audit).

## The loop (always)

1. **Locate the one source.** Before writing anything, find where this concern already lives. Nav/header/footer, button/card styles, section wrapper, color/font tokens, dropdown/reveal/form JS  each exists **once**. You compose or extend it; you never re-declare it. If you're about to paste markup or a hex value that exists elsewhere, stop  reuse it.
2. **Match the surrounding code.** Class naming, indentation, comment density, file organization  read the neighbouring file first and mirror it. Consistency beats cleverness.
3. **Implement** against the rules below.
4. **Test** with `codimai-testing` (`scripts/test_site.py`)  links, structure, meta, JSON-LD, a11y, DRY drift must stay green.
5. **Audit** SEO/GEO with `codimai-seo-geo-audit` (`scripts/audit.py <file>`) if the change touches content, meta, or structure.
6. Only then is it done. Re-run after fixes; never declare done with a failing suite.

## Hard rules (CLAUDE.md §7, enforced)

**CSS**
- No literal hex/font/shadow values anywhere except `tokens.css`. Everything else uses `var(--cd-…)`. If a token is missing, add it to `tokens.css` first, then reference it.
- No `!important`. Use specificity and the existing layer order (`tokens → base → components`).
- Mobile-first; layout with Flexbox/Grid; respect the scroll-snap one-section-per-screen pattern (`.section { min-height: 100vh }`, `html { scroll-snap-type: y mandatory }` with the mobile `proximity` fallback). New full-screen sections opt into snapping; content must fit one viewport.
- Reuse the `.section` pattern (eyebrow + serif heading + body + optional imagery) rather than bespoke markup per item.

**HTML**
- Semantic landmarks (`<header><nav><main><section><article><footer>`), exactly one `<h1>` per page, no skipped heading levels.
- Every page composes the **shared** header/footer  never a hand-rewritten copy. In static HTML the chrome is duplicated by necessity, so any nav/footer change must be applied to **every** page identically (only depth-relative paths and the `aria-current` active state may differ). Run the DRY-drift test after.
- Imagery: `alt` on everything (decorative = `alt=""`), explicit `width`/`height` to avoid CLS, `loading="lazy"` below the fold, WebP/AVIF.
- Per-page SEO: unique `<title>` ≤ 60, description ≤ 155 (measured *rendered*, so `&amp;` counts as 1), absolute canonical, OG/Twitter, and the right JSON-LD types. Keep the meta description, og:description, twitter:description, and JSON-LD description in sync.

**JS**
- Vanilla ES, no dependencies, no leaking globals (wrap in an IIFE/module). One implementation per behaviour in `assets/js/`, imported by every page.
- Progressive enhancement: the page works with JS off; JS only enhances. Guard against missing elements (`const el = …; if (!el) return;`). Dropdowns stay keyboard-accessible and degrade to links.
- Respect `prefers-reduced-motion`.

**Accessibility**
- `:focus-visible` states, skip-link to `#main-content`, ARIA on dropdowns, `.visually-hidden` for screen-reader-only text, WCAG AA contrast (the warm palette passes  don't introduce off-token colors that fail).

**Security (forms / any input)**
- Escape all dynamic output; never trust input; honeypot + validation on the contact form; no secrets in the repo.

## Where things live (the one-source map)

| Concern | Single source |
|---|---|
| Colors, fonts, spacing tokens | `assets/css/tokens.css` |
| Reset, typography, layout primitives | `assets/css/base.css` |
| Buttons, cards, nav, footer, sections, forms | `assets/css/components.css` |
| Dropdown + mobile menu | `assets/js/nav.js` |
| Scroll reveals | `assets/js/reveal.js` |
| Contact form logic | `assets/js/forms.js` |
| Canonical chrome markup | `partials/header.html`, `partials/footer.html` (mirror into every page) |

## Change-type playbook

- **New section/component on an existing page** → reuse `.section` + existing card/button classes; add tokens only if a genuinely new value is needed; no new CSS file.
- **New shared style** → add to `components.css` using tokens; never inline.
- **New behaviour** → new IIFE in `assets/js/`, included on the pages that need it, guarded for missing elements.
- **Nav/footer edit** → edit the partials AND every page's copy identically; run the DRY-drift test to confirm zero drift.
- **Copy/meta change** → route wording to `codimai-content`; keep all four description mirrors in sync; re-audit.
- **Bug fix** → reproduce, fix at the source (not a patch over a symptom), then run the full test suite.
- **A whole new page** → don't use this skill alone; hand off to `codimai-page-builder` (gated workflow). This skill governs the code quality *within* that build.

## Definition of done (CLAUDE.md §8)
Tokens-only · one `<h1>` + semantic landmarks · unique title/description/canonical/OG/JSON-LD · shared chrome (no drift) · responsive 360/768/1280 · images optimized + alt + lazy · no duplicated markup/CSS/JS · test gate green · SEO/GEO audit high. If any box is unchecked, it isn't done.
