# Build checklist — run before requesting Stage 4 approval

All boxes must be ticked. If anything fails, fix it before showing the page to the user.

## Brand fidelity (codimai-brand)
- [ ] Zero literal hex values outside `tokens.css` — every color is `var(--cd-*)`
- [ ] Fonts are Gilda Display (display) / Inter (body) / JetBrains Mono (mono) only
- [ ] No gradients on backgrounds
- [ ] No glow shadows anywhere
- [ ] No pure `#000` or `#FFF` text
- [ ] Buttons are ink-fill primary or transparent secondary — no colored CTAs

## Design fidelity (codimai-design)
- [ ] Only the seven approved UI moments are used
- [ ] Hero composition matches the spec (eyebrow → headline → sub → CTAs → image)
- [ ] One `.section--dark` block, used once, near the end
- [ ] All sections use the standard `.section` + `.container` + `.section__head` pattern
- [ ] Cards are the standard `.card` primitive; no bespoke card markup
- [ ] Card hover changes border tone only — no transforms, no shadows
- [ ] `data-reveal` applied to headings and section blocks
- [ ] Sticky nav has hairline-on-scroll behavior
- [ ] Dropdowns are keyboard accessible (Tab + Esc work)
- [ ] Focus-visible outline is present and styled per spec
- [ ] `prefers-reduced-motion` is respected

## Content fidelity (codimai-content)
- [ ] All copy on the page matches the approved `content.md` verbatim
- [ ] Exactly one `<h1>`, matching the hero headline
- [ ] H2/H3 hierarchy logical, no skipped levels
- [ ] No hype words, no emoji, no exclamation marks
- [ ] FAQ block present if spec required it
- [ ] All buttons use approved verb-led microcopy

## SEO
- [ ] `<title>` ≤ 60 chars and matches `content.md`
- [ ] `<meta name="description">` ≤ 155 chars and matches `content.md`
- [ ] Canonical link present
- [ ] Open Graph + Twitter Card meta present
- [ ] All JSON-LD blocks from spec are present and valid (validate with schema.org validator)
- [ ] All images have width, height, alt, and below-the-fold images have loading="lazy"
- [ ] Fonts loaded with preconnect + display=swap
- [ ] New URL added to sitemap.xml
- [ ] No robots.txt block for this URL

## Accessibility
- [ ] Semantic landmarks present (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- [ ] Color contrast meets WCAG AA (verify dark-block text especially)
- [ ] All interactive elements reachable by keyboard
- [ ] All icons have `aria-hidden` or `aria-label` as appropriate
- [ ] Forms have proper labels (if any)

## Performance
- [ ] Lighthouse (desktop): Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100
- [ ] Hero image preloaded; total page weight < 1.5 MB
- [ ] No render-blocking JS; scripts use `defer`

## Responsive
- [ ] Verified at 360px (mobile)
- [ ] Verified at 768px (tablet)
- [ ] Verified at 1280px (desktop)
- [ ] All touch targets ≥ 44×44px
- [ ] No horizontal scroll at any width

## DRY
- [ ] No styles in `page-*.css` that duplicate `components.css`
- [ ] No copy-pasted markup that should be a reusable component
- [ ] Header + footer come from the shared partial/include

## Git
- [ ] On branch `page/[slug]`
- [ ] Files staged, not committed
- [ ] `git status` looks clean (no stray files)
