# Page spec — [Page Name]

> Spec for the page. Bridges approved `content.md` and the build. Anyone reading this file should be able to build the page without re-deciding anything.

## 1. Page metadata
- **Slug:** `/[lowercase-hyphenated]`
- **File:** `[path/to/page.html or .php]`
- **Page type:** [Marketing / Product / Feature / Blog / Conversion]
- **Primary keyword:** [from content.md]
- **Secondary keywords:** [from content.md]
- **Meta title:** [from content.md]
- **Meta description:** [from content.md]
- **Canonical URL:** `https://codimai.com/[slug]`

## 2. Section map (content → design)

Each row maps an approved content chunk to a section type from `codimai-design`'s section catalogue.

| # | Section ID | Content source | Section type | Notes |
|---|------------|----------------|--------------|-------|
| 1 | `hero` | content.md → Hero | Hero | Image: [describe] |
| 2 | `statement` | content.md → Statement | Statement | Optional |
| 3 | `capabilities` | content.md → Capabilities | `.grid--3` of `.card` | Numbered 01–0N |
| … | … | … | … | … |
| N | `closing` | content.md → Closing CTA | `.section--dark` | Exactly one per page |

## 3. Components used (reuse map)

List every reusable class/component this page touches. If a component does NOT exist yet in `assets/css/components.css`, flag it as **NEW**.

| Component | Source | New or reused? |
|-----------|--------|----------------|
| `.nav` | components.css | reused |
| `.btn--primary` | components.css | reused |
| `.card` | components.css | reused |
| `.[anything-new]` | components.css | **NEW** — describe |

## 4. Brand tokens used

Only list tokens already defined in `assets/css/tokens.css`. If a value is needed that doesn't exist, escalate — do not invent one.

- Backgrounds: `--cd-canvas`, `--cd-soft`, `--cd-ink-block`
- Text: `--cd-ink`, `--cd-body`, `--cd-muted`, `--cd-on-dark`
- Borders: `--cd-border`, `--cd-border-strong`
- Radius: `--cd-radius-sm`, `--cd-radius`
- Fonts: `--cd-font-display`, `--cd-font-body`, `--cd-font-mono`

## 5. Responsive behavior

Document any non-default breakpoint behavior. Default rules from `codimai-design` apply unless overridden here.

- Desktop ≥ 1024px: [grid layout]
- Tablet 640–1023px: [layout shift, if any]
- Mobile < 640px: [layout shift, if any]
- Hero headline size at each breakpoint: [if non-default]

## 6. SEO + schema

- `<title>`: [from content.md]
- `<meta name="description">`: [from content.md]
- `<link rel="canonical">`: [URL]
- Open Graph: title, description, image (`[og-image-path]`)
- Twitter Card: `summary_large_image`
- **JSON-LD blocks to include:**
  - [ ] `Organization` (Home only)
  - [ ] `WebPage`
  - [ ] `BreadcrumbList` (if nested)
  - [ ] `FAQPage` (if FAQ block present)
  - [ ] `BlogPosting` (blog only)

## 7. Internal links

| From section | To page / anchor | Anchor text |
|--------------|------------------|-------------|
| Capabilities → Agentic AI card | `/ai.html#agentic-ai` | "Agentic AI" |
| FAQ → related capability | `/[target]` | [descriptive] |

## 8. Imagery

| Slot | Description | Filename | Alt text | Dimensions |
|------|-------------|----------|----------|------------|
| Hero | [3D-world render description] | `hero-[slug].webp` | [meaningful alt] | 1600×700 |
| [other] | … | … | … | … |

## 9. Open questions / decisions to confirm

Anything that needs the user's input before build. List as questions; resolve before declaring this spec approved.

- [ ] [Open question, if any]

## 10. Definition of done for this page

- [ ] Every approved content chunk has a section in the map
- [ ] Every section uses an existing component, or a new one is explicitly flagged
- [ ] All tokens reference existing CSS variables
- [ ] Responsive behavior documented for 360 / 768 / 1280
- [ ] SEO + schema block is complete
- [ ] All internal links resolve to real pages/anchors
- [ ] All imagery has filenames + alt text + dimensions
