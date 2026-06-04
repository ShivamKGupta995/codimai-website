# Dev plan — [Page Name]

> File-by-file, step-by-step plan for building this page. Each step is small enough to verify in isolation. The build stage executes this verbatim.

## 0. Pre-flight

- [ ] `content.md` is approved
- [ ] `spec.md` is approved
- [ ] Branch `page/[slug]` will be created at start of Step 1

## 1. Files to create / modify

| # | File | Action | Why |
|---|------|--------|-----|
| 1 | `[page].html` (or `[page].php`) | CREATE | The page itself |
| 2 | `assets/css/components.css` | MODIFY (if NEW components) | Add reusable components per spec §3 |
| 3 | `assets/css/page-[slug].css` | CREATE (only if truly page-unique) | Page-only styles |
| 4 | `.claude/pages/[slug]/notes.md` | CREATE | Decisions log |
| 5 | `sitemap.xml` | MODIFY | Add new URL |

## 2. Build steps (in order)

### Step 2.1 — Branch + scaffold
```bash
git checkout -b page/[slug]
```
Create the empty page file with `<!DOCTYPE html>`, `<head>` shell, and `<main>` shell. Pull in `tokens.css`, `base.css`, `components.css`.

### Step 2.2 — Head (SEO + fonts + schema)
Add per `spec.md` §6:
- `<title>`, `<meta description>`, `<link canonical>`
- Open Graph + Twitter Card meta
- Google Fonts preconnect + stylesheet
- JSON-LD blocks listed in spec

### Step 2.3 — Header partial
Include shared `<header class="nav">` from partials. Verify nav links match site IA.

### Step 2.4 — Hero
Build the hero per `codimai-design` hero spec, using approved content from `content.md`. Include the hero image slot.

### Step 2.5 — Each content section, in order
For each section in `spec.md` §2:
- Compose using the section type from the design catalogue
- Paste content verbatim from `content.md`
- Add `data-reveal` attributes per design rules
- Add the section's `id` so dropdown anchors work

### Step 2.6 — FAQ block (if applicable)
Add `<details>` accordion or equivalent. Wrap content with `FAQPage` JSON-LD.

### Step 2.7 — Dark closing CTA + footer
One `.section--dark` block. Then shared `<footer class="footer">`.

### Step 2.8 — JS
Confirm `nav.js` and `reveal.js` are loaded with `defer`. Add page-specific JS only if absolutely required.

### Step 2.9 — Imagery
Drop optimized images per `spec.md` §8 into `assets/img/`. Confirm width/height/alt are set on every `<img>`.

### Step 2.10 — Sitemap + internal links
Add the new URL to `sitemap.xml`. Verify all internal links from `spec.md` §7 resolve.

## 3. Self-check (run before declaring done)

Use `build-checklist.md`. All boxes must pass.

## 4. Files to stage for commit

```
git add [page].html
git add assets/css/components.css     # if modified
git add assets/css/page-[slug].css    # if created
git add assets/img/[new images]
git add sitemap.xml
git add .claude/pages/[slug]/
```

## 5. Commit message (do not commit until Stage 5 approval)

```
feat(pages): add [slug] page

- New page at /[slug]
- Content, spec, and plan in .claude/pages/[slug]/
- [New components added to components.css, if any]
- [Imagery added]
```

## 6. Out of scope for this PR

List anything explicitly NOT included so reviewers know:
- [ ] [e.g. Backend form handling for the contact form — handled in separate PR]
- [ ] [e.g. Translations — Phase 2]
