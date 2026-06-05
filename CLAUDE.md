# CLAUDE.md  CodimAI Website

Guidance for Claude (and any contributor) when building or editing the CodimAI website. Read this file first, every session, before writing code. It is the contract for structure, brand, stack, and quality.

---

## 1. Project summary

CodimAI is a frontier-AI / spatial-intelligence product company. This repo is its marketing website plus a PHP-backed blog. The site must feel like a calm, premium research lab  **SEO-first and visually eye-catching**  following the CodimAI brand system at all times.

**Non-negotiables (in priority order):**
1. **SEO first**  every page is built for discoverability before anything else (see §6).
2. **Brand fidelity**  follow the `codimai-brand` skill exactly (see §4). Never invent colors or fonts.
3. **DRY**  no copy-pasted markup, styles, or logic. Shared things live in one place (see §5).
4. **Accessibility & performance**  semantic HTML, fast loads, Core Web Vitals green.

---

## 2. Site map (5 top-level destinations)

The primary navigation has exactly **5 destinations**. The two "dropdown" destinations expand to in-page sections (anchor links on their parent page), not separate top-level pages  this keeps the IA shallow and SEO-clean.

| # | Nav label | Type | Page file | Contents / sections |
|---|-----------|------|-----------|---------------------|
| 1 | **Home** | Page | `index.html` | Hero, mission statement, capabilities overview, featured agents, latest blog teasers, closing CTA |
| 2 | **AI** | Dropdown → page with anchored sections | `ai.html` | `#agentic-ai`, `#generative`, `#insights`, `#recommendation`, `#prediction`, `#data-analytics` |
| 3 | **Agents** | Dropdown → page with anchored sections | `agents.html` | `#whatsapp`, `#email`, `#google-review`, `#blogs-agent` |
| 4 | **Blogs** | Page (PHP-driven) | `blogs/index.php` | Blog index/listing + individual post template (`blogs/post.php`) |
| 5 | **Get Started** | Page / CTA | `get-started.html` | Conversion page: value prop, plan/contact form, primary CTA |

### Dropdown contents (exact items)

**AI dropdown** → anchors on `ai.html`:
- Agentic AI → `ai.html#agentic-ai`
- Generative → `ai.html#generative`
- Insights → `ai.html#insights`
- Recommendation → `ai.html#recommendation`
- Prediction → `ai.html#prediction`
- Data Analytics → `ai.html#data-analytics`

**Agents dropdown** → anchors on `agents.html`:
- WhatsApp → `agents.html#whatsapp`
- Email → `agents.html#email`
- Google Review → `agents.html#google-review`
- Blogs Agent → `agents.html#blogs-agent`

> If the client later wants each dropdown item as its own URL for deeper SEO, promote anchors to standalone pages (e.g. `ai/agentic-ai.html`) and keep this table as the source of truth. Do not do this unless asked.

---

## 3. Tech stack & file layout

- **Marketing pages:** static **HTML5 + CSS3 + vanilla JS**. No framework. Add JS only where it earns its place (nav dropdown, mobile menu, scroll reveals, form handling).
- **Blog system:** **PHP** (server-rendered). Posts can come from flat files (Markdown/JSON) or a DB  keep the data layer abstracted behind one include so it can swap later.
- **No build step required** to view pages. If a bundler/minifier is added later, it must not change source structure.

```
/
├── CLAUDE.md                  ← this file
├── index.html                 ← Home
├── ai.html                    ← AI page (anchored sections)
├── agents.html                ← Agents page (anchored sections)
├── get-started.html           ← Get Started
├── assets/
│   ├── css/
│   │   ├── tokens.css         ← brand tokens (from codimai-brand skill)  SINGLE SOURCE OF TRUTH
│   │   ├── base.css           ← reset, typography, layout primitives
│   │   └── components.css     ← buttons, cards, nav, footer, sections
│   ├── js/
│   │   ├── nav.js             ← dropdowns + mobile menu (one implementation)
│   │   ├── reveal.js          ← scroll-in animations
│   │   └── forms.js           ← Get Started / contact form
│   └── img/                   ← optimized imagery (WebP/AVIF + fallbacks)
├── partials/                  ← shared HTML fragments (see §5 DRY)
│   ├── head.html              ← <head> meta template (variables filled per page)
│   ├── header.html            ← nav + dropdowns
│   └── footer.html            ← footer + socials
└── blogs/
    ├── index.php              ← listing
    ├── post.php               ← single post template
    ├── includes/
    │   ├── head.php           ← shared <head> (mirrors partials/head.html)
    │   ├── header.php         ← shared nav (mirrors partials/header.html)
    │   ├── footer.php         ← shared footer
    │   └── data.php           ← post data access layer (swap-able source)
    └── posts/                 ← post content (md/json) OR DB-backed
```

**Important:** the static partials and the PHP includes render **identical** nav/header/footer markup. To stay DRY, treat the PHP includes as canonical and generate/copy the static partials from them, or document clearly that any nav change must be applied in both. Prefer making the whole site PHP if the host supports it, so there is literally one header/footer.

---

## 4. Brand system  use the `codimai-brand` skill

**Always apply the `codimai-brand` skill** for any visual decision. Do not hardcode colors or fonts from memory. Summary of the rules it enforces (the skill + its `tokens.css` are authoritative):

- **Aesthetic:** light, warm, editorial, imagery-led (grounded in the real worldlabs.ai). Nearly monochrome UI; color comes from large 3D-world imagery, not from buttons/gradients/glow.
- **Backgrounds:** canvas `#F7F5F0`, surface `#FFFFFF`, soft section `#EFEDE6`, dark feature block `#1A1A18`.
- **Text:** headings `#1A1A18`, body `#3A3A36`, muted `#86847C`. On dark blocks: `#F7F5F0` / `#C9C6BD`. Never pure `#000`/`#FFF`.
- **Links/CTAs:** near-black with underline  no bright accent link color.
- **Fonts:** Gilda Display (display serif, weight 400) for hero/statements; Inter / Hanken Grotesk for body & UI; JetBrains Mono for small technical labels. Load via Google Fonts.
- **Buttons:** primary = solid `#1A1A18` fill + `#F7F5F0` text, 8px radius, quiet opacity hover (no glow/bounce). Secondary = transparent + thin border / underline.
- **Spacing:** generous (section padding 96–140px), lots of whitespace, gentle 8–12px corners.
- **Motion:** subtle fades / slow reveals only.
- **Voice:** intelligent, calm, confident. No hype words, no emoji.

`assets/css/tokens.css` must be the copy of the skill's token file. All other CSS references those variables  never literal hex values elsewhere.

---

## 5. DRY principle (enforced)

- **One source per concern.** Nav, header, footer, `<head>` meta, button styles, card styles, section wrappers each have exactly one definition. Pages compose them; they never re-declare them.
- **No literal hex/font values** outside `tokens.css`. Everything else uses CSS custom properties (`var(--cd-ink)` etc.).
- **No duplicated JS.** The dropdown logic, mobile menu, and reveal observer each exist once in `assets/js/` and are imported by every page.
- **Reusable section component.** Build one `.section` pattern (eyebrow + serif heading + body + optional imagery) and reuse it for all AI/Agents sub-sections rather than bespoke markup per item.
- **Data-driven repetition.** The AI capabilities, the Agents list, and blog cards are arrays of data rendered through one template/loop  not hand-written blocks. In PHP, loop over the data layer; in static HTML, keep the markup pattern identical and minimal.
- **Shared SEO meta:** `head` partial takes per-page variables (title, description, canonical, OG image) so meta tags are defined once and parameterized.

---

## 6. SEO requirements (first-class)

Every page must ship with:

- **Unique `<title>`** (≤ 60 chars) and **meta description** (≤ 155 chars), per page, keyword-aware but human.
- **Semantic HTML5**: one `<h1>` per page, logical `<h2>`/`<h3>` hierarchy, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`.
- **Canonical URL** tag on every page; anchored sections do not get duplicate canonicals.
- **Open Graph + Twitter Card** meta (title, description, image) via the shared `head` partial.
- **Structured data (JSON-LD)**: `Organization` on Home; `WebSite` + `SearchAction`; `BlogPosting` on each blog post; `BreadcrumbList` where nested.
- **Sitemap.xml** and **robots.txt** at root; blog posts auto-included in the sitemap (PHP-generated).
- **Performance = SEO:** optimized images (WebP/AVIF, explicit width/height to avoid CLS, `loading="lazy"` below the fold), `font-display: swap`, minimal render-blocking CSS/JS, defer non-critical JS.
- **Accessibility (also ranking-relevant):** alt text on all imagery, focus states, ARIA on the dropdown menus, color contrast meets WCAG AA (the warm-neutral palette already passes  verify).
- **Clean URLs**: blog uses readable slugs (`/blogs/my-post-title`), not query strings, via PHP routing/rewrite.
- **Internal linking:** Home links to AI, Agents, Blogs, Get Started; blog posts link back to relevant AI/Agents sections.

---

## 7. Engineering best practices

- **Semantic, valid, accessible HTML.** Validate; no div-soup where a semantic element fits.
- **Progressive enhancement.** Pages work without JS; JS enhances (dropdowns are keyboard-accessible and degrade to links).
- **Mobile-first responsive** CSS; test at 360px, 768px, 1280px.
- **CSS:** custom properties for theming, logical layout with Flexbox/Grid, no `!important`, BEM-ish or utility-consistent class naming  pick one and stay consistent.
- **JS:** small, dependency-free, modular ES, no globals leaking; guard against missing elements.
- **PHP:** separate data/logic from presentation; escape all output (`htmlspecialchars`) to prevent XSS; never trust form input; prepared statements if a DB is used.
- **Security:** sanitize the Get Started form; CSRF token on POST; no secrets in the repo.
- **Comments** explain *why*, not *what*. Keep them sparse and useful.
- **Consistency over cleverness.** Match existing patterns in the repo before introducing new ones.

---

## 8. Definition of done (check before finishing any page)

- [ ] Uses `codimai-brand` tokens only  no stray hex/fonts.
- [ ] Single `<h1>`, correct heading hierarchy, semantic landmarks.
- [ ] Unique title + description + canonical + OG/Twitter + relevant JSON-LD.
- [ ] Nav/header/footer come from the shared partial/include (not re-written).
- [ ] Responsive at 360 / 768 / 1280; dropdowns keyboard-accessible.
- [ ] Images optimized, sized, alt-texted, lazy-loaded below the fold.
- [ ] No duplicated markup/CSS/JS that should be shared (DRY pass done).
- [ ] Lighthouse: Performance, SEO, Accessibility, Best Practices all high (aim ≥ 95).

---

## 9. Build order (suggested)

1. `assets/css/tokens.css` (from the brand skill) → `base.css` → `components.css`.
2. Shared `head` / `header` / `footer` partials (or PHP includes)  get nav + dropdowns + SEO meta right once.
3. `index.html` (Home) as the pattern-setter.
4. `ai.html` and `agents.html` using the reusable section + data-driven loops.
5. `get-started.html` with the form + validation.
6. `blogs/` PHP system (data layer → listing → single post → sitemap).
7. SEO pass: sitemap.xml, robots.txt, JSON-LD, meta audit, Lighthouse.