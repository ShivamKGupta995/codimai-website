# Dev plan — WhatsApp Agent

> File-by-file plan to **rebuild** `agents/whatsapp.html` into the product showcase defined in `spec.md`. Executed verbatim at Stage 4.

## 0. Pre-flight
- [x] `content.md` approved
- [x] `spec.md` approved
- [ ] Branch `page/whatsapp` created at start of Step 2.1
- Note: page **already exists** and is **already in `sitemap.xml`** (line 19) → no sitemap change needed.

## 1. Files to create / modify

| # | File | Action | Why |
|---|------|--------|-----|
| 1 | `agents/whatsapp.html` | OVERWRITE | The rebuilt page |
| 2 | `assets/css/components.css` | MODIFY | Append the NEW `.wa-*` components (spec §3) |
| 3 | `assets/js/whatsapp-hero.js` | CREATE | Hero routing-graph canvas |
| 4 | `assets/js/whatsapp-chat.js` | CREATE | Animated phone scripted conversation |
| 5 | `.claude/pages/whatsapp/notes.md` | CREATE | Decisions log |
| — | `sitemap.xml` | no change | URL already present |
| — | `assets/img/*` | no change | visuals are canvas + CSS |

## 2. Build steps (in order)

### Step 2.1 — Branch
```bash
git checkout -b page/whatsapp
```

### Step 2.2 — `whatsapp-hero.js` (canvas)
Adapt `agentic-hero.js` structure (proven, brand-correct). Change only the graph:
- NODES: `Contact A/B/C` (tier `io`, left, fy spread) → `Agent` (tier `cog`, center) → actions `Reply`, `Template`, `Catalog`, `Flow`, `Form`, `CRM / API` (tier `dec`/`io`, right column, fy spread).
- EDGES: each contact → Agent; Agent → each action; one feedback `CRM/API → Agent`.
- ZONES (optional faint backdrops): `// INBOUND`, `// AGENT`, `// ACTIONS`.
- Keep all helpers verbatim: `resize`, `px`, `nodeRadius`, `cp`, `bezAt`, `spawnPulse`, `rrect`, `drawZone/Edge/Node/Pulse`, `frame`, popup machinery, `visibilitychange` pause, `W`-scaled sizes. Canvas id `whatsapp-canvas`.

### Step 2.3 — `whatsapp-chat.js` (phone)
Self-contained IIFE driving the `#wa-thread` element:
- SCRIPT array of steps: `{type:'in'|'out'|'quick'|'catalog'|'form', ...}` modelling: inbound "Hi, do you deliver to my area?" → typing → agent reply → quick-reply buttons (`Track order`, `Browse menu`, `Talk to human`) → user taps `Browse menu` → catalog card → user taps `Order now` → in-chat form card (Name / Address / Pay) → confirmation bubble.
- Renders bubbles by appending `.wa-msg` nodes; typing indicator `.wa-typing` shown ~900ms before each agent bubble; auto-scroll thread to bottom.
- Loop: after final step, pause ~2.5s, clear, restart.
- Start via `IntersectionObserver` (threshold 0.4) so it only animates in view; pause on `document.hidden`.
- `prefers-reduced-motion: reduce` → render the full final conversation once, no typing, no loop.
- Guard: `if (!thread) return;`.

### Step 2.4 — `components.css` (append NEW `.wa-*` block)
Add one commented section `/* ===== WhatsApp agent — phone preview ===== */`. Tokens only (spec §4). Includes:
- `.wa-preview` (`min-height:100vh; scroll-snap-align:start; display:flex; align-items:center`), `.wa-preview__inner` (grid 1fr / 360px, gap 56px, align-items center), `.wa-preview__copy`.
- `.wa-phone` (frame: `--cd-ink-block` bg, radius ~38px, padding ~10px, max-width 340px, margin auto, subtle border), `.wa-phone__notch`, `.wa-phone__bar` (avatar + name + sub on `--cd-canvas`), `.wa-phone__avatar`, `.wa-phone__name`, `.wa-phone__sub`, `.wa-phone__thread` (scrollable, `--cd-canvas` bg, fixed height ~440px, `overflow:hidden`, column flex, gap 8px, padding 14px).
- `.wa-msg` (max-width 78%, padding 8px 12px, radius 14px, font 14px, line-height 1.45), `.wa-msg--in` (`--cd-surface` bg, `--cd-border`, align-self start), `.wa-msg--out` (`--cd-ink-block` bg, `--cd-on-dark`, align-self end), `.wa-msg__time` (mono 10px, `--cd-muted`).
- `.wa-typing` (3 dots, gentle opacity keyframe `wa-blink`), respects reduced-motion.
- `.wa-quick` (flex wrap, gap 8px, align-self start), `.wa-quick__btn` (transparent, `--cd-border`, `--cd-ink`, radius 16px, min-height 36px, font 13px).
- `.wa-catalog` (card: `--cd-surface`, border, radius 12px), `.wa-catalog__img` (aspect 16/9, `--cd-soft` placeholder block), `.wa-catalog__name`, `.wa-catalog__price` (mono).
- `.wa-formcard` (`--cd-surface`, border, radius 12px, small field rows), `.wa-formcard__row` (label + faux input line using `--cd-soft`).
- Responsive: `@media (max-width:1023px){ .wa-preview__inner{grid-template-columns:1fr} .wa-phone{margin-top:8px} }` and `@media (max-width:639px){ .wa-phone{max-width:300px} }`.
- Keyframes guarded by `@media (prefers-reduced-motion: no-preference)`.

### Step 2.5 — `agents/whatsapp.html` (overwrite)
Reuse the **existing file's** `<head>` chrome, header, mobile overlay, closing CTA + footer (they're already correct — WhatsApp marked `aria-current`). Changes:
1. **Head:** update `<title>` and all description/OG/Twitter strings to spec §1 (new copy). Replace FAQ JSON-LD with the **6** questions from content.md. Keep WebPage + BreadcrumbList (already correct).
2. **Hero:** add the right-column `.hero--anim` with `<canvas id="whatsapp-canvas" class="hero__anim-canvas">` (current hero has none). Update eyebrow/headline/sub/CTAs to content.md (headline italic on "WhatsApp").
3. **Statement:** new mission text from content.md.
4. **`#capabilities`:** `.grid--3` of **6** `.card` (01–06) from content.md. Smart-replies card links "agentic AI capabilities" → `../ai/agentic-ai.html`.
5. **`#preview`:** NEW `.wa-preview.section--soft` — copy left (eyebrow `// Live preview`, h2, two body paras, CTA), phone right with `role="img"` + `aria-label` and `#wa-thread`.
6. **`#builder`:** `.section` + `.section__head` + `.process-list` (3 items) from content.md.
7. **`#integrations`:** `.section.section--dense` + `.section__head` (lead links "data analytics" → `../ai/data-analytics.html`) + `.grid--2` of 4 `.card` (CRM, E-commerce, Helpdesk, Internal dashboards).
8. **`#how`:** `.section.section--soft.section--dense` + `.process-list` (3) from content.md.
9. **`#faq`:** 6 `<details>` mirroring JSON-LD.
10. **Closing + footer:** keep verbatim, update CTA copy to content.md ("Meet your customers where they already are" / body / "Book your audit").
11. **Scripts:** keep `nav.js`, `reveal.js`; **add** `whatsapp-hero.js` and `whatsapp-chat.js` (both `defer`). Keep footer-year inline script.
- One `<h1>` (hero) only. Each section keeps a single `<h2>`; cards/process use `<h3>`. All `id`s present for in-page integrity.
- `reveal` classes + `--delay` on hero/section heads/cards as in agentic page.

### Step 2.6 — `notes.md`
Log: rebuild (not new), monochrome-phone decision + green-token escape hatch, two new JS files, no new image/sitemap.

## 3. Self-check (run before done) — `build-checklist.md`
- Single `<h1>`; h2/h3 order; landmarks (`header`/`main`/`footer`/`nav`/`section`).
- No literal hex in `components.css` `.wa-*` block (tokens only); canvas JS literals allowed (mirrors agentic-hero precedent).
- Meta title ≤60, description ≤155; canonical/OG/Twitter present; FAQ JSON-LD count == rendered `<details>` count (6).
- All internal links resolve (`../ai/agentic-ai.html`, `../ai/data-analytics.html`, `../get-started.html`, siblings).
- Responsive 360/768/1280: grids + `.wa-preview` stack; phone fits.
- `prefers-reduced-motion` honored (canvas + phone).
- Reveal/animation pause on hidden tab.
- `grep` other HTML files: WhatsApp link is already standalone `agents/whatsapp.html` everywhere — confirm no stale `agents.html#whatsapp` anchors remain.

## 4. Files to stage for commit
```
git add agents/whatsapp.html
git add assets/css/components.css
git add assets/js/whatsapp-hero.js
git add assets/js/whatsapp-chat.js
git add .claude/pages/whatsapp/
```

## 5. Commit message (Stage 5 only)
```
feat(pages): rebuild whatsapp agent page

- Rebuild /agents/whatsapp into a full product showcase
- Add hero routing-graph canvas (whatsapp-hero.js)
- Add animated phone live-preview (whatsapp-chat.js + .wa-* components)
- Sections: capabilities, live preview, flow/form builder, integrations
- Content, spec, and plan in .claude/pages/whatsapp/
```

## 6. Out of scope
- [ ] Real WhatsApp Business API integration / backend (marketing page only)
- [ ] Literal WhatsApp-green theming (needs a new brand token — not added unless requested)
- [ ] Functional flow-builder UI (the page demonstrates the concept, not a live editor)
- [ ] New OG image (reuses `og-default.png`)
