# Notes — WhatsApp Agent

## Decisions
- **Rebuild, not new page.** `agents/whatsapp.html` already existed (minimal). Overwritten with the product showcase. Already present in `sitemap.xml` (line 19) → no sitemap change. No new OG image → reuses `og-default.png`.
- **Phone is on-brand monochrome**, not neon WhatsApp green. Incoming bubble = `--cd-surface`; outgoing = `--cd-ink-block` / `--cd-on-dark`. Honors the strict near-monochrome brand rule and avoids inventing a colour/token (spec §4). *Escape hatch:* if the client insists on literal WhatsApp green, add one accent token to `tokens.css` and recolour `.wa-msg--out` + `.wa-catalog__img`.
- **Two new JS files**, both `defer`:
  - `whatsapp-hero.js` — hero routing-graph canvas, adapted from the proven `agentic-hero.js` engine (same helpers, W-scaling, popup-expand, tab-pause).
  - `whatsapp-chat.js` — scripted phone conversation; IntersectionObserver start, hidden-tab pause, `prefers-reduced-motion` → static final render.
- **No `process-scroll.js`** — used plain `.process-list` (lighter) rather than the heavy `.process-step-section` from the agentic page.

## New components (in `components.css`)
`.wa-preview*`, `.wa-phone*`, `.wa-msg*`, `.wa-typing` (+ `@keyframes wa-blink`), `.wa-quick*`, `.wa-catalog*`, `.wa-formcard*`. Tokens-only; no literal hex.

## Revisions during build (user feedback)
- **Phone preview → authentic WhatsApp look.** First pass was on-brand monochrome; user wanted the real WhatsApp feel. Added scoped `--wa-*` tokens to `tokens.css` (green header, beige doodle wallpaper, white incoming / light-green outgoing bubbles with tails, blue read-ticks, blue quick-reply pills). Kept all literal hex inside `tokens.css` per the DRY rule.
- **How-it-works UI upgraded** from a plain `.process-list` (looked identical to the builder section) to a `.how-steps` stepped timeline: numbered badges on a connecting hairline + line icons.
- **Hero canvas redesigned** from a node-graph (too similar to the other agent pages) to a "growth through conversations" chart — self-drawing upward curve, climbing message bubbles, live conversations counter. More eye-catching and business-growth-oriented while staying within the canvas-hero guideline.

## Content reframe
Per user note ("not 'AI will make' — show this can be done"): leads are capability-led ("What you can do on WhatsApp", "Smart replies"), warmer wording, no over-promising AI-does-everything framing.
